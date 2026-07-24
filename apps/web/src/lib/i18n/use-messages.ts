"use client";

import * as React from "react";
import { getHomeMessages, type HomeMessages } from "@/lib/i18n/home-messages";
import { getMessages, type Messages } from "@/lib/i18n/messages";
import { useReadingStore } from "@/lib/stores/reading-store";

/**
 * UI copy for the active reading language. Falls back to English until hydrated.
 */
export function useMessages(): Messages {
  const preferredLanguage = useReadingStore((s) => s.preferredLanguage);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = preferredLanguage === "sa" ? "sa" : preferredLanguage;
  }, [mounted, preferredLanguage]);

  return getMessages(mounted ? preferredLanguage : "en");
}

/**
 * Landing-page copy for the active reading language (English until hydrated).
 */
export function useHomeMessages(): HomeMessages {
  const preferredLanguage = useReadingStore((s) => s.preferredLanguage);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return getHomeMessages(mounted ? preferredLanguage : "en");
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
