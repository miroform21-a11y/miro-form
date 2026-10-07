#!/usr/bin/env node
/**
 * Extracts visible text layers from a Figma metadata XML dump with positions
 * relative to their section frame. Output: visual/figma-text.json
 *   { "<bp>": { "<sectionNodeId>": [[text, x, y, w, h], ...] } }
 * Usage: node scripts/figma-text-positions.mjs <metadata.xml>
 */
import fs from "node:fs";

const [src] = process.argv.slice(2);
if (!src) throw new Error("Usage: figma-text-positions.mjs <metadata.xml>");

const decode = (s) =>
  s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const PAGE_FRAMES = { "109:2": "1440", "109:3": "390" };
const SKIP = /^(Label|H2|Number|Text|Title|Pixel number)$/;

const out = {};
const stack = []; // { depth, x, y }
let bp = null;
let sectionId = null;

for (const line of fs.readFileSync(src, "utf8").split("\n")) {
  const m = line.match(/<(\w[\w-]*) id="([^"]+)" name="([^"]*)" x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"/);
  if (!m) continue;
  const [, tag, id, name, x, y, w, h] = m;
  const depth = line.search(/\S/) / 2;
  while (stack.length && stack.at(-1).depth >= depth) stack.pop();
  const parent = stack.at(-1) ?? { x: 0, y: 0 };
  const ax = parent.x + Number(x);
  const ay = parent.y + Number(y);

  if (PAGE_FRAMES[id]) bp = PAGE_FRAMES[id];
  if (depth === 2) sectionId = id;
  // section-relative coordinates: reset origin at the section frame
  const node = depth === 2 ? { depth, x: 0, y: 0 } : { depth, x: ax, y: ay };
  if (!/\/>\s*$/.test(line)) stack.push(node);

  if (tag === "text" && depth > 2 && bp && !/hidden="true"/.test(line)) {
    const text = decode(name).trim();
    if (text.length < 6 || SKIP.test(text)) continue;
    ((out[bp] ??= {})[sectionId] ??= []).push([text, Math.round(ax), Math.round(ay), Math.round(Number(w)), Math.round(Number(h))]);
  }
}

fs.writeFileSync(new URL("../visual/figma-text.json", import.meta.url), JSON.stringify(out));
for (const [b, secs] of Object.entries(out)) console.log(b, Object.entries(secs).map(([k, v]) => `${k}:${v.length}`).join(" "));
