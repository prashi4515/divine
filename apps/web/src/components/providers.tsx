"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/features/auth/auth-provider";

/**
 * Root client providers for the public app shell.
 * Auth never blocks first paint — see AuthProvider bootstrap.
 */
export function Providers({
  children,
  hasSessionHint = false,
}: {
  children: React.ReactNode;
  hasSessionHint?: boolean;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider hasSessionHint={hasSessionHint}>{children}</AuthProvider>
    </ThemeProvider>
  );
}
