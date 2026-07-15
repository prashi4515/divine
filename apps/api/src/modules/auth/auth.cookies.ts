import type { Response } from "express";
import type { AuthTokens } from "./auth.service";

export const ACCESS_COOKIE = "divine_access_token";
export const REFRESH_COOKIE = "divine_refresh_token";
/** Non-httpOnly presence flag for Next.js middleware. */
export const SESSION_COOKIE = "divine_admin_session";

export function setAuthCookies(
  res: Response,
  tokens: AuthTokens,
  opts: { rememberMe: boolean; secure: boolean },
): void {
  const refreshMaxAge = opts.rememberMe
    ? 30 * 24 * 60 * 60
    : 7 * 24 * 60 * 60;
  const accessMaxAge = 15 * 60;
  const common = {
    httpOnly: true,
    secure: opts.secure,
    sameSite: "lax" as const,
    path: "/",
  };

  res.cookie(ACCESS_COOKIE, tokens.accessToken, { ...common, maxAge: accessMaxAge * 1000 });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...common,
    maxAge: refreshMaxAge * 1000,
  });
  res.cookie(SESSION_COOKIE, "1", {
    httpOnly: false,
    secure: opts.secure,
    sameSite: "lax",
    path: "/",
    maxAge: refreshMaxAge * 1000,
  });
}

export function clearAuthCookies(res: Response, secure: boolean): void {
  const clear = { httpOnly: true, secure, sameSite: "lax" as const, path: "/", maxAge: 0 };
  res.cookie(ACCESS_COOKIE, "", clear);
  res.cookie(REFRESH_COOKIE, "", clear);
  res.cookie(SESSION_COOKIE, "", {
    httpOnly: false,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
