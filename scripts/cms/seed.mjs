// First fill of the CMS from src/content: drafts (version 1) + publication №1 (source "seed"), then a read-back
// through the public function with the publishable key must equal src/content exactly. Refuses to run twice.
// usage: node scripts/cms/seed.mjs
import { createClient } from "@supabase/supabase-js";
import { load } from "./jiti.mjs";
import { redact, requireEnv } from "./env.mjs";

const env = requireEnv(["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SECRET_KEY"]);
const { sourceSnapshot, AREAS, LOCALES, SECTIONS, CMS_SCHEMA_VERSION } = await load("src/cms/model.ts");
const { snapshotErrors } = await load("src/cms/validate.ts");

const db = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const fail = (m) => {
  console.error(redact(m));
  process.exit(1);
};

const { data: state, error: e0 } = await db.from("cms_state").select("current_publication_id").maybeSingle();
if (e0) fail("read state: " + e0.message);
if (state) fail(`Already seeded (site shows publication №${state.current_publication_id}). Nothing changed.`);
const { count } = await db.from("cms_drafts").select("*", { count: "exact", head: true });
if (count) fail(`cms_drafts already has ${count} rows. Nothing changed.`);

const snap = sourceSnapshot();
const errs = snapshotErrors({ site: snap.site, brief: snap.brief }, new URL(env.SUPABASE_URL).host);
if (errs.length) fail("source content does not pass validation: " + errs[0].where + " " + errs[0].issue.message);

const rows = [];
for (const a of AREAS) for (const l of LOCALES) for (const s of SECTIONS[a]) rows.push({ area: a, locale: l, section: s, data: snap[a][l][s], version: 1 });
const { error: e1 } = await db.from("cms_drafts").insert(rows);
if (e1) fail("insert drafts: " + e1.message);
const { data: id, error: e2 } = await db.rpc("cms_publish", { p_snapshot: snap, p_media_ids: [], p_note: "Исходный контент сайта (src/content)", p_schema_version: CMS_SCHEMA_VERSION, p_source: "seed" });
if (e2) fail("publish: " + e2.message);
console.log(`drafts: ${rows.length} sections, publication №${id}`);

// read back exactly as the public site does
const headers = { apikey: env.SUPABASE_PUBLISHABLE_KEY };
if (env.SUPABASE_PUBLISHABLE_KEY.startsWith("eyJ")) headers.Authorization = `Bearer ${env.SUPABASE_PUBLISHABLE_KEY}`;
const res = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/cms_get_published`, { headers });
const body = await res.json();
const same = res.ok && JSON.stringify(body.snapshot) === JSON.stringify(snap);
// Postgres jsonb does not keep key order; compare canonically as well
const canon = (v) => (Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v);
const sameCanon = res.ok && JSON.stringify(canon(body.snapshot)) === JSON.stringify(canon(snap));
console.log(`read-back through cms_get_published (publishable key): HTTP ${res.status}, identical to src/content: ${sameCanon ? "yes" : "NO"}${same ? "" : " (key order differs — jsonb)"}`);
process.exit(sameCanon ? 0 : 1);
