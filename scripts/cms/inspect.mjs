// Read-only overview of what already exists in the database (no changes). usage: node scripts/cms/inspect.mjs
import { connect } from "./db.mjs";

const db = await connect();
try {
  const q = async (label, sql) => console.log(label, JSON.stringify((await db.query(sql)).rows));
  await q("public tables:", `select table_name from information_schema.tables where table_schema='public' order by 1`);
  await q("public functions:", `select p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' order by 1`);
  await q("storage buckets:", `select id, public from storage.buckets order by 1`);
  await q("storage objects per bucket:", `select bucket_id, count(*)::int from storage.objects group by 1 order by 1`);
  await q("storage.objects policies:", `select policyname from pg_policies where schemaname='storage' and tablename='objects' order by 1`);
  await q("server version:", `select current_setting('server_version') as v`);
} finally {
  await db.end();
}
