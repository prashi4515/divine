"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { READING_LANGUAGES } from "@/lib/reading/languages";
import { useReadingStore } from "@/lib/stores/reading-store";

/**
 * Site-wide translation language switcher for the public header.
 * Preference is persisted and applied in the verse reader.
 */
export function LanguageSwitcher() {
  const preferredLanguage = useReadingStore((s) => s.preferredLanguage);
  const setPreferredLanguage = useReadingStore((s) => s.setPreferredLanguage);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const value = mounted ? preferredLanguage : "en";

  return (
    <label className="relative inline-flex items-center gap-1.5">
      <Languages className="text-muted-foreground h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="sr-only">Translation language</span>
      <select
        className="border-input bg-background text-foreground h-8 max-w-[10rem] cursor-pointer rounded-md border px-2 pr-6 text-xs sm:max-w-[12rem] sm:text-sm"
        value={value}
        onChange={(event) => setPreferredLanguage(event.target.value)}
        aria-label="Translation language"
        disabled={!mounted}
      >
        {READING_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} lang={lang.code === "sa" ? "sa" : lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
    </label>
  );
}
