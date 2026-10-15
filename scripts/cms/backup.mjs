// Full CMS backup to a local folder: every CMS table as JSON + every file of both buckets + SHA-256 manifest.
// usage: node scripts/cms/backup.mjs [outDir]   (default: Desktop/MIROFORM-backups/<date>-cms)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { redact, requireEnv } from "./env.mjs";

const env = requireEnv(["SUPABASE_URL", "SUPABASE_SECRET_KEY"]);
const db = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const out = process.argv[2] ?? path.join(os.homedir(), "Desktop", "MIROFORM-backups", `${stamp}-cms`);
if (fs.existsSync(out)) {
  console.error("refusing to overwrite " + out);
  process.exit(1);
}
fs.mkdirSync(out, { recursive: true });
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const manifest = { createdAt: new Date().toISOString(), project: new URL(env.SUPABASE_URL).host, tables: {}, files: [] };

for (const t of ["cms_drafts", "cms_changes", "cms_publications", "cms_state", "cms_media"]) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from(t).select("*").range(from, from + 999);
    if (error) throw new Error(redact(`${t}: ${error.message}`));
    rows.push(...data);
    if (data.length < 1000) break;
  }
  const json = JSON.stringify(rows, null, 1);
  fs.writeFileSync(path.join(out, `${t}.json`), json);
  manifest.tables[t] = { rows: rows.length, sha256: sha(json) };
}

async function listAll(bucket, prefix = "") {
  const files = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await db.storage.from(bucket).list(prefix, { limit: 1000, offset });
    if (error) throw new Error(redact(`${bucket}: ${error.message}`));
    for (const e of data) {
      const p = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.id === null) files.push(...(await listAll(bucket, p)));
      else files.push(p);
    }
    if (data.length < 1000) break;
  }
  return files;
}

for (const bucket of ["cms-drafts", "cms-public"]) {
  for (const p of await listAll(bucket)) {
    const { data, error } = await db.storage.from(bucket).download(p);
    if (error) throw new Error(redact(`${bucket}/${p}: ${error.message}`));
    const buf = Buffer.from(await data.arrayBuffer());
    const dest = path.join(out, "storage", bucket, p);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buf);
    manifest.files.push({ bucket, path: p, bytes: buf.length, sha256: sha(buf) });
  }
}
fs.writeFileSync(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ out, tables: Object.fromEntries(Object.entries(manifest.tables).map(([k, v]) => [k, v.rows])), files: manifest.files.length }, null, 1));
