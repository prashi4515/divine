"use client";

import * as React from "react";
import { getGenealogyUiMessages } from "@/lib/i18n/genealogy-ui-messages";
import { getHomeMessages, type HomeMessages } from "@/lib/i18n/home-messages";
import { getHubUiMessages } from "@/lib/i18n/hub-ui-messages";
import { getMessages, type Messages } from "@/lib/i18n/messages";
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
  // Always start false so SSR HTML matches the client's first paint
  // (reading hasHydrated() in useState caused disabled/value mismatches).
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
 * Active UI language: store after hydrate, else SSR cookie (no English flash).
 */
export function useUiLanguage(
  initialLanguage?: ReadingLanguageCode,
): ReadingLanguageCode {
  const serverLanguage = useServerUiLanguage();
  const fallback = initialLanguage ?? serverLanguage ?? DEFAULT_READING_LANGUAGE;
  const preferredLanguage = useReadingStore((s) => s.preferredLanguage);
  const hydrated = useReadingHydrated();

  React.useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang =
      preferredLanguage === "sa" ? "sa" : preferredLanguage;
    document.cookie = readingLanguageCookieWrite(preferredLanguage);
  }, [hydrated, preferredLanguage]);

  return hydrated ? preferredLanguage : fallback;
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
