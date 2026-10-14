// Test housekeeping: clears the login throttle counters (only throttle rows; no content).
// usage: node scripts/cms/clear-login-attempts.mjs
import { connect } from "./db.mjs";

const db = await connect();
try {
  const r = await db.query("delete from public.cms_login_attempts");
  console.log(`login throttle counters cleared: ${r.rowCount}`);
} finally {
  await db.end();
}
