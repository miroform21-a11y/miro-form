// Full-page screenshots of the public pages (1440 / 430 / 390), motion frozen, for pixel comparison.
// usage: node scripts/cms/pixel-shots.mjs <baseUrl> <outDir>      then: node scripts/cms/pixel-shots.mjs --compare <dirA> <dirB> <diffDir>
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { root } from "./jiti.mjs";

const req = createRequire(path.join(root, "package.json"));
const pages = ["/", "/en", "/privacy", "/en/privacy-policy", "/brief", "/en/brief", "/thank-you", "/en/thank-you"];
const widths = [1440, 430, 390];
const name = (p, w) => `${w}${p.replace(/\//g, "_") || "_root"}.png`;

if (process.argv[2] === "--compare") {
  const [, , , a, b, diffDir] = process.argv;
  const { PNG } = req("pngjs");
  const pixelmatch = (await import(pathToFileURL(req.resolve("pixelmatch")).href)).default;
  fs.mkdirSync(diffDir, { recursive: true });
  let worst = 0;
  for (const p of pages)
    for (const w of widths) {
      const A = PNG.sync.read(fs.readFileSync(path.join(a, name(p, w))));
      const B = PNG.sync.read(fs.readFileSync(path.join(b, name(p, w))));
      if (A.width !== B.width || A.height !== B.height) {
        console.log(`${name(p, w)}: SIZE DIFFERS ${A.width}x${A.height} vs ${B.width}x${B.height}`);
        worst = 100;
        continue;
      }
      const d = new PNG({ width: A.width, height: A.height });
      const n = pixelmatch(A.data, B.data, d.data, A.width, A.height, { threshold: 0.1 });
      const pct = (n / (A.width * A.height)) * 100;
      worst = Math.max(worst, pct);
      if (n) fs.writeFileSync(path.join(diffDir, name(p, w)), PNG.sync.write(d));
      console.log(`${name(p, w)}: ${A.width}x${A.height} differing ${n} (${pct.toFixed(3)}%)`);
    }
  console.log(`worst: ${worst.toFixed(3)}%`);
  process.exit(0);
}

const [BASE, OUT] = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
const { chromium } = req("playwright");
const b = await chromium.launch();
for (const p of pages)
  for (const w of widths) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 700) {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await page.waitForTimeout(80);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important} video{visibility:hidden!important}" });
    await page.waitForTimeout(800);
    fs.writeFileSync(path.join(OUT, name(p, w)), await page.screenshot({ fullPage: true, animations: "disabled" }));
    await ctx.close();
  }
await b.close();
console.log("shots:", pages.length * widths.length, OUT);
