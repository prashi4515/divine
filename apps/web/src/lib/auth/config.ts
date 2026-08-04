/**
 * Auth configuration.
 *
 * Admin route protection is enforced by `src/middleware.ts` via the
 * `divine_admin_session` cookie set by the API on login.
 */
export const AUTH_ENABLED =
  process.env.NEXT_PUBLIC_DIVINE_ADMIN_AUTH_ENABLED !== "false";

/**
 * Public Sign in / Account chrome. Hidden until auth UX is ready for readers.
 * Admin auth is unaffected (`AUTH_ENABLED` + `/admin`).
 */
export const PUBLIC_AUTH_UI_ENABLED =
  process.env.NEXT_PUBLIC_DIVINE_PUBLIC_AUTH_UI === "true";

/** Cookie the middleware checks to guard `/admin/*`. Set by the login flow. */
export const SESSION_COOKIE = "divine_admin_session";

/** Client-side storage keys (fallback when cookies are unavailable). */
export const ACCESS_TOKEN_KEY = "divine.accessToken";
export const REFRESH_TOKEN_KEY = "divine.refreshToken";
export const REMEMBER_ME_KEY = "divine.rememberMe";

export const ACCESS_TOKEN_TTL_MINUTES = 15;
export const REFRESH_SKEW_SECONDS = 60;

export const AUTH_ROUTES = {
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  /** Default for public readers after sign-in. */
  afterLogin: "/account",
  /** CMS console for staff roles. */
  afterAdminLogin: "/admin",
  logout: "/logout",
  account: "/account",
} as const;
