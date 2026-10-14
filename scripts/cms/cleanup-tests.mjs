// Removes the test data of 14.10.2026: publications №2–№32, the 5 test photos (rows + Storage files) and, with
// --with-history, the test change log. Keeps №1 (source) and the current publication.
// Default is a DRY RUN; nothing is deleted without --execute. Make a backup first (npm run cms:backup).
// usage: node scripts/cms/cleanup-tests.mjs [--execute] [--with-history]
import { createClient } from "@supabase/supabase-js";
import { connect } from "./db.mjs";
import { redact, requireEnv } from "./env.mjs";

const EXECUTE = process.argv.includes("--execute");
const WITH_HISTORY = process.argv.includes("--with-history");
const env = requireEnv(["SUPABASE_URL", "SUPABASE_SECRET_KEY"]);
const db = await connect();
const storage = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } }).storage;

try {
  const current = (await db.query("select current_publication_id as id from public.cms_state")).rows[0]?.id;
  const keep = [1, Number(current)];
  const del = (await db.query("select id from public.cms_publications where id between 2 and 32 and id <> all($1::bigint[]) order by id", [keep])).rows.map((r) => Number(r.id));
  // safety: nothing kept may depend on what is deleted
  const keptRefs = (await db.query("select id, restored_from from public.cms_publications where id = any($1::bigint[]) and restored_from = any($2::bigint[])", [keep, del])).rows;
  if (keptRefs.length) throw new Error("a kept publication was restored from a deleted one — stop");
  const media = (await db.query(
    `select m.id, m.draft_path, m.public_path from public.cms_media m
      where not exists (select 1 from public.cms_publications p where p.id = any($1::bigint[]) and m.id = any(p.media_ids))
        and not exists (select 1 from public.cms_drafts d where d.data::text like '%' || m.id::text || '%')
        and not exists (select 1 from public.cms_publications p where p.id = any($1::bigint[]) and m.public_path is not null and p.snapshot::text like '%' || m.public_path || '%')`,
    [keep],
  )).rows;
  const files = { "cms-drafts": media.map((m) => m.draft_path), "cms-public": media.filter((m) => m.public_path).map((m) => m.public_path) };
  const changes = (await db.query("select count(*)::int as n from public.cms_changes")).rows[0].n;

  console.log(`keep publications: №${keep.join(", №")} (current: №${current})`);
  console.log(`delete publications: ${del.length} (${del.length ? `№${del[0]}–№${del.at(-1)}` : "none"})`);
  console.log(`delete media rows: ${media.length}; files: cms-drafts ${files["cms-drafts"].length}, cms-public ${files["cms-public"].length}`);
  console.log(`change log: ${WITH_HISTORY ? `delete all ${changes} rows` : `keep ${changes} rows (add --with-history to delete)`}`);
  if (!EXECUTE) {
    console.log("DRY RUN — nothing deleted.");
    process.exit(0);
  }

  await db.query("begin");
  try {
    await db.query("delete from public.cms_publications where id = any($1::bigint[])", [del]);
    await db.query("delete from public.cms_media where id = any($1::uuid[])", [media.map((m) => m.id)]);
    if (WITH_HISTORY) await db.query("delete from public.cms_changes");
    const still = (await db.query("select current_publication_id from public.cms_state")).rows[0].current_publication_id;
    if (Number(still) !== Number(current)) throw new Error("current publication changed — rolled back");
    await db.query("commit");
  } catch (e) {
    await db.query("rollback");
    throw e;
  }
  // files after the database (a file without a row is harmless; a row without its file is not)
  for (const [bucket, paths] of Object.entries(files))
    if (paths.length) {
      const { error } = await storage.from(bucket).remove(paths);
      if (error) console.log(`storage ${bucket}: ${redact(error.message)}`);
    }
  console.log("cleanup done");
} finally {
  await db.end();
}
