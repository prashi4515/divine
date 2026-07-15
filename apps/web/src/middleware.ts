import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_ENABLED, AUTH_ROUTES, SESSION_COOKIE } from "@/lib/auth/config";

/**
 * Protects `/admin/*`. Unauthenticated visitors are redirected to `/login`
 * with `?next=` preserving the originally requested path.
 */
export function middleware(request: NextRequest) {
  if (!AUTH_ENABLED) return NextResponse.next();

  const hasSession =
    request.cookies.has(SESSION_COOKIE) ||
    request.cookies.has("divine_access_token") ||
    request.cookies.has("divine_refresh_token");

  if (hasSession) return NextResponse.next();

  const loginUrl = new URL(AUTH_ROUTES.login, request.url);
  const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (next && next !== "/") {
    loginUrl.searchParams.set("next", next);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
