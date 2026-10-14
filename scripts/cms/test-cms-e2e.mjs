// End-to-end CMS checks against a running production build connected to Supabase.
// usage: node scripts/cms/test-cms-e2e.mjs <baseUrl> <outDir>
// Leaves the site in its original state: at the end the drafts are re-imported from the stage-0 backup and published.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createRequire } from "node:module";
import { root } from "./jiti.mjs";
import { loadEnv } from "./env.mjs";

loadEnv();
const [BASE, OUT] = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
const req = createRequire(path.join(root, "package.json"));
const { chromium } = req("playwright");
const sharp = req("sharp");
const SUPA = process.env.SUPABASE_URL.replace(/\/$/, "");
const BACKUP = path.join(os.homedir(), "Desktop", "MIROFORM-backups", "2026-10-14-pre-cms", "content.json");

const out = [];
const check = (name, ok, extra = "") => {
  out.push(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? " — " + extra : ""}`);
  console.log(out.at(-1));
};
const html = async (p) => (await fetch(BASE + p, { cache: "no-store" })).text();
const rx = (l) => new RegExp("^" + l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "( \\*)?$");

const browser = await chromium.launch();
const errors = [];
async function device(name) {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 950 }, acceptDownloads: true });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  page.on("dialog", (d) => d.accept());
  await page.goto(BASE + "/admin/login");
  await page.getByLabel("Пароль администратора").fill(process.env.ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForURL(BASE + "/admin", { timeout: 30000 });
  return { ctx, page };
}
const field = (page, label) => page.getByLabel(rx(label)).first();
const save = async (page) => {
  await page.getByRole("button", { name: /Сохранить черновик/ }).click();
  await page.waitForTimeout(2500);
};
const toastText = async (page) => (await page.locator("[role=status], [role=alert]").allInnerTexts()).join(" | ");
const publish = async (page, note) => {
  await page.goto(BASE + "/admin");
  await page.waitForTimeout(1500);
  await page.getByLabel("Комментарий к версии (необязательно)").fill(note);
  await page.getByRole("button", { name: "Опубликовать", exact: true }).click();
  await page.waitForTimeout(6000);
};

const A = await device("A");
const B = await device("B");
const pa = A.page;

// ---------- 1. draft is not public ----------
const before = await html("/");
check("site shows the published eyebrow before editing", before.includes("МИ СТВОРЮЄМО"));
await pa.goto(BASE + "/admin/uk/site/hero");
await pa.waitForTimeout(2000);
await field(pa, "Надзаголовок").fill("CMS-ТЕСТ-1");
await save(pa);
check("draft saved", (await toastText(pa)).includes("Черновик сохранён"), await toastText(pa));
const afterDraft = await html("/");
check("saved draft is NOT on the site", !afterDraft.includes("CMS-ТЕСТ-1") && afterDraft.includes("МИ СТВОРЮЄМО"));
check("EN site untouched", (await html("/en")).includes("WE BUILD"));

// ---------- 2. second device sees the same draft; conflicting save is refused ----------
const pb = B.page;
await pb.goto(BASE + "/admin/uk/site/hero");
await pb.waitForTimeout(2000);
check("second device sees the same draft", (await field(pb, "Надзаголовок").inputValue()) === "CMS-ТЕСТ-1");
await field(pb, "Надзаголовок").fill("CMS-ТЕСТ-2");
await save(pb);
await field(pa, "Строка 1").fill("Конфлікт");
await save(pa);
check("stale device's save refused as a conflict (no overwrite)", (await toastText(pa)).includes("изменили на другом устройстве"), await toastText(pa));
await pa.reload();
await pa.waitForTimeout(2000);
check("after reload the first device has the other device's value", (await field(pa, "Надзаголовок").inputValue()) === "CMS-ТЕСТ-2" && (await field(pa, "Строка 1").inputValue()) === "Сайти, які");

// ---------- 3. publish → site updated without a rebuild ----------
const t0 = Date.now();
await publish(pa, "e2e: заголовок");
let pub1 = await html("/");
for (let i = 0; i < 5 && !pub1.includes("CMS-ТЕСТ-2"); i++) {
  await new Promise((r) => setTimeout(r, 2000));
  pub1 = await html("/");
}
check("after «Опубликовать» the site shows the new text (no rebuild, no deploy)", pub1.includes("CMS-ТЕСТ-2") && !pub1.includes("МИ СТВОРЮЄМО"), `${Math.round((Date.now() - t0) / 1000)} s`);
check("page metadata still correct after publishing", /<title>Створення сайтів/.test(pub1));

// ---------- 4. undo (draft only) ----------
await pa.goto(BASE + "/admin");
await pa.waitForTimeout(2000);
await pa.locator("#recent ~ ol li").filter({ hasText: "Надзаголовок" }).first().getByRole("button", { name: /Отменить/ }).click();
await pa.waitForTimeout(2500);
await pa.goto(BASE + "/admin/uk/site/hero");
await pa.waitForTimeout(2000);
check("undo restores the previous draft value", (await field(pa, "Надзаголовок").inputValue()) === "CMS-ТЕСТ-1");
check("undo does not touch the published site", (await html("/")).includes("CMS-ТЕСТ-2"));

// ---------- 5. photo upload → private until published ----------
const photo = await sharp({ create: { width: 800, height: 1000, channels: 3, background: { r: 200, g: 40, b: 40 } } }).png().toBuffer();
await pa.goto(BASE + "/admin/uk/site/about");
await pa.waitForTimeout(2500);
await pa.locator("input[type=file]").first().setInputFiles({ name: "founder-test.png", mimeType: "image/png", buffer: photo });
// upload = resize in the browser + storage + server check: wait until the editor shows the new file (up to 30 s)
const thumbEl = pa.getByAltText("Фото Founder — десктоп и планшет: текущее изображение");
for (let i = 0; i < 60 && !((await thumbEl.getAttribute("src")) ?? "").includes("/object/sign/"); i++) await pa.waitForTimeout(500);
const thumb = await thumbEl.getAttribute("src");
check("uploaded photo shown in the editor through a signed URL", !!thumb && thumb.includes("/storage/v1/object/sign/cms-drafts/"), thumb?.slice(0, 80));
const frame = pa.frameLocator("iframe[title^='Предпросмотр']");
await frame.locator("a[aria-label*='Founder']").waitFor({ timeout: 20000 });
await pa.waitForTimeout(2000);
const previewSrcs = await frame.locator("a[aria-label*='Founder'] img").evaluateAll((els) => els.map((e) => decodeURIComponent(e.getAttribute("src") || "")));
check("live preview shows the uploaded photo", previewSrcs.some((s) => s.includes("cms-drafts")), previewSrcs.map((s) => s.slice(0, 60)).join(" "));
await save(pa);
const draftPath = thumb.split("/object/sign/cms-drafts/")[1]?.split("?")[0];
const publicTry = await fetch(`${SUPA}/storage/v1/object/public/cms-drafts/${draftPath}`);
check("draft file is not reachable by a public URL", publicTry.status >= 400, `HTTP ${publicTry.status}`);
const signedNoToken = await fetch(`${SUPA}/storage/v1/object/sign/cms-drafts/${draftPath}`);
check("draft file is not reachable without the signature", signedNoToken.status >= 400, `HTTP ${signedNoToken.status}`);
check("photo not on the site before publishing", !(await html("/")).includes("cms-public"));
await publish(pa, "e2e: фото Founder");
const withPhoto = await html("/");
const m = withPhoto.match(/https?(?::|%3A)(?:\/\/|%2F%2F)[^"&]*cms-public[^"&]*/);
const publicUrl = m ? decodeURIComponent(m[0]) : null;
check("after publishing the site uses the public copy of the photo", !!publicUrl, publicUrl?.slice(0, 90));
const pubRes = publicUrl ? await fetch(publicUrl) : null;
check("published photo is publicly reachable", pubRes?.status === 200 && /image\//.test(pubRes.headers.get("content-type") ?? ""), `${pubRes?.status} ${pubRes?.headers.get("content-type")}`);
await pa.screenshot({ path: path.join(OUT, "admin-about-uploaded.png") });

// ---------- 6. rollback (texts + images) ----------
await pa.goto(BASE + "/admin");
await pa.waitForTimeout(2000);
const versions = pa.locator("#versions ~ ol li");
const withPhotoVersion = (await versions.first().innerText()).match(/№(\d+)/)?.[1];
await versions.filter({ hasText: "исходный перенос" }).getByRole("button", { name: "Вернуть на сайт" }).click();
await pa.waitForTimeout(6000);
const rolled = await html("/");
check("rollback to version №1: original text back", rolled.includes("МИ СТВОРЮЄМО") && !rolled.includes("CMS-ТЕСТ"));
check("rollback to version №1: original photo back", !rolled.includes("cms-public") && rolled.includes("founder.png"));
await pa.reload();
await pa.waitForTimeout(2000);
await pa.locator("#versions ~ ol li").filter({ hasText: `№${withPhotoVersion} ·` }).getByRole("button", { name: "Вернуть на сайт" }).click();
await pa.waitForTimeout(6000);
const back = await html("/");
const res2 = publicUrl ? await fetch(publicUrl) : null;
check("rollback forward to the photo version: photo still there (nothing lost)", back.includes("cms-public") && res2?.status === 200);

// ---------- 7. forms + brief options used by the server after publishing ----------
await pa.goto(BASE + "/admin/uk/site/contact-form");
await pa.waitForTimeout(2000);
const typeInput = pa.locator("div").filter({ has: pa.getByText("Варианты «Тип проекта»", { exact: false }) }).locator("input[type=text]").first();
await pa.getByText("Варианты «Тип проекта»").first().locator("xpath=..").locator("input[type=text]").first().fill("Тест-лендінг");
await save(pa);
await pa.goto(BASE + "/admin/uk/brief/steps");
await pa.waitForTimeout(2000);
await pa.getByRole("tab", { name: "02" }).click();
await pa.locator("main button[aria-expanded]").filter({ hasText: "Який сайт вам потрібен?" }).click();
await pa.getByLabel("Вариант 2", { exact: true }).fill("Багатосторінковий сайт (тест)");
await save(pa);
await publish(pa, "e2e: варианты форм и брифа");
check("brief page shows the renamed option", (await html("/brief")).includes("Багатосторінковий сайт (тест)"));
check("contact form shows the new project type", (await html("/")).includes("Тест-лендінг"));
fs.writeFileSync(
  path.join(OUT, "form-cases.json"),
  JSON.stringify([
    { name: "lead NEW option", api: "lead", body: { kind: "lead", name: "Тест", contact: "+380501234567", option: "Тест-лендінг", budget: "до $500", message: "x" } },
    { name: "lead REMOVED option", api: "lead", body: { kind: "lead", name: "Тест2", contact: "+380501234568", option: "Лендінг", budget: "до $500", message: "x" } },
    { name: "brief renamed option", api: "brief", body: { answers: { project_type: "o2", name: "Тест Тестович", contact: "+380501234567", contact_method: "o2", contact_time: "o2" } } },
  ]),
);

// ---------- 8. export / import / restore the original content ----------
await pa.goto(BASE + "/admin");
await pa.waitForTimeout(1500);
const [dl] = await Promise.all([pa.waitForEvent("download"), pa.getByRole("button", { name: "Скачать экспорт (JSON)" }).click()]);
const exp = JSON.parse(fs.readFileSync(await dl.path(), "utf8"));
check("export contains drafts, publications and media", exp.format === "miroform-cms-export" && exp.drafts?.site?.uk?.hero && exp.publications?.length >= 5 && exp.media?.length >= 1);
fs.copyFileSync(await dl.path(), path.join(OUT, "cms-export.json"));

// keep the e2e state for the form checks first (they read the published content), then restore
console.log("FORM-CHECK-POINT");
await new Promise((resolve) => {
  const f = path.join(OUT, "continue");
  const t = setInterval(() => {
    if (fs.existsSync(f)) {
      clearInterval(t);
      resolve();
    }
  }, 1000);
});

await pa.locator("input[type=file]").setInputFiles(BACKUP);
await pa.waitForTimeout(8000);
check("stage-0 backup imported into drafts", (await pa.getByText("Файл загружен в черновики").count()) > 0, await toastText(pa));
// the stage-0 backup may be older than the code: put the CURRENT src/content back into every draft, then publish
await pa.goto(BASE + "/admin");
await pa.waitForTimeout(1500);
const resetButtons = pa.getByRole("button", { name: "Исходный контент в черновик" });
for (let i = 0; i < (await resetButtons.count()); i++) {
  await resetButtons.nth(i).click();
  await pa.waitForTimeout(5000);
}
await publish(pa, "Возврат к исходному контенту после тестов");
const finalHtml = await html("/");
const finalBrief = await html("/brief");
check("site back to the original content", finalHtml.includes("МИ СТВОРЮЄМО") && !finalHtml.includes("CMS-ТЕСТ") && !finalHtml.includes("cms-public") && !finalHtml.includes("Тест-лендінг") && !finalBrief.includes("(тест)"));
await pa.reload();
await pa.waitForTimeout(2000);
check("no unpublished changes left", (await pa.getByText("Все сохранённые черновики уже на сайте").count()) > 0);
await pa.screenshot({ path: path.join(OUT, "admin-overview-final.png"), fullPage: true });

check("no page errors in the admin", errors.length === 0, errors.slice(0, 3).join(" | "));
fs.writeFileSync(path.join(OUT, "results.txt"), out.join("\n"));
await browser.close();
process.exit(out.some((l) => l.startsWith("FAIL")) ? 1 : 0);
