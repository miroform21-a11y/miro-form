// Usage: node scripts/shot.mjs <outDir> <width>[,<width>...] [selector] [url]
import { chromium } from "playwright";
import fs from "node:fs";

const [outDir = "qa", widthsArg = "1440,390", selector = "", url = "http://localhost:3000"] = process.argv.slice(2);
const widths = widthsArg.split(",").map(Number);
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  // Reveal everything (scroll-in animations) and freeze motion for stable shots
  await page.addStyleTag({ content: ".reveal{opacity:1!important;transform:none!important;transition:none!important}*{animation-play-state:paused!important}" });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle"); await page.waitForTimeout(800);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const name = `${outDir}/${selector ? selector.replace(/[^a-z0-9]/gi, "") + "-" : ""}${width}.png`;
  if (selector) await page.locator(selector).first().screenshot({ path: name });
  else await page.screenshot({ path: name, fullPage: true });
  console.log(`${name}  overflowX=${overflow}px  errors=${errors.length ? errors.join(" | ") : "none"}`);
  await page.close();
}
await browser.close();
