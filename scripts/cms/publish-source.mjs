// Through the admin UI: loads the current src/content into all drafts ("Исходный контент в черновик" ×4) and publishes.
// usage: node scripts/cms/publish-source.mjs <baseUrl> "<note>"
import path from "node:path";
import { createRequire } from "node:module";
import { root } from "./jiti.mjs";
import { loadEnv } from "./env.mjs";

loadEnv();
const [BASE, NOTE = "Исходный контент (src/content)"] = process.argv.slice(2);
const { chromium } = createRequire(path.join(root, "package.json"))("playwright");
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
page.on("dialog", (d) => d.accept());
await page.goto(BASE + "/admin/login");
await page.getByLabel("Пароль администратора").fill(process.env.ADMIN_PASSWORD);
await page.getByRole("button", { name: "Войти" }).click();
await page.waitForURL(BASE + "/admin");
const buttons = page.getByRole("button", { name: "Исходный контент в черновик" });
const n = await buttons.count();
for (let i = 0; i < n; i++) {
  await buttons.nth(i).click();
  await page.waitForTimeout(5000);
}
await page.getByLabel("Комментарий к версии (необязательно)").fill(NOTE);
const publishBtn = page.getByRole("button", { name: "Опубликовать", exact: true });
if (await publishBtn.isEnabled()) {
  await publishBtn.click();
  await page.waitForTimeout(7000);
  console.log("published:", (await page.locator("[role=status]").allInnerTexts()).join(" | ").slice(0, 160));
} else console.log("nothing to publish (drafts already equal the site)");
await browser.close();
