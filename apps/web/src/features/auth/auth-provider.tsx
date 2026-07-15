"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AUTH_ENABLED, AUTH_ROUTES } from "@/lib/auth/config";
import { clearTokens, setTokens } from "@/lib/auth/tokens";
import { authService } from "@/lib/api/services";
import type { AuthUser, LoginInput } from "@/lib/auth/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [status, setStatus] = React.useState<AuthStatus>("loading");

  React.useEffect(() => {
    let active = true;
    async function bootstrap() {
      if (!AUTH_ENABLED) {
        // Soft mode only — prefer real session when API is available.
        try {
          const me = await authService.fetchMe();
          if (active) {
            setUser(me);
            setStatus("authenticated");
          }
          return;
        } catch {
          if (active) {
            setUser(null);
            setStatus("unauthenticated");
          }
          return;
        }
      }
      try {
        const me = await authService.fetchMe();
        if (active) {
          setUser(me);
          setStatus("authenticated");
        }
      } catch {
        try {
          const refreshed = await authService.refreshSession();
          setTokens(
            refreshed.data.accessToken,
            refreshed.data.refreshToken,
            true,
          );
          if (active) {
            setUser(refreshed.data.user);
            setStatus("authenticated");
          }
        } catch {
          clearTokens();
          if (active) {
            setUser(null);
            setStatus("unauthenticated");
          }
        }
      }
    }
    void bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const login = React.useCallback(
    async (input: LoginInput) => {
      const res = await authService.login(input);
      setTokens(res.data.accessToken, res.data.refreshToken, input.rememberMe ?? false);
      setUser(res.data.user);
      setStatus("authenticated");
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") ? next : AUTH_ROUTES.afterLogin);
      router.refresh();
    },
    [router, searchParams],
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
    const res = await authService.refreshSession();
    setTokens(res.data.accessToken, res.data.refreshToken, true);
    setUser(res.data.user);
    setStatus("authenticated");
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({ user, status, login, logout, refresh }),
    [user, status, login, logout, refresh],
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
