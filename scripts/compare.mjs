// node scripts/compare.mjs <width> [section ...]
// Builds qa/cmp/<w>-<section>.png: [Figma | Site | Difference] for every section.
import { chromium } from "playwright";
import sharp from "sharp";
import fs from "node:fs";
const FIG = "C:/Users/suxxx/AppData/Local/Temp/claude/c--Users-suxxx-Desktop-Miro-Form--R-/d4820221-2217-4530-9932-86bb3ad84c1a/scratchpad/figma";
const order = ["top", "services", "works", "about", "why", "process", "pricing", "reviews", "faq", "contact", "footer"];
const w = Number(process.argv[2] || 1440);
const only = process.argv.slice(3);
const prefix = w >= 768 ? "d" : "m";
fs.mkdirSync("qa/cmp", { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" });
await p.goto("http://localhost:3000", { waitUntil: "networkidle" });
await p.addStyleTag({ content: ".reveal{opacity:1!important;transform:none!important}*{animation:none!important;transition:none!important}nextjs-portal{display:none!important}" });
await p.evaluate(async () => { await document.fonts.ready; for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
await p.waitForLoadState("networkidle"); await p.waitForTimeout(500);
const full = await p.screenshot({ fullPage: true });
const rects = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll("section[id], footer")].map((s) => { const r = s.getBoundingClientRect(); return [s.id || "footer", { y: Math.round(r.top + scrollY), h: Math.round(r.height) }]; })));
const fullMeta = await sharp(full).metadata();
for (const [i, id] of order.entries()) {
  if (only.length && !only.includes(id)) continue;
  const figFile = `${FIG}/${prefix}${String(i + 1).padStart(2, "0")}.png`;
  let fig = sharp(figFile); const fm = await fig.metadata();
  // Figma "Works" desktop screenshot was exported downscaled (1315 wide) — normalise to frame width
  const fw = w >= 768 ? 1440 : 390;
  let figBuf = await sharp(figFile).resize({ width: fw }).png().toBuffer();
  let figH = (await sharp(figBuf).metadata()).height;
  // Figma exports include layers that overflow the frame top (e.g. the purple star) — trim them
  const frameH = { 1440: { works: 2407 } }[fw]?.[id];
  if (frameH && figH > frameH) { figBuf = await sharp(figBuf).extract({ left: 0, top: figH - frameH, width: fw, height: frameH }).png().toBuffer(); figH = frameH; }
  const r = rects[id]; const h = Math.min(r.h, fullMeta.height - r.y);
  const site = await sharp(full).extract({ left: 0, top: r.y, width: Math.min(w, fullMeta.width), height: h }).png().toBuffer();
  const H = Math.max(figH, h), W = Math.max(fw, w);
  const pad = (buf) => sharp({ create: { width: W, height: H, channels: 4, background: "#ff00ff" } }).composite([{ input: buf, left: 0, top: 0 }]).png().toBuffer();
  const A = await pad(figBuf), B = await pad(site);
  const diff = await sharp(A).composite([{ input: B, blend: "difference" }]).png().toBuffer();
  const gap = 12;
  await sharp({ create: { width: W * 3 + gap * 2, height: H, channels: 4, background: "#ff00ff" } })
    .composite([{ input: A, left: 0, top: 0 }, { input: B, left: W + gap, top: 0 }, { input: diff, left: (W + gap) * 2, top: 0 }])
    .png().toFile(`qa/cmp/${w}-${id}.png`);
  console.log(`qa/cmp/${w}-${id}.png  figma ${fw}x${figH}  site ${w}x${h}`);
}
await b.close();
