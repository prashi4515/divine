import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  REMEMBER_ME_KEY,
  SESSION_COOKIE,
} from "./config";

/**
 * Client-side token storage. This is scaffolding: when the backend issues
 * httpOnly cookies, most of this is replaced by server-set cookies and this
 * module shrinks to reading non-sensitive session hints.
 *
 * `remember me` decides persistence: localStorage (persist) vs sessionStorage.
 */

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function store(remember: boolean): Storage | null {
  if (!isBrowser()) return null;
  return remember ? window.localStorage : window.sessionStorage;
}

function readFromAny(key: string): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
}

export function getAccessToken(): string | null {
  return readFromAny(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return readFromAny(REFRESH_TOKEN_KEY);
}

export function isRemembered(): boolean {
  return readFromAny(REMEMBER_ME_KEY) === "true";
}

export function setTokens(
  accessToken: string,
  refreshToken: string,
  remember: boolean,
): void {
  const target = store(remember);
  if (!target) return;
  target.setItem(ACCESS_TOKEN_KEY, accessToken);
  target.setItem(REFRESH_TOKEN_KEY, refreshToken);
  target.setItem(REMEMBER_ME_KEY, String(remember));
  // Presence cookie for middleware; the real token stays out of a JS cookie.
  document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Lax${
    remember ? "; max-age=2592000" : ""
  }`;
}

export function clearTokens(): void {
  if (!isBrowser()) return;
  for (const key of [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, REMEMBER_ME_KEY]) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

/** Readable session presence cookie set by the API (non-httpOnly). */
export function hasSessionCookie(): boolean {
  if (!isBrowser()) return false;
  return document.cookie
    .split(";")
    .some((part) => part.trim().startsWith(`${SESSION_COOKIE}=`));
}

/**
 * True when the browser likely has an auth session.
 * Used to skip refresh + /me on anonymous public page loads.
 */
export function hasAuthSessionHint(): boolean {
  if (!isBrowser()) return false;
  return (
    hasSessionCookie() ||
    Boolean(getAccessToken()) ||
    Boolean(getRefreshToken())
  );
}
