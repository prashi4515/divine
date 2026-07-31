"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { useReadingHydrated } from "@/lib/i18n/use-messages";
import { READING_LANGUAGES } from "@/lib/reading/languages";
import { useReadingStore } from "@/lib/stores/reading-store";

/**
 * Site-wide UI language switcher for the public header.
 * Preference is persisted and applied to chrome, Gita reader, and nav labels.
 */
export function LanguageSwitcher() {
  const preferredLanguage = useReadingStore((s) => s.preferredLanguage);
  const setPreferredLanguage = useReadingStore((s) => s.setPreferredLanguage);
  const hydrated = useReadingHydrated();

  const value = hydrated ? preferredLanguage : "en";

  return (
    <label className="relative inline-flex items-center gap-1">
      <Languages
        className="text-muted-foreground hidden h-3.5 w-3.5 shrink-0 sm:inline"
        aria-hidden
      />
      <span className="sr-only">Translation language</span>
      <select
        className="border-input bg-background text-foreground h-8 max-w-[5.5rem] cursor-pointer rounded-md border px-1.5 pr-5 text-xs sm:max-w-[9rem] sm:px-2 sm:pr-6 sm:text-sm"
        value={value}
        onChange={(event) => {
          setPreferredLanguage(event.target.value);
        }}
        aria-label="Translation language"
        disabled={!hydrated}
      >
        {READING_LANGUAGES.map((lang) => (
          <option
            key={lang.code}
            value={lang.code}
            lang={lang.code === "sa" ? "sa" : lang.code}
          >
            {lang.nativeName}
          </option>
        ))}
      </select>
    </label>
  );
}
