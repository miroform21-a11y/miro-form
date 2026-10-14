// Reads .env.local for the CMS scripts. Values are never printed; only names and "set / missing".
import fs from "node:fs";
import path from "node:path";
import { root } from "./jiti.mjs";

export function loadEnv() {
  const file = path.join(root, ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

export function requireEnv(names) {
  loadEnv();
  const missing = names.filter((n) => !process.env[n]?.trim());
  if (missing.length) {
    console.error(`Missing in .env.local: ${missing.join(", ")}`);
    process.exit(2);
  }
  return Object.fromEntries(names.map((n) => [n, process.env[n].trim()]));
}

/** Redacts every configured secret from a text before it is printed */
export function redact(text) {
  let s = String(text);
  for (const n of ["SUPABASE_SECRET_KEY", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_DB_URL", "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET"]) {
    const v = process.env[n];
    if (v && v.length > 6) s = s.split(v).join(`<${n}>`);
  }
  return s.replace(/postgres(ql)?:\/\/[^\s"']+/g, "<db-url>");
}
