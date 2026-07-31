"use client";

import * as React from "react";
import { getHomeMessages, type HomeMessages } from "@/lib/i18n/home-messages";
import { getMessages, type Messages } from "@/lib/i18n/messages";
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
    setHydrated(api.hasHydrated());
    return api.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  return hydrated;
}

/**
 * UI copy for the active reading language.
 */
export function useMessages(): Messages {
  const preferredLanguage = useReadingStore((s) => s.preferredLanguage);
  const hydrated = useReadingHydrated();

  React.useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang =
      preferredLanguage === "sa" ? "sa" : preferredLanguage;
  }, [hydrated, preferredLanguage]);

  return getMessages(hydrated ? preferredLanguage : "en");
}

/**
 * Landing-page copy for the active reading language.
 */
export function useHomeMessages(): HomeMessages {
  const preferredLanguage = useReadingStore((s) => s.preferredLanguage);
  const hydrated = useReadingHydrated();

  return getHomeMessages(hydrated ? preferredLanguage : "en");
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
