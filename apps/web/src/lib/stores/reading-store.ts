import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_READING_LANGUAGE,
  isReadingLanguageCode,
  type ReadingLanguageCode,
} from "@/lib/reading/languages";

type ReadingState = {
  preferredLanguage: ReadingLanguageCode;
  setPreferredLanguage: (code: string) => void;
};

/**
 * Public reading preference — language for verse translations across the site.
 * Persisted so chapter pages and the header switcher stay in sync.
 */
export const useReadingStore = create<ReadingState>()(
  persist(
    (set) => ({
      preferredLanguage: DEFAULT_READING_LANGUAGE,
      setPreferredLanguage: (code) => {
        if (!isReadingLanguageCode(code)) return;
        set({ preferredLanguage: code });
      },
    }),
    {
      name: "divine.reading",
      partialize: (state) => ({ preferredLanguage: state.preferredLanguage }),
    },
  ),
);
