#!/usr/bin/env node
/**
 * Pixel diff: Figma reference vs. site screenshots (pixelmatch).
 *
 * Files (see visual/manifest.json):
 *   visual/reference/<bp>/<id>.png    Figma baselines (fetched via Figma MCP, committed)
 *   visual/output/site/<bp>/<id>.png  latest site screenshots (taken via Playwright MCP)
 *   visual/output/runs/<run>/         per-run results: site/, diff/, compare/, report.json, report.md
 *   visual/output/latest-report.json  copy of the latest report (used for trend)
 *
 * Usage:
 *   node scripts/pixel-diff.mjs ref <bp> <id> <png-url-or-path>   save + normalise a Figma baseline
 *   node scripts/pixel-diff.mjs diff [--bp 1440,390] [--section top,services]
 */
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VISUAL = path.join(ROOT, "visual");
const manifest = JSON.parse(fs.readFileSync(path.join(VISUAL, "manifest.json"), "utf8"));

const refPath = (bp, id) => path.join(VISUAL, "reference", bp, `${id}.png`);
const sitePath = (bp, id) => path.join(VISUAL, "output", "site", bp, `${id}.png`);
const BAND = 40; // px, height of horizontal bands used to locate hotspots
const DIFF_RGB = [255, 0, 0];

