// WebKit (Safari engine) checks: public pages on an iPhone-sized screen and on desktop, the brief wizard and a popup,
// then the admin: login, edit, live preview, save draft, undo (the site is left unchanged).
// usage: node scripts/cms/test-webkit.mjs <baseUrl>
import path from "node:path";
import { createRequire } from "node:module";
import { root } from "./jiti.mjs";
import { loadEnv } from "./env.mjs";

loadEnv();
const [BASE] = process.argv.slice(2);
const { webkit, devices } = createRequire(path.join(root, "package.json"))("playwright");
const out = [];
const check = (name, ok, extra = "") => out.push(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? " — " + extra : ""}`);
const browser = await webkit.launch();

for (const [label, opts] of [
  ["iPhone 13 (WebKit)", devices["iPhone 13"]],
  ["desktop 1440 (WebKit)", { viewport: { width: 1440, height: 900 } }],
]) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await ctx.route("**/api/**", (r) => r.fulfill({ status: 200, body: '{"ok":true}' }));
  let overflow = 0;
  for (const p of ["/", "/en", "/privacy", "/en/privacy-policy", "/brief", "/en/brief", "/thank-you", "/en/thank-you"]) {
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    if (await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)) overflow++;
  }
  check(`${label}: 8 public pages load without page errors`, errors.length === 0, errors.slice(0, 2).join(" | "));
  check(`${label}: no horizontal scroll`, overflow === 0, String(overflow));
  // brief: next step works
  await page.goto(BASE + "/brief", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "Далі", exact: true }).click();
  await page.waitForTimeout(800);
  check(`${label}: brief wizard goes to step 2`, (await page.getByText("Який сайт вам потрібен?").count()) > 0);
  // popup from a service card
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const card = page.locator("#services a, #services button").filter({ visible: true }).first();
  await card.scrollIntoViewIfNeeded();
  await card.click();
  await page.waitForTimeout(1000);
  check(`${label}: service popup opens`, (await page.getByRole("dialog").count()) > 0);
  await ctx.close();
}

// admin in WebKit (iPhone size)
const ctx = await browser.newContext(devices["iPhone 13"]);
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("dialog", (d) => d.accept());
await page.goto(BASE + "/admin/login");
await page.getByLabel("Пароль администратора").fill(process.env.ADMIN_PASSWORD);
await page.getByRole("button", { name: "Войти" }).click();
await page.waitForURL(BASE + "/admin", { timeout: 30000 }).catch(() => {});
check("admin (WebKit, iPhone): login works, session cookie kept", page.url() === BASE + "/admin", page.url());
await page.goto(BASE + "/admin/uk/site/hero");
await page.waitForTimeout(2500);
const eyebrow = page.getByLabel(/^Надзаголовок( \*)?$/).first();
await eyebrow.fill("WEBKIT-ТЕСТ");
await page.waitForTimeout(1500);
const frame = page.frameLocator("iframe[title^='Предпросмотр']");
check("admin (WebKit): live preview shows the unsaved edit (phone layout)", (await frame.getByText("WEBKIT-ТЕСТ").count()) > 0);
await page.getByRole("button", { name: /Сохранить черновик/ }).click();
await page.waitForTimeout(2500);
check("admin (WebKit): draft saved", (await page.getByText("ещё не опубликован").count()) > 0);
check("admin (WebKit): site unchanged", !(await (await fetch(BASE + "/")).text()).includes("WEBKIT-ТЕСТ"));
await page.goto(BASE + "/admin");
await page.waitForTimeout(2000);
await page.locator("#recent ~ ol li").filter({ hasText: "Надзаголовок" }).first().getByRole("button", { name: /Отменить/ }).click();
await page.waitForTimeout(2500);
await page.reload();
await page.waitForTimeout(2000);
check("admin (WebKit): undo → no unpublished changes left", (await page.getByText("Все сохранённые черновики уже на сайте").count()) > 0);
check("admin (WebKit): no page errors", errors.length === 0, errors.slice(0, 2).join(" | "));
await browser.close();
console.log(out.join("\n"));
process.exit(out.some((l) => l.startsWith("FAIL")) ? 1 : 0);
