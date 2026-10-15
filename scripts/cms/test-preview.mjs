// Checks of the CMS on a REMOTE Vercel Preview. The Preview is behind Vercel Deployment Protection: the
// "Protection Bypass for Automation" secret is read from .env.local (VERCEL_AUTOMATION_BYPASS_SECRET) and sent only
// as a request header — never printed, never stored in the project.
// No real lead / brief is sent: the form APIs are checked with requests that must be refused before Telegram.
// At the end the drafts are reset to src/content and published, so the shared database is left as it was.
// usage: node scripts/cms/test-preview.mjs <previewUrl> <outDir>
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { root } from "./jiti.mjs";
import { loadEnv, redact } from "./env.mjs";

loadEnv();
const [BASE, OUT] = process.argv.slice(2);
const BYPASS = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
if (!BYPASS) {
  console.error("VERCEL_AUTOMATION_BYPASS_SECRET is not set in .env.local — the protected Preview cannot be tested.");
  process.exit(2);
}
fs.mkdirSync(OUT, { recursive: true });
const req = createRequire(path.join(root, "package.json"));
const { chromium, webkit, devices } = req("playwright");
const sharp = req("sharp");
const H = { "x-vercel-protection-bypass": BYPASS };
const out = [];
const check = (name, ok, extra = "") => {
  out.push(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? " — " + redact(extra) : ""}`);
  console.log(out.at(-1));
};
const get = (p, init = {}) => fetch(BASE + p, { ...init, headers: { ...H, ...(init.headers ?? {}) }, redirect: init.redirect ?? "follow" });
const html = async (p) => (await get(p, { cache: "no-store" })).text();
const ctxOpts = (extra = {}) => ({ ...extra, extraHTTPHeaders: { ...H, "x-vercel-set-bypass-cookie": "true" } });
const rx = (l) => new RegExp("^" + l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "( \\*)?$");

// ---------- reachability / public pages / SEO / secrets ----------
const pages = ["/", "/en", "/privacy", "/en/privacy-policy", "/brief", "/en/brief", "/thank-you", "/en/thank-you"];
const statuses = await Promise.all(pages.map(async (p) => [p, (await get(p)).status]));
check("Preview reachable with the bypass header; 8 public pages answer 200", statuses.every(([, s]) => s === 200), statuses.filter(([, s]) => s !== 200).map(([p, s]) => `${p}:${s}`).join(" "));
const home = await html("/");
const homeEn = await html("/en");
check("UA home renders published content + SEO (title, canonical, hreflang, JSON-LD)", /<title>Створення сайтів/.test(home) && home.includes('rel="canonical"') && home.includes('hreflang="en"') && home.includes("application/ld+json") && home.includes("FAQPage"));
check("EN home renders (title, lang)", /<title>Turnkey Website/.test(homeEn) && /<html lang="en"/.test(homeEn));
check("robots.txt and sitemap.xml", (await get("/robots.txt")).status === 200 && (await get("/sitemap.xml")).status === 200);
const secretNames = ["ADMIN_PASSWORD", "ADMIN_SESSION_SECRET", "SUPABASE_SECRET_KEY", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_DB_URL", "VERCEL_AUTOMATION_BYPASS_SECRET"];
const leaks = [];
for (const p of [...pages, "/admin/login"]) {
  const t = await html(p);
  for (const n of secretNames) if (process.env[n] && process.env[n].length >= 8 && t.includes(process.env[n])) leaks.push(`${n} in ${p}`);
  if (/sb_secret_[A-Za-z0-9_-]{10,}/.test(t)) leaks.push(`secret-key pattern in ${p}`);
}
check("no secrets in the HTML of public pages and the login page", leaks.length === 0, leaks.join("; "));

// ---------- admin protection ----------
const r1 = await get("/admin", { redirect: "manual" });
check("/admin without a session → login page", r1.status >= 300 && r1.status < 400 && (r1.headers.get("location") ?? "").includes("/admin/login"), `${r1.status} ${r1.headers.get("location")}`);
const r2 = await get("/admin/uk/site/hero", { redirect: "manual" });
check("section page without a session → login page", r2.status >= 300 && r2.status < 400);

// ---------- form APIs: only requests that must be refused (nothing reaches Telegram) ----------
const origin = new URL(BASE).origin;
const bad = await get("/api/lead", { method: "POST", headers: { "content-type": "application/json", origin }, body: JSON.stringify({ kind: "lead", name: "x", contact: "not a phone", option: "Нет такого варианта", t: 9000, trap: "" }) });
check("/api/lead refuses an invalid lead (400, nothing sent)", bad.status === 400, String(bad.status));
const foreign = await get("/api/lead", { method: "POST", headers: { "content-type": "application/json", origin: "https://evil.example" }, body: "{}" });
check("/api/lead refuses a foreign Origin (403)", foreign.status === 403, String(foreign.status));
const badBrief = await get("/api/brief", { method: "POST", headers: { "content-type": "application/json", origin }, body: JSON.stringify({ answers: { project_type: "o99" }, t: 9000, trap: "" }) });
check("/api/brief refuses an invalid brief (400, nothing sent)", badBrief.status === 400, String(badBrief.status));

// ---------- admin flow in a real browser ----------
const browser = await chromium.launch();
const errors = [];
async function device(name, opts = { viewport: { width: 1440, height: 900 } }) {
  const ctx = await browser.newContext(ctxOpts({ ...opts, acceptDownloads: true }));
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && !/favicon|_vercel\/insights|vercel\.live|feedback/i.test(m.text()) && errors.push(`${name} console: ${m.text().slice(0, 120)}`));
  page.on("dialog", (d) => d.accept());
  return { ctx, page };
}
const A = await device("A");
const pa = A.page;
await pa.goto(BASE + "/admin/login");
await pa.getByLabel("Пароль администратора").fill("definitely-wrong-password");
await pa.getByRole("button", { name: "Войти" }).click();
await pa.waitForTimeout(2500);
check("wrong password refused", (await pa.getByText("Неверный пароль.").count()) > 0);
await pa.getByLabel("Пароль администратора").fill(process.env.ADMIN_PASSWORD);
await pa.getByRole("button", { name: "Войти" }).click();
await pa.waitForURL(BASE + "/admin", { timeout: 30000 }).catch(() => {});
check("correct password → admin opens", pa.url() === BASE + "/admin", pa.url());
const cookie = (await A.ctx.cookies()).find((c) => c.name.includes("mf_admin"));
check("session cookie on HTTPS: __Host-, Secure, HttpOnly, SameSite=Strict", !!cookie && cookie.name.startsWith("__Host-") && cookie.secure && cookie.httpOnly && cookie.sameSite === "Strict", cookie ? cookie.name : "no cookie");
check("admin shows the database state (not the «not connected» notice)", (await pa.getByText("Админ-панель недоступна").count()) === 0 && (await pa.getByText(/Сайт показывает версию|Черновики сохранены/).count()) > 0);

// draft
await pa.goto(BASE + "/admin/uk/site/hero");
await pa.waitForTimeout(3000);
const eyebrow = pa.getByLabel(rx("Надзаголовок")).first();
await eyebrow.fill("PREVIEW-ТЕСТ");
await pa.getByRole("button", { name: /Сохранить черновик/ }).click();
await pa.waitForTimeout(3500);
check("draft saved on the Preview", (await pa.getByText(/ещё не опубликован|Черновики сохранены/).count()) > 0);
check("draft is not on the Preview site", !(await html("/")).includes("PREVIEW-ТЕСТ"));

// second device sees it
const B = await device("B");
await B.page.goto(BASE + "/admin/login");
await B.page.getByLabel("Пароль администратора").fill(process.env.ADMIN_PASSWORD);
await B.page.getByRole("button", { name: "Войти" }).click();
await B.page.waitForURL(BASE + "/admin", { timeout: 30000 }).catch(() => {});
await B.page.goto(BASE + "/admin/uk/site/hero");
await B.page.waitForTimeout(3000);
check("second device sees the same draft", (await B.page.getByLabel(rx("Надзаголовок")).first().inputValue()) === "PREVIEW-ТЕСТ");

// photo upload
const photo = await sharp({ create: { width: 800, height: 1000, channels: 3, background: { r: 30, g: 120, b: 200 } } }).png().toBuffer();
await pa.goto(BASE + "/admin/uk/site/about");
await pa.waitForTimeout(3000);
await pa.locator("input[type=file]").first().setInputFiles({ name: "preview-test.png", mimeType: "image/png", buffer: photo });
const thumb = pa.getByAltText("Фото Founder — десктоп и планшет: текущее изображение");
for (let i = 0; i < 60 && !((await thumb.getAttribute("src")) ?? "").includes("/object/sign/"); i++) await pa.waitForTimeout(500);
const signed = (await thumb.getAttribute("src")) ?? "";
check("photo uploaded to the private bucket (signed URL in the editor)", signed.includes("/object/sign/cms-drafts/"));
const frame = pa.frameLocator("iframe[title^='Предпросмотр']");
await frame.locator("a[aria-label*='Founder']").waitFor({ timeout: 30000 }).catch(() => {});
await pa.waitForTimeout(2500);
const prev = await frame.locator("a[aria-label*='Founder'] img").evaluateAll((els) => els.map((e) => decodeURIComponent(e.getAttribute("src") || "")));
check("live preview on the Preview shows the uploaded photo", prev.some((s) => s.includes("cms-drafts")));
await pa.getByRole("button", { name: /Сохранить черновик/ }).click();
await pa.waitForTimeout(3500);
const supa = process.env.SUPABASE_URL.replace(/\/$/, "");
const dp = signed.split("/object/sign/cms-drafts/")[1]?.split("?")[0];
check("draft photo not public", (await fetch(`${supa}/storage/v1/object/public/cms-drafts/${dp}`)).status >= 400);

// publish → visible without a rebuild
await pa.goto(BASE + "/admin");
await pa.waitForTimeout(2500);
const t0 = Date.now();
await pa.getByLabel("Комментарий к версии (необязательно)").fill("Preview: проверка публикации");
await pa.getByRole("button", { name: "Опубликовать", exact: true }).click();
await pa.waitForTimeout(6000);
let pub = await html("/");
for (let i = 0; i < 10 && !pub.includes("PREVIEW-ТЕСТ"); i++) {
  await new Promise((r) => setTimeout(r, 3000));
  pub = await html("/");
}
check("after «Опубликовать» the Preview site shows the new text without a rebuild", pub.includes("PREVIEW-ТЕСТ"), `${Math.round((Date.now() - t0) / 1000)} s`);
const m = pub.match(/https?(?::|%3A)(?:\/\/|%2F%2F)[^"&]*cms-public[^"&]*/);
const publicUrl = m ? decodeURIComponent(m[0]) : null;
check("published photo on the Preview site, publicly reachable", !!publicUrl && (await fetch(publicUrl)).status === 200, publicUrl?.slice(0, 80));

// rollback to the previous version, then forward again
await pa.reload();
await pa.waitForTimeout(3000);
const rows = pa.locator("#versions ~ ol li");
const newest = (await rows.first().innerText()).match(/№(\d+)/)?.[1];
const previous = (await rows.nth(1).innerText()).match(/№(\d+)/)?.[1];
await rows.nth(1).getByRole("button", { name: "Вернуть на сайт" }).click();
await pa.waitForTimeout(7000);
let rolled = await html("/");
for (let i = 0; i < 10 && rolled.includes("PREVIEW-ТЕСТ"); i++) {
  await new Promise((r) => setTimeout(r, 3000));
  rolled = await html("/");
}
check(`rollback to №${previous}: text and photo back on the Preview site`, !rolled.includes("PREVIEW-ТЕСТ") && !rolled.includes("cms-public"));
await pa.reload();
await pa.waitForTimeout(3000);
await pa.locator("#versions ~ ol li").filter({ hasText: `№${newest} ·` }).getByRole("button", { name: "Вернуть на сайт" }).click();
await pa.waitForTimeout(7000);
check("forward again: photo still reachable (nothing lost)", !!publicUrl && (await fetch(publicUrl)).status === 200);

// adaptivity of the Preview: public pages and admin on 390 / 430 / 1440, Chromium + WebKit
for (const [label, bt, opts] of [
  ["Chromium 390", chromium, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }],
  ["Chromium 430", chromium, { viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true }],
  ["Chromium 1440", chromium, { viewport: { width: 1440, height: 900 } }],
  ["WebKit iPhone", webkit, devices["iPhone 13"]],
]) {
  const b = bt === chromium ? browser : await webkit.launch();
  let ctx, page;
  try {
    ctx = await b.newContext(ctxOpts(opts));
    page = await ctx.newPage();
  } catch (e) {
    out.push(`SKIP  ${label}: browser could not start on this machine (${String(e.message).split(String.fromCharCode(10))[0].slice(0, 80)})`);
    console.log(out.at(-1));
    if (b !== browser) await b.close().catch(() => {});
    continue;
  }
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  let overflow = 0;
  for (const p of pages) {
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    if (await page.evaluate(() => { const y = scrollY; scrollTo(300, y); const moved = scrollX > 0; scrollTo(0, y); return moved; })) overflow++;
  }
  await page.goto(BASE + "/admin/login");
  await page.getByLabel("Пароль администратора").fill(process.env.ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForURL(BASE + "/admin", { timeout: 30000 }).catch(() => {});
  for (const p of ["/admin", "/admin/uk/site/pricing", "/admin/en/brief/steps"]) {
    await page.goto(BASE + p);
    await page.waitForTimeout(2000);
    if (await page.evaluate(() => { const y = scrollY; scrollTo(300, y); const moved = scrollX > 0; scrollTo(0, y); return moved; })) overflow++;
  }
  check(`${label}: 8 public pages + 3 admin pages, no horizontal scroll, no page errors`, overflow === 0 && errs.length === 0, `${overflow} ${errs.slice(0, 2).join(" | ")}`);
  await ctx.close();
  if (b !== browser) await b.close();
}

// logout
await pa.getByRole("button", { name: "Выйти" }).first().click();
await pa.waitForTimeout(2500);
check("logout → cookie removed, admin closed again", !(await A.ctx.cookies()).some((c) => c.name.includes("mf_admin")) && pa.url().endsWith("/admin/login"));

// leave the shared database as it was: drafts = src/content, published
const C = await device("C");
await C.page.goto(BASE + "/admin/login");
await C.page.getByLabel("Пароль администратора").fill(process.env.ADMIN_PASSWORD);
await C.page.getByRole("button", { name: "Войти" }).click();
await C.page.waitForURL(BASE + "/admin", { timeout: 30000 }).catch(() => {});
const resets = C.page.getByRole("button", { name: "Исходный контент в черновик" });
for (let i = 0; i < (await resets.count()); i++) {
  await resets.nth(i).click();
  await C.page.waitForTimeout(6000);
}
await C.page.getByLabel("Комментарий к версии (необязательно)").fill("Исходный контент после проверки Preview");
await C.page.getByRole("button", { name: "Опубликовать", exact: true }).click();
await C.page.waitForTimeout(8000);
let fin = await html("/");
for (let i = 0; i < 10 && fin.includes("PREVIEW-ТЕСТ"); i++) {
  await new Promise((r) => setTimeout(r, 3000));
  fin = await html("/");
}
check("Preview site back to the original content", fin.includes("МИ СТВОРЮЄМО") && !fin.includes("PREVIEW-ТЕСТ") && !fin.includes("cms-public"));
check("no page errors in the admin on the Preview", errors.length === 0, errors.slice(0, 3).join(" | "));
fs.writeFileSync(path.join(OUT, "results.txt"), out.join("\n"));
await browser.close();
process.exit(out.some((l) => l.startsWith("FAIL")) ? 1 : 0);
