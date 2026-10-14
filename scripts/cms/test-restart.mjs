// Publish → the page shows it; after a server restart (no rebuild) it still shows it.
// usage: node scripts/cms/test-restart.mjs <baseUrl> <phase: publish|check>
import path from "node:path";
import { createRequire } from "node:module";
import { root } from "./jiti.mjs";
import { loadEnv } from "./env.mjs";

loadEnv();
const [BASE, PHASE] = process.argv.slice(2);
const MARK = "RESTART-ТЕСТ";
if (PHASE === "check") {
  const ok = (await (await fetch(BASE + "/")).text()).includes(MARK);
  console.log(`${ok ? "PASS" : "FAIL"}  after restart (no rebuild) the page still shows the published edit`);
  process.exit(ok ? 0 : 1);
}
const { chromium } = createRequire(path.join(root, "package.json"))("playwright");
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
page.on("dialog", (d) => d.accept());
await page.goto(BASE + "/admin/login");
await page.getByLabel("Пароль администратора").fill(process.env.ADMIN_PASSWORD);
await page.getByRole("button", { name: "Войти" }).click();
await page.waitForURL(BASE + "/admin");
await page.goto(BASE + "/admin/uk/site/hero");
await page.waitForTimeout(2000);
await page.getByLabel(/^Надзаголовок( \*)?$/).first().fill(MARK);
await page.getByRole("button", { name: /Сохранить черновик/ }).click();
await page.waitForTimeout(2500);
await page.goto(BASE + "/admin");
await page.waitForTimeout(1500);
await page.getByRole("button", { name: "Опубликовать", exact: true }).click();
await page.waitForTimeout(6000);
await browser.close();
const ok = (await (await fetch(BASE + "/")).text()).includes(MARK);
console.log(`${ok ? "PASS" : "FAIL"}  published edit visible right after publishing`);
process.exit(ok ? 0 : 1);
