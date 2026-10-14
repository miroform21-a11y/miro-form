// Compares what the site currently shows (cms_get_published, publishable key) with src/content, section by section.
// usage: node scripts/cms/compare-published.mjs
import { load } from "./jiti.mjs";
import { requireEnv } from "./env.mjs";

const env = requireEnv(["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY"]);
const { sourceSnapshot, AREAS, LOCALES, SECTIONS } = await load("src/cms/model.ts");
const { same } = await load("src/admin/path.ts");
const headers = { apikey: env.SUPABASE_PUBLISHABLE_KEY };
if (env.SUPABASE_PUBLISHABLE_KEY.startsWith("eyJ")) headers.Authorization = `Bearer ${env.SUPABASE_PUBLISHABLE_KEY}`;
const body = await (await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/cms_get_published`, { headers })).json();
const src = sourceSnapshot();
const diff = [];
for (const a of AREAS) for (const l of LOCALES) for (const s of SECTIONS[a]) if (!same(body.snapshot[a][l][s], src[a][l][s])) diff.push(`${a}/${l}/${s}`);
console.log(`published №${body.id}: ${diff.length ? "differs from src/content in " + diff.join(", ") : "identical to src/content"}`);
process.exit(diff.length ? 1 : 0);
