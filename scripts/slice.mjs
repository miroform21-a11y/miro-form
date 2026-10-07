import sharp from "sharp";
const [file, step = "1800"] = process.argv.slice(2);
const m = await sharp(file).metadata(); let i = 0;
for (let y = 0; y < m.height; y += +step, i++)
  await sharp(file).extract({ left: 0, top: y, width: m.width, height: Math.min(+step, m.height - y) }).toFile(file.replace(".png", `-${String(i).padStart(2, "0")}.png`));
console.log(file, `${m.width}x${m.height}`, i, "parts");
