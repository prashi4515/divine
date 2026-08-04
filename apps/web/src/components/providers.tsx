"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/features/auth/auth-provider";
import { UiLanguageProvider } from "@/lib/i18n/ui-language-context";
import type { ReadingLanguageCode } from "@/lib/reading/languages";

/**
 * Root client providers for the public app shell.
 * Auth never blocks first paint — see AuthProvider bootstrap.
 */
export function Providers({
  children,
  hasSessionHint = false,
  initialLanguage = "en",
}: {
  children: React.ReactNode;
  hasSessionHint?: boolean;
  initialLanguage?: ReadingLanguageCode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <UiLanguageProvider initialLanguage={initialLanguage}>
        <AuthProvider hasSessionHint={hasSessionHint}>{children}</AuthProvider>
      </UiLanguageProvider>
    </ThemeProvider>
  );
}
