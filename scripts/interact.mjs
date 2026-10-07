import { chromium } from "playwright";
const b = await chromium.launch();
const errors = [];
const log = (k, v) => console.log(k.padEnd(42), v);

// Mobile
let p = await b.newPage({ viewport: { width: 390, height: 844 } });
p.on("pageerror", (e) => errors.push(e.message)); p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await p.goto("http://localhost:3000", { waitUntil: "networkidle" });
await p.click('button[aria-label="Відкрити меню"]');
await p.waitForTimeout(500);
log("menu open (aria-hidden=false)", await p.getAttribute("#mobile-menu", "aria-hidden"));
log("scroll locked", await p.evaluate(() => document.documentElement.style.overflow));
await p.keyboard.press("Escape"); await p.waitForTimeout(400);
log("menu closed by Esc", await p.getAttribute("#mobile-menu", "aria-hidden"));
await p.click('button[aria-label="Відкрити меню"]'); await p.waitForTimeout(400);
await p.click('#mobile-menu a[href="#faq"]'); await p.waitForTimeout(1200);
log("menu link → closes & scrolls", `${await p.getAttribute("#mobile-menu", "aria-hidden")} / y=${await p.evaluate(() => Math.round(document.querySelector("#faq").getBoundingClientRect().top))}`);
const counter = p.locator('#reviews p[aria-live]');
await p.locator('#reviews button[aria-label="Наступні відгуки"]').filter({ visible: true }).first().click(); await p.waitForTimeout(900);
log("mobile reviews counter after next", await counter.textContent());
await p.close();

// Desktop
p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on("pageerror", (e) => errors.push(e.message)); p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await p.goto("http://localhost:3000", { waitUntil: "networkidle" });
const faqBtns = p.locator("#faq h3 button");
const expanded = async () => (await faqBtns.evaluateAll((els) => els.map((e) => e.getAttribute("aria-expanded")))).join(",");
log("FAQ initial", await expanded());
await faqBtns.nth(2).click(); await p.waitForTimeout(600);
log("FAQ after clicking #3", await expanded());
await faqBtns.nth(2).click(); await p.waitForTimeout(600);
log("FAQ after clicking #3 again", await expanded());
const firstReview = () => p.locator("#reviews figcaption").filter({ visible: true }).first().textContent();
log("reviews page 1 first author", await firstReview());
await p.locator('#reviews button[aria-label="Наступні відгуки"]').filter({ visible: true }).first().click(); await p.waitForTimeout(800);
log("reviews page 2 first author", await p.locator("#reviews figcaption").filter({ visible: true }).first().textContent());
// Pricing → form preselect
await p.locator("#pricing a", { hasText: "Обрати пакет" }).nth(2).click(); await p.waitForTimeout(1200);
log("preselected type after 'Багатосторінковий'", await p.locator('#contact [role=radiogroup][aria-label="Тип проєкту"] [aria-checked=true]').textContent());
// Validation
await p.click('#contact button[type=submit]');
log("validation errors shown", await p.locator("#lead-name-error, #lead-contact-error").count());
await p.fill("#lead-name", "Тест"); await p.fill("#lead-contact", "@miroform_test");
await p.click('#contact button[type=submit]'); await p.waitForTimeout(1500);
log("success state", (await p.locator('#contact [role=status]').textContent())?.slice(0, 30));
await p.close();
log("console/page errors", errors.length ? errors.join(" | ") : "none");
await b.close();
