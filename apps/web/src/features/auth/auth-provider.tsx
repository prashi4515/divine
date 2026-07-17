"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth/config";
import {
  clearTokens,
  hasAuthSessionHint,
  setTokens,
} from "@/lib/auth/tokens";
import * as authService from "@/lib/api/services/auth";
import type { AuthUser, LoginInput } from "@/lib/auth/types";
import { useReadingStore } from "@/lib/stores/reading-store";
import { isReadingLanguageCode } from "@/lib/reading/languages";
import { asCmsRoles } from "@/lib/rbac";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  login: (
    input: LoginInput,
    options?: { next?: string | null },
  ) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  /** Apply tokens + user after register / external auth. */
  applySession: (session: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
    rememberMe?: boolean;
  }) => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
  /** Server-read session cookie presence — never blocks first paint. */
  hasSessionHint?: boolean;
};

export function AuthProvider({
  children,
  hasSessionHint = false,
}: AuthProviderProps) {
  const router = useRouter();
  // Public pages paint immediately; navbar hydrates after background /me.
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [status, setStatus] = React.useState<AuthStatus>(() =>
    hasSessionHint ? "loading" : "unauthenticated",
  );
  const setPreferredLanguage = useReadingStore((s) => s.setPreferredLanguage);

  const syncReadingPrefs = React.useCallback(
    async (nextUser: AuthUser) => {
      if (
        nextUser.preferredLanguage &&
        isReadingLanguageCode(nextUser.preferredLanguage)
      ) {
        setPreferredLanguage(nextUser.preferredLanguage);
      }
      try {
        const prefs = await authService.getPreferences();
        if (isReadingLanguageCode(prefs.language)) {
          setPreferredLanguage(prefs.language);
        }
      } catch {
        /* prefs optional on bootstrap */
      }
    },
    [setPreferredLanguage],
  );

  React.useEffect(() => {
    let active = true;

    async function hydrateAuthenticated() {
      try {
        const me = await authService.fetchMe();
        if (!active) return;
        setUser(me);
        setStatus("authenticated");
        void syncReadingPrefs(me);
      } catch {
        try {
          const refreshed = await authService.refreshSession();
          if (!active) return;
          setTokens(
            refreshed.data.accessToken,
            refreshed.data.refreshToken,
            true,
          );
          setUser(refreshed.data.user);
          setStatus("authenticated");
          void syncReadingPrefs(refreshed.data.user);
        } catch {
          clearTokens();
          if (active) {
            setUser(null);
            setStatus("unauthenticated");
          }
        }
      }
    }

    // Anonymous public traffic: never call /me or refresh.
    if (!hasSessionHint && !hasAuthSessionHint()) {
      setUser(null);
      setStatus("unauthenticated");
      return () => {
        active = false;
      };
    }

    // Session hint present: refresh + /me in the background; chrome stays interactive.
    setStatus((prev) => (prev === "authenticated" ? prev : "loading"));
    void hydrateAuthenticated();

    return () => {
      active = false;
    };
  }, [hasSessionHint, syncReadingPrefs]);

  const login = React.useCallback(
    async (input: LoginInput, options?: { next?: string | null }) => {
      const res = await authService.login(input);
      setTokens(
        res.data.accessToken,
        res.data.refreshToken,
        input.rememberMe ?? false,
      );
      setUser(res.data.user);
      setStatus("authenticated");
      void syncReadingPrefs(res.data.user);
      const next = options?.next;
      if (next && next.startsWith("/")) {
        router.push(next);
      } else if (asCmsRoles(res.data.user.roles).length > 0) {
        router.push(AUTH_ROUTES.afterAdminLogin);
      } else {
        router.push(AUTH_ROUTES.afterLogin);
      }
      router.refresh();
    },
    [router, syncReadingPrefs],
  );

  const logout = React.useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Best-effort server logout; local tokens are cleared regardless.
    }
    clearTokens();
    setUser(null);
    setStatus("unauthenticated");
    router.push(AUTH_ROUTES.login);
    router.refresh();
  }, [router]);

  const refresh = React.useCallback(async () => {
    if (!hasAuthSessionHint()) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }
    const res = await authService.refreshSession();
    setTokens(res.data.accessToken, res.data.refreshToken, true);
    setUser(res.data.user);
    setStatus("authenticated");
  }, []);

  const applySession = React.useCallback(
    (session: {
      accessToken: string;
      refreshToken: string;
      user: AuthUser;
      rememberMe?: boolean;
    }) => {
      setTokens(
        session.accessToken,
        session.refreshToken,
        session.rememberMe ?? false,
      );
      setUser(session.user);
      setStatus("authenticated");
    },
    [],
  );

  const value = React.useMemo<AuthContextValue>(
    () => ({ user, status, login, logout, refresh, applySession }),
    [user, status, login, logout, refresh, applySession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>.");
  }
  return ctx;
}

/** Safe for chrome that may render outside an AuthProvider. */
export function useOptionalAuth(): AuthContextValue | null {
  return React.useContext(AuthContext);
}
