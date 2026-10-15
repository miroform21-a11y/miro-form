// Admin authentication checks against a running server.
// usage: node scripts/cms/test-auth.mjs <baseUrl> <mode: dev|prod-no-db|prod>
//   dev         — next dev without Supabase: memory throttle, full login / logout / limit cycle
//   prod-no-db  — next start without Supabase: login must fail closed
//   prod        — next start with Supabase: login works, throttle in the database
// Also calls every admin Server Action directly (no cookie, forged cookie, foreign Origin).
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { root } from "./jiti.mjs";
import { loadEnv } from "./env.mjs";

loadEnv();
const [BASE, MODE = "dev"] = process.argv.slice(2);
const { chromium } = createRequire(path.join(root, "package.json"))("playwright");
const PASSWORD = process.env.ADMIN_PASSWORD;
const out = [];
const check = (name, ok, extra = "") => out.push(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? " — " + extra : ""}`);

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
const login = async (pw) => {
  await page.goto(BASE + "/admin/login");
  await page.getByLabel("Пароль администратора").fill(pw);
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForTimeout(MODE === "dev" ? 2500 : 1800);
};

await page.goto(BASE + "/admin");
check("/admin without session → login page", page.url().endsWith("/admin/login"));
await page.goto(BASE + "/admin/uk/site/hero");
check("section page without session → login page", page.url().endsWith("/admin/login"));
await page.goto(BASE + "/admin/preview");
check("preview without session → login page", page.url().endsWith("/admin/login"));

if (MODE === "prod-no-db") {
  await login(PASSWORD);
  check("without the database login fails closed", (await page.getByText("Вход временно недоступен").count()) > 0 && !(await ctx.cookies()).length);
} else {
  await login("wrong-password-123");
  check("wrong password → generic error, no cookie", (await page.getByText("Неверный пароль.").count()) > 0 && !(await ctx.cookies()).some((c) => c.name.includes("mf_admin")));
  await login(PASSWORD);
  const cookie = (await ctx.cookies()).find((c) => c.name.includes("mf_admin"));
  check("correct password → admin opens", !page.url().endsWith("/login"), page.url());
  check("session cookie HttpOnly + SameSite=Strict", !!cookie && cookie.httpOnly && cookie.sameSite === "Strict", JSON.stringify(cookie && { name: cookie.name, httpOnly: cookie.httpOnly, sameSite: cookie.sameSite, secure: cookie.secure }));
  check("cookie value contains no password", !!cookie && !cookie.value.includes(PASSWORD.slice(0, 8)));
  await page.getByRole("button", { name: "Выйти" }).first().click().catch(() => {});
  await page.waitForTimeout(1500);
  check("logout → cookie removed, back to login", !(await ctx.cookies()).some((c) => c.name.includes("mf_admin")) && page.url().endsWith("/admin/login"));
  if (MODE === "dev") {
    // 2 attempts used; 3 more wrong ones fill the window of 5, the 6th is refused even with the right password
    for (let i = 0; i < 3; i++) await login("wrong-" + i);
    await login(PASSWORD);
    check("6th attempt in 15 min refused even with the right password", (await page.getByText("Слишком много попыток").count()) > 0 && !(await ctx.cookies()).some((c) => c.name.includes("mf_admin")));
  }
}

// direct Server Action calls
const manifests = [path.join(root, ".next/server/server-reference-manifest.json"), path.join(root, ".next/dev/server/server-reference-manifest.json")].filter((f) => fs.existsSync(f));
let ids = [];
if (manifests.length) {
  const m = JSON.parse(fs.readFileSync(manifests[0], "utf8"));
  ids = Object.entries(m.node ?? {})
    .filter(([, v]) => JSON.stringify(v).includes("cms-actions"))
    .map(([id, v]) => ({ id, name: v.exportedName ?? v.name ?? "?" }));
}
check(`found admin Server Actions in the build manifest (${ids.length})`, ids.length >= 10);
const post = async (id, headers = {}) => {
  const r = await fetch(BASE + "/admin", {
    method: "POST",
    headers: { "Next-Action": id, "Content-Type": "text/plain;charset=UTF-8", Accept: "text/x-component", Origin: BASE, ...headers },
    body: JSON.stringify(["x"]),
    redirect: "manual",
  });
  return { status: r.status, text: await r.text() };
};
let refused = 0;
for (const a of ids) {
  const r = await post(a.id);
  const r2 = await post(a.id, { Cookie: "mf_admin=eyJ2IjoxfQ.forged; __Host-mf_admin=eyJ2IjoxfQ.forged" });
  const ok = (x) => x.status >= 300 || /unauthorized|Сессия истекла/.test(x.text);
  if (ok(r) && ok(r2) && !/"state"|drafts|snapshot/.test(r.text + r2.text)) refused++;
  else out.push(`      action ${a.name}: ${r.status} ${r.text.slice(0, 120)} | ${r2.status}`);
}
check(`every admin action refuses calls without a valid session (${refused}/${ids.length})`, ids.length > 0 && refused === ids.length);
if (ids[0]) {
  const evil = await post(ids[0].id, { Origin: "https://evil.example" });
  check("action call from a foreign Origin refused", evil.status >= 400 || /unauthorized/.test(evil.text), `HTTP ${evil.status}`);
}

console.log(out.join("\n"));
await browser.close();
process.exit(out.some((l) => l.startsWith("FAIL")) ? 1 : 0);
