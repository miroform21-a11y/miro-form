// Checks that a CMS backup folder (scripts/cms/backup.mjs) is complete and restorable: checksums of every table file
// and every Storage file, row counts and contents against the live database, every file referenced by publications
// present in the backup. Read-only. usage: node scripts/cms/verify-backup.mjs <backupDir>
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { connect } from "./db.mjs";

const dir = process.argv[2];
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const out = [];
const check = (name, ok, extra = "") => out.push(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? " — " + extra : ""}`);
const m = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8"));

const tables = {};
for (const [t, info] of Object.entries(m.tables)) {
  const raw = fs.readFileSync(path.join(dir, `${t}.json`), "utf8");
  tables[t] = JSON.parse(raw);
  check(`${t}.json checksum and row count`, sha(raw) === info.sha256 && tables[t].length === info.rows, `${tables[t].length} rows`);
}
let okFiles = 0;
for (const f of m.files) if (sha(fs.readFileSync(path.join(dir, "storage", f.bucket, f.path))) === f.sha256) okFiles++;
check(`storage files checksums (${okFiles}/${m.files.length})`, okFiles === m.files.length);

const db = await connect();
try {
  for (const t of Object.keys(m.tables)) {
    const live = (await db.query(`select count(*)::int as n from public.${t}`)).rows[0].n;
    check(`${t}: backup rows = live rows`, live === tables[t].length, `${tables[t].length} / ${live}`);
  }
  const canon = (v) => (Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v);
  const pubs = (await db.query("select id, snapshot from public.cms_publications")).rows;
  const samePubs = pubs.every((p) => JSON.stringify(canon(p.snapshot)) === JSON.stringify(canon(tables.cms_publications.find((b) => Number(b.id) === Number(p.id))?.snapshot)));
  check("every publication snapshot identical in the backup", samePubs);
  const drafts = (await db.query("select area, locale, section, data, version from public.cms_drafts")).rows;
  const sameDrafts = drafts.every((d) => {
    const b = tables.cms_drafts.find((x) => x.area === d.area && x.locale === d.locale && x.section === d.section);
    return b && b.version === d.version && JSON.stringify(canon(b.data)) === JSON.stringify(canon(d.data));
  });
  check("every draft identical in the backup", sameDrafts);
  const state = (await db.query("select current_publication_id from public.cms_state")).rows[0];
  check("current publication recorded", Number(tables.cms_state[0]?.current_publication_id) === Number(state.current_publication_id), `№${state.current_publication_id}`);
} finally {
  await db.end();
}
// every file a publication points to must be in the backup
const publicFiles = new Set(m.files.filter((f) => f.bucket === "cms-public").map((f) => f.path));
const needed = new Set();
for (const p of tables.cms_publications) for (const x of JSON.stringify(p.snapshot).matchAll(/cms-public\/(media\/[0-9a-f]{64}\.[a-z0-9]+)/g)) needed.add(x[1]);
check(`files referenced by publications present in the backup (${needed.size})`, [...needed].every((f) => publicFiles.has(f)));
const draftFiles = new Set(m.files.filter((f) => f.bucket === "cms-drafts").map((f) => f.path));
check("every media row has its draft file in the backup", tables.cms_media.every((r) => draftFiles.has(r.draft_path)));
console.log(out.join("\n"));
process.exit(out.some((l) => l.startsWith("FAIL")) ? 1 : 0);
