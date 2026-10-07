// Measures horizontal clearance between hero subtitle/CTA and the opaque part of the 3D blob.
import { chromium } from "playwright";
import sharp from "sharp";
const widths = (process.argv[2] || "1440,1280,1024,768").split(",").map(Number);
const { data, info } = await sharp("public/images/hero/blob.png").ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const opaqueRight = (box, yTop, yBot) => {
  let max = -Infinity;
  for (let y = Math.floor(yTop); y <= yBot; y++) {
    const iy = Math.round(((y - box.y) / box.height) * info.height);
    if (iy < 0 || iy >= info.height) continue;
    for (let ix = info.width - 1; ix >= 0; ix--)
      if (data[(iy * info.width + ix) * 4 + 3] > 40) { max = Math.max(max, box.x + (ix / info.width) * box.width); break; }
  }
  return Math.round(max);
};
const opaqueLeft = (box, yTop, yBot) => {
  let min = Infinity;
  for (let y = Math.floor(yTop); y <= yBot; y++) {
    const iy = Math.round(((y - box.y) / box.height) * info.height);
    if (iy < 0 || iy >= info.height) continue;
    for (let ix = 0; ix < info.width; ix++)
      if (data[(iy * info.width + ix) * 4 + 3] > 40) { min = Math.min(min, box.x + (ix / info.width) * box.width); break; }
  }
  return Math.round(min);
};
const b = await chromium.launch();
for (const w of widths) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  const errors = []; p.on("pageerror", (e) => errors.push(e.message)); p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await p.goto("http://localhost:3000", { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    const rect = (el) => { const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; };
    const sub = [...document.querySelectorAll("#top p")].find((e) => e.textContent.startsWith("Дизайн, розробка"));
    const btn = [...document.querySelectorAll("#top a")].find((e) => e.textContent.includes("Обговорити проєкт"));
    const h1 = document.querySelector("#top h1"); const range = document.createRange(); range.selectNodeContents(h1); const lines = [...range.getClientRects()].map((r) => ({ x: r.x, y: r.y, width: r.width, height: r.height }));
    return { lines, blob: rect(document.querySelector(".hero-blob")), sub: rect(sub), btn: rect(btn), overflow: document.documentElement.scrollWidth - innerWidth };
  });
  const subGap = Math.round(r.sub.x) - opaqueRight(r.blob, r.sub.y, r.sub.y + r.sub.height);
  const btnGap = Math.round(r.btn.x) - opaqueRight(r.blob, r.btn.y, r.btn.y + r.btn.height);
  const h1Gap = Math.min(...r.lines.map((l) => opaqueLeft(r.blob, l.y, l.y + l.height) - Math.round(l.x + l.width)));
  console.log(`${w}px  H1 gap=${h1Gap}px |  subtitle x=${Math.round(r.sub.x)} gap=${subGap}px | button x=${Math.round(r.btn.x)} gap=${btnGap}px | overflowX=${r.overflow} | errors=${errors.length ? errors.join(";") : "none"}`);
  await p.close();
}
await b.close();
