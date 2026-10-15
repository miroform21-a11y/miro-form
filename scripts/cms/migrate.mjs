// Applies supabase/migrations/*.sql in order, each in its own transaction, once.
// usage: node scripts/cms/migrate.mjs [--dry-run]
import fs from "node:fs";
import path from "node:path";
import { root } from "./jiti.mjs";
import { connect } from "./db.mjs";
import { redact } from "./env.mjs";

const dry = process.argv.includes("--dry-run");
const dir = path.join(root, "supabase", "migrations");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

const db = await connect();
try {
  const exists = (await db.query(`select to_regclass('public.cms_migrations') as t`)).rows[0].t !== null;
  if (dry && !exists) {
    for (const f of files) console.log(`would apply  ${f}`);
    process.exit(0);
  }
  await db.query(`create table if not exists public.cms_migrations (name text primary key, applied_at timestamptz not null default now())`);
  await db.query(`alter table public.cms_migrations enable row level security`);
  await db.query(`revoke all on public.cms_migrations from public, anon, authenticated`);
  const { rows } = await db.query(`select name from public.cms_migrations`);
  const done = new Set(rows.map((r) => r.name));
  for (const f of files) {
    if (done.has(f)) {
      console.log(`skip  ${f} (applied)`);
      continue;
    }
    if (dry) {
      console.log(`would apply  ${f}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(dir, f), "utf8");
    await db.query("begin");
    try {
      await db.query(sql);
      await db.query(`insert into public.cms_migrations (name) values ($1)`, [f]);
      await db.query("commit");
      console.log(`apply ${f} — ok`);
    } catch (e) {
      await db.query("rollback");
      throw new Error(`${f}: ${redact(e.message)}`);
    }
  }
} finally {
  await db.end();
}
