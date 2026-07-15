import type { Work } from "@divine/types";

/**
 * Public URL for a work. Bhagavad Gita keeps its stable `/bhagavad-gita` path;
 * every other published work uses `/scriptures/{slug}`.
 */
export function publicWorkPath(work: Pick<Work, "code" | "slug">): string {
  if (work.code === "bg" || work.slug === "bhagavad-gita") {
    return "/bhagavad-gita";
  }
  return `/scriptures/${work.slug}`;
}

export function publicChapterPath(
  work: Pick<Work, "code" | "slug">,
  chapterNumber: number,
): string {
  return `${publicWorkPath(work)}/chapter-${chapterNumber}`;
}