function section(id) {
  const s = manifest.sections.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown section "${id}"`);
  return s;
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) out[argv[i].slice(2)] = argv[i + 1]?.startsWith("--") ? true : argv[++i];
    else out._.push(argv[i]);
  }
  return out;
}

async function loadInput(src) {
  if (/^https?:\/\//.test(src)) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`Download failed (${res.status}) for ${src}`);
    return Buffer.from(await res.arrayBuffer());
  }
  return fs.readFileSync(src);
}

/* ------------------------------------------------------------------ */
/* ref: save a Figma export as a normalised baseline                   */
/* ------------------------------------------------------------------ */
async function cmdRef([bp, id, src]) {
  if (!bp || !id || !src) throw new Error("Usage: ref <bp> <id> <png-url-or-path>");
  const s = section(id);
  const frame = s.figma[bp];
  if (!frame) throw new Error(`No Figma frame for ${id} @ ${bp}`);
  const width = manifest.breakpoints[bp].viewportWidth;
  const off = frame.refOffset ?? { left: 0, top: 0 };

  const input = await loadInput(src);
  const meta = await sharp(input).metadata();
  if (meta.width - off.left < width || meta.height - off.top < frame.height) {
    throw new Error(
      `Export ${meta.width}x${meta.height} is smaller than frame ${width}x${frame.height} (+offset ${off.left},${off.top}). ` +
        `Re-export with a larger maxDimension so the scale is 1:1.`,
    );
  }
  const out = refPath(bp, id);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await sharp(input)
    .extract({ left: off.left, top: off.top, width, height: frame.height })
    .flatten({ background: "#050505" })
    .png()
    .toFile(out);
  console.log(`ref ${bp}/${id}: export ${meta.width}x${meta.height} -> ${width}x${frame.height}  ${path.relative(ROOT, out)}`);
}

/* ------------------------------------------------------------------ */
/* diff                                                               */
/* ------------------------------------------------------------------ */
async function readRGBA(file) {
  const { data, info } = await sharp(file).flatten({ background: "#050505" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/** Pads an RGBA image to w x h. Padded pixels get a colour that never matches the other image's padding. */
function pad(img, w, h, rgb) {
  if (img.width === w && img.height === h) return img.data;
  const out = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) out.set([...rgb, 255], i * 4);
  for (let y = 0; y < img.height; y++) img.data.copy(out, y * w * 4, y * img.width * 4, y * img.width * 4 + Math.min(img.width, w) * 4);
  return out;
}

function applyMasks(a, b, w, masks) {
  let masked = 0;
  for (const m of masks) {
    for (let y = Math.max(0, m.y); y < m.y + m.h; y++)
      for (let x = Math.max(0, m.x); x < Math.min(w, m.x + m.w); x++) {
        const i = (y * w + x) * 4;
        if (i + 3 >= a.length) continue;
        b[i] = a[i];
        b[i + 1] = a[i + 1];
        b[i + 2] = a[i + 2];
        b[i + 3] = a[i + 3];
        masked++;
      }
  }
  return masked;
}

function hotspots(diff, w, h) {
  const bands = [];
  for (let y0 = 0; y0 < h; y0 += BAND) {
    const y1 = Math.min(h, y0 + BAND);
    let n = 0, x0 = w, x1 = -1;
    for (let y = y0; y < y1; y++)
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (diff[i] === DIFF_RGB[0] && diff[i + 1] === DIFF_RGB[1] && diff[i + 2] === DIFF_RGB[2]) {
          n++;
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
        }
      }
    bands.push({ y0, y1, n, x0, x1, percent: (n / ((y1 - y0) * w)) * 100 });
  }
  // merge consecutive "hot" bands into regions
  const hot = bands.filter((b) => b.percent >= 4);
  const regions = [];
  for (const b of hot) {
    const last = regions.at(-1);
    if (last && last.y1 === b.y0) {
      last.y1 = b.y1;
      last.n += b.n;
      last.x0 = Math.min(last.x0, b.x0);
      last.x1 = Math.max(last.x1, b.x1);
    } else regions.push({ ...b });
  }
  return regions
    .map((r) => ({ y: [r.y0, r.y1], x: [r.x0, r.x1], diffPixels: r.n, percent: +((r.n / ((r.y1 - r.y0) * w)) * 100).toFixed(1) }))
    .sort((a, b) => b.diffPixels - a.diffPixels)
    .slice(0, 6);
}

async function compareOne(bp, s, runDir, previous) {
  const ref = refPath(bp, s.id);
  const site = sitePath(bp, s.id);
  const base = { bp, id: s.id, name: s.name };
  if (!fs.existsSync(ref)) return { ...base, status: "missing-reference" };
  if (!fs.existsSync(site)) return { ...base, status: "missing-site" };

  const A = await readRGBA(ref);
  const B = await readRGBA(site);
  const w = Math.max(A.width, B.width);
  const h = Math.max(A.height, B.height);
  const a = pad(A, w, h, [255, 0, 255]);
  const b = pad(B, w, h, [0, 255, 255]);
  const masks = s.masks?.[bp] ?? [];
  const maskedPixels = applyMasks(a, b, w, masks);

  const diff = Buffer.alloc(w * h * 4);
  const diffPixels = pixelmatch(a, b, diff, w, h, {
    threshold: manifest.pixelmatch.threshold,
    includeAA: manifest.pixelmatch.includeAA,
    alpha: 0.25,
    diffColor: DIFF_RGB,
    aaColor: [255, 210, 0],
  });
  const compared = w * h - maskedPixels;
  const diffPercent = +((diffPixels / compared) * 100).toFixed(2);
  const max = s.maxDiffPercent?.[bp] ?? manifest.defaultMaxDiffPercent;

  // files
  const f = (dir) => path.join(runDir, dir, bp, `${s.id}.png`);
  for (const d of ["site", "diff", "compare"]) fs.mkdirSync(path.dirname(f(d)), { recursive: true });
  fs.copyFileSync(site, f("site"));
  const diffPng = new PNG({ width: w, height: h });
  diff.copy(diffPng.data);
  fs.writeFileSync(f("diff"), PNG.sync.write(diffPng));
  const raw = (buf) => sharp(buf, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
  const gap = 16;
  await sharp({ create: { width: w * 3 + gap * 2, height: h, channels: 4, background: "#ff00ff" } })
    .composite([
      { input: await raw(a), left: 0, top: 0 },
      { input: await raw(b), left: w + gap, top: 0 },
      { input: await raw(diff), left: (w + gap) * 2, top: 0 },
    ])
    .png()
    .toFile(f("compare"));

  const prev = previous?.results?.find((r) => r.bp === bp && r.id === s.id)?.diffPercent;
  return {
    ...base,
    status: diffPercent <= max ? "pass" : "fail",
    diffPercent,
    maxDiffPercent: max,
    diffPixels,
    comparedPixels: compared,
    size: { reference: [A.width, A.height], site: [B.width, B.height] },
    heightDelta: B.height - A.height,
    hotspots: hotspots(diff, w, h),
    previousPercent: prev ?? null,
    trend: prev == null ? null : +(diffPercent - prev).toFixed(2),
    files: {
      reference: path.relative(ROOT, ref),
      site: path.relative(ROOT, f("site")),
      diff: path.relative(ROOT, f("diff")),
      compare: path.relative(ROOT, f("compare")),
    },
  };
}

function toMarkdown(report) {
  const rows = [...report.results].sort((a, b) => (b.diffPercent ?? -1) - (a.diffPercent ?? -1));
  const lines = [
    `# Pixel diff — ${report.run}`,
    "",
    `pixelmatch threshold ${report.settings.threshold}, includeAA ${report.settings.includeAA}. ` +
      `Pass: ${report.summary.passed}/${report.summary.total}, average ${report.summary.averageDiffPercent}%.`,
    "",
    "| bp | section | diff % | limit | Δ height | trend | status | top hotspots (y-range: %) |",
    "|---|---|---|---|---|---|---|---|",
  ];
  for (const r of rows) {
    if (r.diffPercent == null) {
      lines.push(`| ${r.bp} | ${r.name} | — | — | — | — | ${r.status} | |`);
      continue;
    }
    const hs = r.hotspots.slice(0, 3).map((h) => `${h.y[0]}–${h.y[1]}: ${h.percent}%`).join("; ");
    const trend = r.trend == null ? "—" : `${r.trend > 0 ? "+" : ""}${r.trend}`;
    lines.push(`| ${r.bp} | ${r.name} | ${r.diffPercent} | ${r.maxDiffPercent} | ${r.heightDelta} | ${trend} | ${r.status} | ${hs} |`);
  }
  return lines.join("\n") + "\n";
}

