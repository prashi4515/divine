import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_ENABLED, AUTH_ROUTES, SESSION_COOKIE } from "@/lib/auth/config";

/**
 * - Protect `/admin/*`
 * - Canonicalize uppercase paths to lowercase (SEO)
 * - Collapse duplicate slashes
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Collapse //foo → /foo (keep protocol-relative out of scope)
  if (pathname.includes("//")) {
    const cleaned = pathname.replace(/\/{2,}/g, "/");
    const url = request.nextUrl.clone();
    url.pathname = cleaned || "/";
    return NextResponse.redirect(url, 308);
  }

  // Lowercase public content paths (skip API / static / Next internals)
  if (
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    !pathname.includes(".") &&
    pathname !== pathname.toLowerCase()
  ) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.toLowerCase();
    return NextResponse.redirect(url, 308);
  }

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (!AUTH_ENABLED) return NextResponse.next();

  const hasSession =
    request.cookies.has(SESSION_COOKIE) ||
    request.cookies.has("divine_access_token") ||
    request.cookies.has("divine_refresh_token");

  if (hasSession) return NextResponse.next();

  const loginUrl = new URL(AUTH_ROUTES.login, request.url);
  const next = `${pathname}${search}`;
  if (next && next !== "/") {
    loginUrl.searchParams.set("next", next);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets with file extensions commonly
     * served from /public, and Next.js internals.
     */
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
