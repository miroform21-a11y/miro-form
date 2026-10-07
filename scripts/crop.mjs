// node scripts/crop.mjs <cmpfile> <panel:0|1|2|fs (figma+site stacked)> x y w h out
import sharp from "sharp";
const [file, panel, x, y, w, h, out] = process.argv.slice(2);
const m = await sharp(file).metadata(); const W = (m.width - 24) / 3;
const box = (p) => ({ left: Math.round(p * (W + 12) + +x), top: +y, width: +w, height: Math.min(+h, m.height - +y) });
if (panel === "fs") {
  const a = await sharp(file).extract(box(0)).toBuffer(), b = await sharp(file).extract(box(1)).toBuffer();
  const bh = Math.min(+h, m.height - +y);
  await sharp({ create: { width: +w, height: bh * 2 + 6, channels: 4, background: "#ff00ff" } }).composite([{ input: a, top: 0, left: 0 }, { input: b, top: bh + 6, left: 0 }]).png().toFile(out);
} else await sharp(file).extract(box(+panel)).toFile(out);
console.log(out);
