// Security checks of the database and Storage as seen with the PUBLISHABLE key (what anyone on the internet has),
// plus a catalog check of RLS, policies and EXECUTE rights over the direct connection.
// usage: node scripts/cms/test-rls.mjs
import { requireEnv, redact } from "./env.mjs";
import { connect } from "./db.mjs";

const env = requireEnv(["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_DB_URL"]);
const U = env.SUPABASE_URL;
const K = env.SUPABASE_PUBLISHABLE_KEY;
const H = { apikey: K, "Content-Type": "application/json" };
if (K.startsWith("eyJ")) H.Authorization = `Bearer ${K}`;
const out = [];
const check = (name, ok, extra = "") => out.push(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? " — " + redact(extra) : ""}`);
const req = async (method, url, body, headers = H) => {
  const r = await fetch(url, { method, headers, body: body === undefined ? undefined : typeof body === "string" || body instanceof Blob ? body : JSON.stringify(body) });
  let text = await r.text();
  return { status: r.status, text: text.slice(0, 200) };
};

const tables = ["cms_drafts", "cms_changes", "cms_publications", "cms_state", "cms_media", "cms_login_attempts", "cms_migrations"];
for (const t of tables) {
  const r = await req("GET", `${U}/rest/v1/${t}?select=*&limit=1`);
  // either refused outright or an empty result: never a row
  check(`anon cannot read ${t}`, r.status >= 400 || r.text.trim() === "[]", `HTTP ${r.status} ${r.text}`);
  const w = await req("POST", `${U}/rest/v1/${t}`, {});
  check(`anon cannot insert into ${t}`, w.status >= 400, `HTTP ${w.status}`);
  const d = await req("DELETE", `${U}/rest/v1/${t}?id=not.is.null`);
  check(`anon cannot delete from ${t}`, d.status >= 400 || d.text.trim() === "" || d.text.trim() === "[]", `HTTP ${d.status}`);
}
const calls = {
  cms_publish: { p_snapshot: { site: {}, brief: {} }, p_media_ids: [], p_note: "x", p_schema_version: 1, p_source: "publish" },
  cms_restore: { p_publication_id: 1, p_note: "x" },
  cms_save_draft: { p_area: "site", p_locale: "uk", p_section: "hero", p_data: {}, p_expected_version: 1, p_changes: [] },
  cms_take_login_slot: { p_key: "x", p_window_seconds: 60, p_limit: 1 },
};
for (const [fn, args] of Object.entries(calls)) {
  const r = await req("POST", `${U}/rest/v1/rpc/${fn}`, args);
  check(`anon cannot call ${fn}`, r.status === 401 || r.status === 403 || r.status === 404, `HTTP ${r.status} ${r.text}`);
}
const pub = await req("GET", `${U}/rest/v1/rpc/cms_get_published`);
check("anon CAN read the current publication (only that)", pub.status === 200, `HTTP ${pub.status}`);
let parsed = null;
try {
  parsed = JSON.parse(pub.text.length < 200 ? pub.text : (await (await fetch(`${U}/rest/v1/rpc/cms_get_published`, { headers: H })).text()));
} catch {}
check("published payload has only id / createdAt / schemaVersion / snapshot", !parsed || Object.keys(parsed).sort().join(",") === "createdAt,id,schemaVersion,snapshot");

// Storage
const listD = await req("POST", `${U}/storage/v1/object/list/cms-drafts`, { prefix: "", limit: 10 });
check("anon cannot list cms-drafts", listD.status >= 400 || listD.text.trim() === "[]", `HTTP ${listD.status} ${listD.text}`);
const listP = await req("POST", `${U}/storage/v1/object/list/cms-public`, { prefix: "", limit: 10 });
check("anon cannot list cms-public", listP.status >= 400 || listP.text.trim() === "[]", `HTTP ${listP.status} ${listP.text}`);
const upH = { ...H, "Content-Type": "image/png" };
const png = new Blob([Buffer.from("89504e470d0a1a0a0000000d49484452", "hex")]);
for (const b of ["cms-drafts", "cms-public"]) {
  const r = await req("POST", `${U}/storage/v1/object/${b}/rls-test-${Date.now()}.png`, png, upH);
  check(`anon cannot upload to ${b}`, r.status >= 400, `HTTP ${r.status} ${r.text}`);
}
const sign = await req("POST", `${U}/storage/v1/object/sign/cms-drafts/drafts/x.png`, { expiresIn: 60 });
check("anon cannot create signed URLs for drafts", sign.status >= 400, `HTTP ${sign.status}`);
const upSign = await req("POST", `${U}/storage/v1/object/upload/sign/cms-drafts/drafts/x.png`, {});
check("anon cannot create upload URLs", upSign.status >= 400, `HTTP ${upSign.status}`);

// Catalog
const db = await connect();
try {
  const rls = await db.query(`select c.relname, c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname like 'cms\\_%' and c.relkind = 'r' order by 1`);
  check(`RLS enabled on every cms table (${rls.rows.length})`, rls.rows.length >= 7 && rls.rows.every((r) => r.relrowsecurity), rls.rows.filter((r) => !r.relrowsecurity).map((r) => r.relname).join(","));
  const pol = await db.query(`select tablename, policyname from pg_policies where schemaname = 'public' and tablename like 'cms\\_%'`);
  check("no RLS policies on cms tables (nothing is opened)", pol.rows.length === 0, pol.rows.map((r) => r.tablename + ":" + r.policyname).join(","));
  const tp = await db.query(
    `select c.relname, r.rolname, p.priv from pg_class c join pg_namespace n on n.oid = c.relnamespace cross join (values ('anon'),('authenticated')) r(rolname)
     cross join (values ('SELECT'),('INSERT'),('UPDATE'),('DELETE')) p(priv)
     where n.nspname = 'public' and c.relname like 'cms\\_%' and c.relkind in ('r','S') and c.relkind = 'r' and has_table_privilege(r.rolname, c.oid, p.priv)`,
  );
  check("anon/authenticated have no table privileges on cms tables", tp.rows.length === 0, tp.rows.map((r) => `${r.rolname}:${r.priv}:${r.relname}`).slice(0, 6).join(","));
  const fp = await db.query(
    `select p.proname, r.rolname, has_function_privilege(r.rolname, p.oid, 'EXECUTE') as can, p.prosecdef
     from pg_proc p join pg_namespace n on n.oid = p.pronamespace cross join (values ('anon'),('authenticated'),('public')) r(rolname)
     where n.nspname = 'public' and p.proname like 'cms\\_%' and r.rolname <> 'public' order by 1, 2`,
  );
  const exec = fp.rows.filter((r) => r.can).map((r) => `${r.proname}:${r.rolname}`);
  check("anon/authenticated may EXECUTE only cms_get_published", exec.every((e) => e.startsWith("cms_get_published:")) && exec.length === 2, exec.join(","));
  const definer = [...new Set(fp.rows.filter((r) => r.prosecdef).map((r) => r.proname))];
  check("only cms_get_published is SECURITY DEFINER", definer.length === 1 && definer[0] === "cms_get_published", definer.join(","));
  const pubExec = await db.query(`select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname like 'cms\\_%' and has_function_privilege('public', p.oid, 'EXECUTE')`);
  check("PUBLIC pseudo-role has no EXECUTE on cms functions", pubExec.rows.length === 0, pubExec.rows.map((r) => r.proname).join(","));
  const sp = await db.query(`select policyname, qual, with_check from pg_policies where schemaname='storage' and tablename='objects'`);
  const touching = sp.rows.filter((r) => /cms-/.test(`${r.qual} ${r.with_check}`) || (!/bucket_id/.test(`${r.qual} ${r.with_check}`) && (r.qual || r.with_check)));
  check("no storage policy opens the cms buckets", touching.length === 0, touching.map((r) => r.policyname).join(","));
  const bk = await db.query(`select id, public, file_size_limit from storage.buckets where id like 'cms-%' order by id`);
  check("buckets: cms-drafts private, cms-public public, 50 MB limit", bk.rows.length === 2 && bk.rows[0].id === "cms-drafts" && !bk.rows[0].public && bk.rows[1].public && bk.rows.every((r) => Number(r.file_size_limit) === 52428800));
} finally {
  await db.end();
}

console.log(out.join("\n"));
process.exit(out.some((l) => l.startsWith("FAIL")) ? 1 : 0);
