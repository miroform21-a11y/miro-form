// Unit checks of the admin session token and password comparison (no database). usage: node scripts/cms/test-session.mjs
import { load } from "./jiti.mjs";

const s = await load("src/server/cms/session.ts");
const out = [];
const check = (name, ok) => out.push(`${ok ? "PASS" : "FAIL"}  ${name}`);

const secret = "s".repeat(48);
const password = "correct horse battery staple 42";
const now = Date.UTC(2026, 9, 14, 12);
const t = s.createSessionToken(secret, password, now);

check("fresh token verifies", !!s.verifySessionToken(t, secret, password, now + 1000));
check("expires after 12 hours", !s.verifySessionToken(t, secret, password, now + 12 * 3600 * 1000 + 1000));
check("valid just before expiry", !!s.verifySessionToken(t, secret, password, now + 12 * 3600 * 1000 - 5000));
check("other secret → invalid", !s.verifySessionToken(t, "x".repeat(48), password, now));
check("changed password → invalid (logs every device out)", !s.verifySessionToken(t, secret, password + "!", now));
const [body, mac] = t.split(".");
const forged = Buffer.from(JSON.stringify({ v: 1, iat: now / 1000, exp: now / 1000 + 10 * 365 * 86400, sid: "x" })).toString("base64url");
check("edited payload with the old signature → invalid", !s.verifySessionToken(`${forged}.${mac}`, secret, password, now));
check("truncated signature → invalid", !s.verifySessionToken(`${body}.${mac.slice(0, -2)}`, secret, password, now));
check("garbage → invalid", !s.verifySessionToken("abc", secret, password, now) && !s.verifySessionToken(undefined, secret, password, now) && !s.verifySessionToken("a.b.c", secret, password, now));
check("token issued in the future → invalid", !s.verifySessionToken(s.createSessionToken(secret, password, now + 3600_000), secret, password, now));
check("two tokens differ (random id)", s.createSessionToken(secret, password, now) !== s.createSessionToken(secret, password, now));
check("password match", s.passwordMatches(password, password) && !s.passwordMatches(password + " ", password) && !s.passwordMatches("", password));
const c1 = s.sessionCookie(true);
const c2 = s.sessionCookie(false);
check("HTTPS cookie: __Host-, Secure, HttpOnly, SameSite=Strict, Path=/", c1.name.startsWith("__Host-") && c1.options.secure && c1.options.httpOnly && c1.options.sameSite === "strict" && c1.options.path === "/");
check("local http cookie: HttpOnly, SameSite=Strict, not Secure", c2.name === "mf_admin" && c2.options.httpOnly && !c2.options.secure);
const h = new Headers({ "x-real-ip": "1.2.3.4", "x-forwarded-for": "5.6.7.8", "x-forwarded-proto": "https" });
delete process.env.VERCEL;
check("off Vercel the client IP headers are ignored", s.clientIp(h) === "local");
process.env.VERCEL = "1";
check("on Vercel x-real-ip (set by the platform) is used", s.clientIp(h) === "1.2.3.4");
check("on Vercel always secure", s.isSecureRequest(new Headers()));
delete process.env.VERCEL;

console.log(out.join("\n"));
process.exit(out.some((l) => l.startsWith("FAIL")) ? 1 : 0);