async function cmdDiff(args) {
  const bps = (args.bp ?? Object.keys(manifest.breakpoints).join(",")).split(",");
  const only = args.section ? args.section.split(",") : null;
  const run = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const runDir = path.join(VISUAL, "output", "runs", run);
  const latestFile = path.join(VISUAL, "output", "latest-report.json");
  const previous = fs.existsSync(latestFile) ? JSON.parse(fs.readFileSync(latestFile, "utf8")) : null;

  const results = [];
  for (const bp of bps)
    for (const s of manifest.sections) {
      if (only && !only.includes(s.id)) continue;
      results.push(await compareOne(bp, s, runDir, previous));
    }

  const measured = results.filter((r) => r.diffPercent != null);
  const report = {
    run,
    generatedAt: new Date().toISOString(),
    settings: { ...manifest.pixelmatch, band: BAND },
    summary: {
      total: results.length,
      passed: results.filter((r) => r.status === "pass").length,
      failed: results.filter((r) => r.status === "fail").length,
      missing: results.filter((r) => r.status.startsWith("missing")).length,
      averageDiffPercent: measured.length ? +(measured.reduce((s, r) => s + r.diffPercent, 0) / measured.length).toFixed(2) : null,
    },
    results,
  };

  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(path.join(runDir, "report.json"), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(runDir, "report.md"), toMarkdown(report));
  // Partial runs merge into the latest report so the trend stays per section
  const merged = previous && only ? { ...report, results: [...previous.results.filter((p) => !results.some((r) => r.bp === p.bp && r.id === p.id)), ...results] } : report;
  fs.writeFileSync(latestFile, JSON.stringify(merged, null, 2));

  process.stdout.write(toMarkdown(report));
  console.log(`\nReport: ${path.relative(ROOT, path.join(runDir, "report.json"))}`);
  process.exitCode = report.summary.failed || report.summary.missing ? 1 : 0;
}

const [cmd, ...rest] = process.argv.slice(2);
const args = parseArgs(rest);
try {
  if (cmd === "ref") await cmdRef(args._);
  else if (cmd === "diff") await cmdDiff(args);
  else {
    console.log("Usage:\n  node scripts/pixel-diff.mjs ref <bp> <id> <png-url-or-path>\n  node scripts/pixel-diff.mjs diff [--bp 1440,390] [--section top,services]");
    process.exitCode = 1;
  }
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
