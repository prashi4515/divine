"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { getGenealogyUiMessages } from "@/lib/i18n/genealogy-ui-messages";
import { getHomeMessages, type HomeMessages } from "@/lib/i18n/home-messages";
import { getHubUiMessages } from "@/lib/i18n/hub-ui-messages";
import { getMessages, type Messages } from "@/lib/i18n/messages";
import { getLocaleFromPathname } from "@/lib/i18n/locales";
import { readingLanguageCookieWrite } from "@/lib/i18n/reading-language-cookie";
import { useServerUiLanguage } from "@/lib/i18n/ui-language-context";
import {
  DEFAULT_READING_LANGUAGE,
  type ReadingLanguageCode,
} from "@/lib/reading/languages";
import { useReadingStore } from "@/lib/stores/reading-store";

/**
 * True after client mount / persist rehydrate.
 * Safe when `persist` API is briefly unavailable during HMR.
 */
export function useReadingHydrated(): boolean {
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    const api = useReadingStore.persist;
    if (!api) {
      setHydrated(true);
      return;
    }
    if (api.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return api.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  return hydrated;
}

/**
 * Active UI language determination:
 * 1. URL language prefix (`/hi`, `/te`, `/sa`, etc.) ALWAYS takes top priority.
 * 2. `initialLanguage` argument if explicitly provided.
 * 3. `serverLanguage` from React context (SSR).
 * 4. User's client store preference for clean English URLs (`/`).
 */
export function useUiLanguage(
  initialLanguage?: ReadingLanguageCode,
): ReadingLanguageCode {
  const pathname = usePathname();
  const urlLocale = getLocaleFromPathname(pathname);
  const serverLanguage = useServerUiLanguage();
  const preferredLanguage = useReadingStore((s) => s.preferredLanguage);
  const hydrated = useReadingHydrated();

  // If URL explicitly encodes a language, it ALWAYS wins over cookies/localStorage
  const activeLanguage =
    urlLocale ??
    initialLanguage ??
    (serverLanguage && serverLanguage !== "en" ? serverLanguage : undefined) ??
    (hydrated ? preferredLanguage : serverLanguage ?? DEFAULT_READING_LANGUAGE);

  React.useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang =
      activeLanguage === "sa" ? "sa" : activeLanguage;
    // Only update cookie preference if user is on a clean URL or explicitly selected language
    if (!urlLocale) {
      document.cookie = readingLanguageCookieWrite(preferredLanguage);
    }
  }, [hydrated, activeLanguage, urlLocale, preferredLanguage]);

  return activeLanguage;
}

/**
 * UI copy for the active reading language.
 */
export function useMessages(initialLanguage?: ReadingLanguageCode): Messages {
  return getMessages(useUiLanguage(initialLanguage));
}

/**
 * Landing-page copy for the active reading language.
 */
export function useHomeMessages(
  initialLanguage?: ReadingLanguageCode,
): HomeMessages {
  return getHomeMessages(useUiLanguage(initialLanguage));
}

export function useHubUiMessages(initialLanguage?: ReadingLanguageCode) {
  return getHubUiMessages(useUiLanguage(initialLanguage));
}

export function useGenealogyUiMessages(initialLanguage?: ReadingLanguageCode) {
  return getGenealogyUiMessages(useUiLanguage(initialLanguage));
}

export function localizeWorkTitle(
  messages: Messages,
  work: { code: string; title: string },
): string {
  return messages.workTitles[work.code] ?? work.title;
}

export function localizeWorkDescription(
  messages: Messages,
  work: { code: string; description: string | null },
): string | null {
  return messages.workDescriptions[work.code] ?? work.description;
}
