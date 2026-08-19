import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_ENABLED, AUTH_ROUTES, SESSION_COOKIE } from "@/lib/auth/config";

const LOCALES = ["sa", "hi", "te", "kn", "ta", "ml", "or"];

/**
 * - Protect `/admin/*`
 * - Canonicalize uppercase paths to lowercase (SEO)
 * - Collapse duplicate slashes
 * - Prevent /en/ URLs (redirect 308 to clean URLs)
 * - Attach x-locale & x-pathname headers for SSR rendering
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Collapse //foo → /foo
  if (pathname.includes("//")) {
    const cleaned = pathname.replace(/\/{2,}/g, "/");
    const url = request.nextUrl.clone();
    url.pathname = cleaned || "/";
    return NextResponse.redirect(url, 308);
  }

  // Prevent /en or /en/* URLs — English MUST remain on clean URLs (Req #3)
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const cleaned = pathname.replace(/^\/en(\/|$)/, "/") || "/";
    const url = request.nextUrl.clone();
    url.pathname = cleaned;
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

  // Detect locale prefix
  const segments = pathname.split("/").filter(Boolean);
  const locale = segments.length > 0 && LOCALES.includes(segments[0]) ? segments[0] : "en";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);
  requestHeaders.set("x-pathname", pathname);

  if (pathname.startsWith("/admin")) {
    if (!AUTH_ENABLED) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
    const hasSession =
      request.cookies.has(SESSION_COOKIE) ||
      request.cookies.has("divine_access_token") ||
      request.cookies.has("divine_refresh_token");

    if (!hasSession) {
      const loginUrl = new URL(AUTH_ROUTES.login, request.url);
      const next = `${pathname}${search}`;
      if (next && next !== "/") {
        loginUrl.searchParams.set("next", next);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
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
