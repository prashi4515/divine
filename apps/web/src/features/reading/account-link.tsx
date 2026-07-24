"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useOptionalAuth } from "@/features/auth/auth-provider";
import { AUTH_ROUTES } from "@/lib/auth/config";

/**
 * Compact header link to My Account / Sign in.
 */
export function AccountLink() {
  const auth = useOptionalAuth();
  const signedIn = auth?.status === "authenticated" && Boolean(auth.user);

  if (signedIn) {
    return (
      <Link
        href={AUTH_ROUTES.account}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs sm:text-sm"
      >
        <UserRound className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">My Account</span>
      </Link>
    );
  }

  return (
    <Link
      href={`${AUTH_ROUTES.login}?next=${AUTH_ROUTES.account}`}
      className="cta-saffron transition-divine inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium sm:px-3 sm:text-sm"
      aria-label="Sign in"
    >
      <UserRound className="h-3.5 w-3.5" aria-hidden />
      <span className="hidden min-[380px]:inline">Sign in</span>
    </Link>
  );
}
