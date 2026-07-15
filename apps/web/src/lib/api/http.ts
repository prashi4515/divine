import { ApiError } from "./client";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isRemembered,
} from "@/lib/auth/tokens";
import { loginResponseSchema } from "@/lib/auth/types";

/**
 * Browser-side HTTP client for authenticated admin calls.
 * Sends cookies (`credentials: "include"`) and optional Bearer token.
 * On 401, attempts a single-flight refresh and retries once.
 */

export function getPublicApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_DIVINE_API_URL;
  if (!url) {
    throw new ApiError(
      "NEXT_PUBLIC_DIVINE_API_URL is not set. Copy apps/web/.env.example to .env.local.",
      0,
      "",
    );
  }
  return url.replace(/\/$/, "");
}

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type HttpOptions = {
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
  /** Set false for unauthenticated endpoints (login, forgot-password). */
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
  /** Skip the 401→refresh→retry path (used by refresh itself). */
  skipRefresh?: boolean;
};

function buildUrl(path: string, query?: HttpOptions["query"]): string {
  const base = getPublicApiBaseUrl();
  const url = new URL(`${base}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const storedRefresh = getRefreshToken();
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    try {
      const response = await fetch(buildUrl("/v1/auth/refresh"), {
        method: "POST",
        headers,
        body: JSON.stringify(storedRefresh ? { refreshToken: storedRefresh } : {}),
        credentials: "include",
      });
      if (!response.ok) {
        clearTokens();
        return false;
      }
      const json: unknown = await response.json();
      const parsed = loginResponseSchema.parse(json);
      setTokens(
        parsed.data.accessToken,
        parsed.data.refreshToken,
        isRemembered(),
      );
      return true;
    } catch {
      clearTokens();
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function http<T>(
  path: string,
  parse: (json: unknown) => T,
  options: HttpOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    signal,
    auth = true,
    query,
    skipRefresh = false,
  } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
      credentials: "include",
    });
  } catch (error: unknown) {
    throw new ApiError(
      error instanceof Error ? error.message : "Network request failed",
      0,
      path,
    );
  }

  if (
    response.status === 401 &&
    auth &&
    !skipRefresh &&
    path !== "/v1/auth/refresh" &&
    path !== "/v1/auth/login"
  ) {
    const ok = await refreshAccessToken();
    if (ok) {
      return http(path, parse, { ...options, skipRefresh: true });
    }
  }

  if (!response.ok) {
    throw new ApiError(`API ${response.status} for ${path}`, response.status, path);
  }

  if (response.status === 204) return parse(null);
  const json: unknown = await response.json();
  return parse(json);
}
