// Read-only: what a cleanup of test publications / media would touch (dependencies), nothing is changed.
// usage: node scripts/cms/inspect-cleanup.mjs
import { connect } from "./db.mjs";

const db = await connect();
try {
  const st = (await db.query("select current_publication_id from public.cms_state")).rows[0];
  console.log("current publication:", st?.current_publication_id);
  const pubs = (await db.query("select id, source, restored_from, note, cardinality(media_ids) as media, length(snapshot::text) as bytes, created_at from public.cms_publications order by id")).rows;
  console.log("publications:", pubs.length);
  for (const p of pubs) console.log(`  №${p.id} ${p.source}${p.restored_from ? " ← №" + p.restored_from : ""} media=${p.media} ${p.note.slice(0, 50)}`);
  const refs = (await db.query("select id, restored_from from public.cms_publications where restored_from is not null")).rows;
  console.log("restore references (row → source):", refs.map((r) => `${r.id}→${r.restored_from}`).join(", ") || "none");
  const media = (await db.query("select m.id, m.kind, m.status, m.draft_path, m.public_path, m.bytes, (select array_agg(p.id order by p.id) from public.cms_publications p where m.id = any(p.media_ids)) as used_by from public.cms_media m order by m.created_at")).rows;
  console.log("media rows:", media.length);
  for (const m of media) console.log(`  ${m.id.slice(0, 8)} ${m.kind} ${m.status} draft=${m.draft_path} public=${m.public_path ?? "-"} used_by=${JSON.stringify(m.used_by)}`);
  const drafts = (await db.query("select count(*)::int as n from public.cms_drafts where data::text like '%media:%' or data::text like '%cms-public%'")).rows[0].n;
  console.log("draft sections referencing uploaded/published files:", drafts);
  const objs = (await db.query("select bucket_id, name, (metadata->>'size')::int as size from storage.objects where bucket_id like 'cms-%' order by bucket_id, name")).rows;
  console.log("storage objects:", objs.length);
  for (const o of objs) console.log(`  ${o.bucket_id}/${o.name} ${o.size}`);
  const ch = (await db.query("select count(*)::int as all, count(*) filter (where undone_at is null)::int as active, min(created_at) as first, max(created_at) as last from public.cms_changes")).rows[0];
  console.log("change log rows:", JSON.stringify(ch));
} finally {
  await db.end();
}
