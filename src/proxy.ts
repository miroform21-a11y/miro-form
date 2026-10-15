import { NextResponse, type NextRequest } from "next/server";
import { adminSecrets } from "@/server/cms/env";
import { isSecureRequest, sessionCookie, verifySessionToken } from "@/server/cms/session";

/**
 * Convenience only: sends visitors without a valid session from /admin pages to the login page.
 * It is NOT the protection — every admin page and every Server Action verifies the session on the server again.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  const secrets = adminSecrets();
  if (!secrets) return NextResponse.next(); // the admin layout answers 404
  const name = sessionCookie(isSecureRequest(request.headers)).name;
  if (verifySessionToken(request.cookies.get(name)?.value, secrets.secret, secrets.password)) return NextResponse.next();
  // Server Action calls (POST) get their own "unauthorized" answer from the action itself
  if (request.method !== "GET" && request.method !== "HEAD") return NextResponse.next();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
