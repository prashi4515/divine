import { getApiBaseUrl } from "./config";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly path: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiFetchOptions = {
  path: string;
  init?: RequestInit;
  /** Next.js fetch cache options (RSC). */
  next?: NextFetchRequestConfig;
};

/**
 * Typed JSON fetch against the Divine API. Server-only (uses DIVINE_API_URL).
 */
export async function apiFetch<T>(
  options: ApiFetchOptions,
  parse: (json: unknown) => T,
): Promise<T> {
  const base = getApiBaseUrl();
  const url = `${base}${options.path.startsWith("/") ? options.path : `/${options.path}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options.init,
      headers: {
        Accept: "application/json",
        ...options.init?.headers,
      },
      next: options.next,
    });
  } catch (error: unknown) {
    throw new ApiError(
      error instanceof Error ? error.message : "Network request failed",
      0,
      options.path,
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `API ${response.status} for ${options.path}`,
      response.status,
      options.path,
    );
  }

  const json: unknown = await response.json();
  return parse(json);
}
