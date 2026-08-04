"use client";

import * as React from "react";
import {
  DEFAULT_READING_LANGUAGE,
  type ReadingLanguageCode,
} from "@/lib/reading/languages";

const UiLanguageContext = React.createContext<ReadingLanguageCode>(
  DEFAULT_READING_LANGUAGE,
);

/**
 * Server-resolved UI language (from cookie) so the first paint matches
 * the user's preference — no English flash on refresh.
 */
export function UiLanguageProvider({
  initialLanguage,
  children,
}: {
  initialLanguage: ReadingLanguageCode;
  children: React.ReactNode;
}) {
  return (
    <UiLanguageContext.Provider value={initialLanguage}>
      {children}
    </UiLanguageContext.Provider>
  );
}

export function useServerUiLanguage(): ReadingLanguageCode {
  return React.useContext(UiLanguageContext);
}
