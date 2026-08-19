"use client";

import { usePathname, useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { readingLanguageCookieWrite } from "@/lib/i18n/reading-language-cookie";
import { useUiLanguage } from "@/lib/i18n/use-messages";
import {
  isReadingLanguageCode,
  READING_LANGUAGES,
  type ReadingLanguageCode,
} from "@/lib/reading/languages";
import { useReadingStore } from "@/lib/stores/reading-store";
import { localizePath } from "@/lib/i18n/locales";

/**
 * Site-wide UI language switcher for the public header.
 * Navigates to equivalent localized URL and persists cookie.
 */
export function LanguageSwitcher() {
  const setPreferredLanguage = useReadingStore((s) => s.setPreferredLanguage);
  const value = useUiLanguage();
  const pathname = usePathname();
  const router = useRouter();

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
          const code = event.target.value;
          if (!isReadingLanguageCode(code)) return;
          const langCode = code as ReadingLanguageCode;
          document.cookie = readingLanguageCookieWrite(langCode);
          document.documentElement.lang = langCode;
          setPreferredLanguage(langCode);
          const targetUrl = localizePath(pathname || "/", langCode);
          router.push(targetUrl);
        }}
        aria-label="Translation language"
      >
        {READING_LANGUAGES.map((lang) => (
          <option
            key={lang.code}
            value={lang.code}
            lang={lang.code}
          >
            {lang.nativeName}
          </option>
        ))}
      </select>
    </label>
  );
}
