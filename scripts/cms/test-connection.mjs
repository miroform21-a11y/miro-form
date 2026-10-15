// Connection check only: TLS with the Supabase root CA (chain + hostname verified), then `select 1`.
// Changes nothing in the database; prints no secrets. usage: node scripts/cms/test-connection.mjs
import { connect } from "./db.mjs";
import { redact } from "./env.mjs";

let db;
try {
  db = await connect();
  const s = db.connection.stream;
  const cert = typeof s.getPeerCertificate === "function" ? s.getPeerCertificate(true) : null;
  console.log(`TLS: ${typeof s.getProtocol === "function" ? s.getProtocol() : "none"}, certificate verified: ${s.authorized === true}, server: ${cert?.subject?.CN ?? "?"}, issued by: ${cert?.issuer?.CN ?? "?"}`);
  const { rows } = await db.query("select 1 as ok");
  console.log(`select 1 → ${rows[0]?.ok}`);
} catch (e) {
  console.log("FAILED: " + redact(e.message));
  process.exitCode = 1;
} finally {
  await db?.end().catch(() => {});
}
