#!/usr/bin/env node
/**
 * Captures section screenshots for pixel-diff into visual/output/site/<bp>/<id>.png.
 * Usage: node scripts/capture.mjs [--url http://localhost:3000] [--bp 1440,390]
 *
 * - waits for the intro preloader to finish, scrolls the page once so reveals / counters settle;
 * - desktop viewport is widened by the reserved scrollbar gutter so the content is exactly <bp> wide;
 * - pinned header pills are hidden outside the hero (in Figma they exist only at the top).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "visual/manifest.json"), "utf8"));
const arg = (k) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : undefined; };
const url = arg("--url") ?? manifest.siteUrl;
const bps = (arg("--bp") ?? Object.keys(manifest.breakpoints).join(",")).split(",");

const browser = await chromium.launch();
for (const bp of bps) {
  const w = Number(bp);
  const mobile = w < 768;
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, isMobile: mobile, hasTouch: mobile, reducedMotion: "no-preference" });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForFunction(() => !document.querySelector(".preloader"), null, { timeout: 15000 });
  // headless reports clientWidth == innerWidth even with a reserved gutter, so measure the body
  const gutter = await page.evaluate(() => Math.round(innerWidth - document.body.getBoundingClientRect().width));
  if (gutter) await page.setViewportSize({ width: w + gutter, height: 900 });
  // trigger every reveal / counter once
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(2500);
  const dir = path.join(ROOT, "visual/output/site", bp);
  fs.mkdirSync(dir, { recursive: true });
  for (const s of manifest.sections) {
    const hidePinned = s.id !== "top";
    await page.evaluate((hide) => document.querySelectorAll("body > div.fixed.z-40").forEach((e) => (e.style.visibility = hide ? "hidden" : "")), hidePinned);
    if (!hidePinned) await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator(s.selector).first().screenshot({ path: path.join(dir, `${s.id}.png`), animations: "disabled", timeout: 30000 });
    process.stdout.write(`${bp}/${s.id} `);
  }
  console.log();
  await ctx.close();
}
await browser.close();
