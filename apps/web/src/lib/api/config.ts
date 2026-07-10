/**
 * Server-side API base URL. Never expose DIVINE_DATABASE_URL to the web app.
 * Used only in Server Components / Route Handlers.
 */
export function getApiBaseUrl(): string {
  const url = process.env.DIVINE_API_URL;
  if (!url) {
    throw new Error(
      "DIVINE_API_URL is not set. Copy apps/web/.env.example to .env.local.",
    );
  }
  return url.replace(/\/$/, "");
}
