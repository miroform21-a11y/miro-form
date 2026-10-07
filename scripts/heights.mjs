import { chromium } from "playwright";
const figma = {
  1440: { top: 810, services: 1643, works: 2407, about: 1023, why: 624, process: 818, pricing: 1402, reviews: 888, faq: 906, contact: 916, footer: 690 },
  390: { top: 751, services: 2180, works: 716, about: 1360, why: 667, process: 1554, pricing: 1931, reviews: 1226, faq: 1339, contact: 1479, footer: 695 },
};
const b = await chromium.launch();
for (const w of [1440, 390]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" });
  await p.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  const h = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll("section[id], footer")].map((s) => [s.id || "footer", Math.round(s.getBoundingClientRect().height)])));
  console.log(`\n== ${w}px  section: site / figma (diff)`);
  for (const [k, v] of Object.entries(figma[w])) console.log(`${k.padEnd(9)} ${String(h[k]).padStart(5)} / ${String(v).padStart(5)}  (${h[k] - v >= 0 ? "+" : ""}${h[k] - v})`);
  await p.close();
}
await b.close();
