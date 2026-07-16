import { cache } from "react";
import { getPublishedChapter } from "@/lib/api/chapters";
import { getPublishedVerses } from "@/lib/api/verses";

/** Dedupe chapter + verse fetches within a single RSC render. */
export const getPublishedChapterCached = cache(getPublishedChapter);
export const getPublishedVersesCached = cache(getPublishedVerses);
