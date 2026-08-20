"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { getGenealogyUiMessages } from "@/lib/i18n/genealogy-ui-messages";
import { getHomeMessages, type HomeMessages } from "@/lib/i18n/home-messages";
import { getHubUiMessages } from "@/lib/i18n/hub-ui-messages";
import { getMessages, type Messages } from "@/lib/i18n/messages";
import { getLocaleFromPathname } from "@/lib/i18n/locales";
import type { ReadingLanguageCode } from "@/lib/reading/languages";
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
 * 2. If the URL is a clean path (no language prefix), the page is English ('en').
 * 3. explicit `initialLanguage` is used for SSR fallback if provided.
 */
export function useUiLanguage(
  initialLanguage?: ReadingLanguageCode,
): ReadingLanguageCode {
  const pathname = usePathname();
  const urlLocale = getLocaleFromPathname(pathname);

  // URL route locale is authoritative. Clean URLs without locale prefix are English ('en').
  const activeLanguage = urlLocale ?? initialLanguage ?? "en";

  React.useEffect(() => {
    document.documentElement.lang =
      activeLanguage === "sa" ? "sa" : activeLanguage;
  }, [activeLanguage]);

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
