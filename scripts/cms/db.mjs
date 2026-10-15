// Direct Postgres connection for migrations and catalog checks (SUPABASE_DB_URL, local machine only).
import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { root } from "./jiti.mjs";
import { redact, requireEnv } from "./env.mjs";

/**
 * TLS is always verified. Supabase signs its database certificates with its own root CA: download it once from
 * the dashboard (Database settings → SSL configuration → Download certificate) to supabase/prod-ca-2021.crt
 * (a public certificate, not a secret).
 */
export async function connect() {
  const { SUPABASE_DB_URL } = requireEnv(["SUPABASE_DB_URL"]);
  const caFile = path.join(root, "supabase", "prod-ca-2021.crt");
  const url = new URL(SUPABASE_DB_URL);
  url.searchParams.delete("sslmode");
  const client = new pg.Client({
    connectionString: url.toString(),
    ssl: fs.existsSync(caFile) ? { ca: fs.readFileSync(caFile, "utf8"), rejectUnauthorized: true } : { rejectUnauthorized: true },
    statement_timeout: 60_000,
  });
  try {
    await client.connect();
  } catch (e) {
    const msg = redact(e.message);
    if (/self[- ]signed|unable to verify|certificate/i.test(msg) && !fs.existsSync(caFile))
      console.error("TLS: the Supabase CA certificate is needed → save it as supabase/prod-ca-2021.crt (see scripts/cms/db.mjs).");
    throw new Error("database connection failed: " + msg);
  }
  return client;
}
