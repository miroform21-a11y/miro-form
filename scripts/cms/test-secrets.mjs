// Looks for secrets in everything a browser can receive: the built client files (.next/static) and the HTML of
// public and admin pages. Values are compared, never printed. usage: node scripts/cms/test-secrets.mjs [baseUrl]
import fs from "node:fs";
import path from "node:path";
import { root } from "./jiti.mjs";
import { loadEnv } from "./env.mjs";

loadEnv();
const BASE = process.argv[2];
const secretNames = ["ADMIN_PASSWORD", "ADMIN_SESSION_SECRET", "SUPABASE_SECRET_KEY", "SUPABASE_DB_URL", "TELEGRAM_BOT_TOKEN"];
const needles = secretNames.map((n) => [n, process.env[n]]).filter(([, v]) => v && v.length >= 8);
// patterns of secret-looking material regardless of the local values
const patterns = [/sb_secret_[A-Za-z0-9_-]{10,}/, /"role"\s*:\s*"service_role"/, /postgres(ql)?:\/\/[^"'\s]+:[^"'\s]+@/];
const out = [];
const check = (name, ok, extra = "") => out.push(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? " — " + extra : ""}`);

const files = [];
(function walk(d) {
  if (!fs.existsSync(d)) return;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) e.isDirectory() ? walk(path.join(d, e.name)) : files.push(path.join(d, e.name));
})(path.join(root, ".next", "static"));
const hits = [];
for (const f of files) {
  const t = fs.readFileSync(f, "utf8");
  for (const [n, v] of needles) if (t.includes(v)) hits.push(`${n} in ${path.relative(root, f)}`);
  for (const p of patterns) if (p.test(t)) hits.push(`${p} in ${path.relative(root, f)}`);
  // the service_role JWT body ("role":"service_role") also shows up base64-encoded inside a JWT
  if (/eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]*cm9sZSI6InNlcnZpY2Vfcm9sZS/.test(t)) hits.push(`service_role JWT in ${path.relative(root, f)}`);
}
check(`no secret in client files (${files.length} files, ${needles.length} values + patterns)`, files.length > 0 && hits.length === 0, hits.slice(0, 5).join("; "));
const pubKey = process.env.SUPABASE_PUBLISHABLE_KEY;
if (pubKey) check("publishable key not shipped to the browser either (reads are server-side)", !files.some((f) => fs.readFileSync(f, "utf8").includes(pubKey)));

if (BASE) {
  const pages = ["/", "/en", "/privacy", "/en/privacy-policy", "/brief", "/en/brief", "/thank-you", "/en/thank-you", "/admin/login"];
  const pageHits = [];
  for (const p of pages) {
    const t = await (await fetch(BASE + p)).text();
    for (const [n, v] of needles) if (t.includes(v)) pageHits.push(`${n} in ${p}`);
    if (pubKey && t.includes(pubKey)) pageHits.push(`publishable key in ${p}`);
    for (const pat of patterns) if (pat.test(t)) pageHits.push(`${pat} in ${p}`);
  }
  check(`no secret in page HTML (${pages.length} pages)`, pageHits.length === 0, pageHits.join("; "));
}
console.log(out.join("\n"));
process.exit(out.some((l) => l.startsWith("FAIL")) ? 1 : 0);
