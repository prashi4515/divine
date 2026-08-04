/**
 * Page-type title & description factories — unique, under ~60 chars where practical.
 */
import { clampDescription, clampTitle, ogImageFor } from "@/lib/seo/metadata";
import type { PageMetadataInput } from "@/lib/seo/metadata";

export function homeSeo(): PageMetadataInput {
  return {
    title: "Bhagavad Gita Online – Read All 18 Chapters with Meaning",
    description:
      "Read the complete Bhagavad Gita online with Sanskrit, translation, word meaning, and commentary. A calm multilingual home for the Song of God.",
    path: "/",
    type: "website",
    absoluteTitle: true,
    image: ogImageFor({
      title: "Bhagavad Gita Online",
      subtitle: "Read all 18 chapters with meaning",
      eyebrow: "The Song of God",
    }),
  };
}

export function gitaIndexSeo(): PageMetadataInput {
  return {
    title: "Bhagavad Gita – All 18 Chapters",
    description:
      "Explore all 18 chapters of the Bhagavad Gita. Sanskrit shlokas, translations, and a calm chapter-by-chapter reading path.",
    path: "/bhagavad-gita",
    image: ogImageFor({
      title: "Bhagavad Gita",
      subtitle: "All 18 chapters",
      eyebrow: "Scripture",
    }),
  };
}

export function chapterSeo(
  chapterNumber: number,
  chapterTitle: string,
): PageMetadataInput {
  const title = clampTitle(
    `Bhagavad Gita Chapter ${chapterNumber} – ${chapterTitle}`,
  );
  return {
    title,
    description: clampDescription(
      `Read Bhagavad Gita Chapter ${chapterNumber} (${chapterTitle}) with Sanskrit, translation, word-by-word meaning, and commentary.`,
    ),
    path: `/bhagavad-gita/chapter-${chapterNumber}`,
    type: "article",
    image: ogImageFor({
      title: `Chapter ${chapterNumber}`,
      subtitle: chapterTitle,
      eyebrow: "Bhagavad Gita",
    }),
  };
}

export function verseSeo(
  chapterNumber: number,
  verseNumber: number,
  snippet?: string,
): PageMetadataInput {
  const title = `Bhagavad Gita ${chapterNumber}.${verseNumber} – Verse & Meaning`;
  return {
    title,
    description: clampDescription(
      snippet
        ? `${snippet} — Bhagavad Gita ${chapterNumber}.${verseNumber}: Sanskrit, translation, and word meaning.`
        : `Bhagavad Gita ${chapterNumber}.${verseNumber}: read the verse with Sanskrit, translation, word-by-word meaning, and commentary.`,
    ),
    path: `/verse/${chapterNumber}/${verseNumber}`,
    type: "article",
    image: ogImageFor({
      title: `Gita ${chapterNumber}.${verseNumber}`,
      subtitle: "Verse, translation & meaning",
      eyebrow: "Bhagavad Gita",
    }),
  };
}

export function searchSeo(query?: string): PageMetadataInput {
  const q = query?.trim();
  if (q) {
    return {
      title: clampTitle(`Search: ${q}`),
      description: clampDescription(
        `Search results for “${q}” across the Bhagavad Gita, characters, places, concepts, and more.`,
      ),
      // Canonical stays /search — query variants are not separate indexable URLs
      path: "/search",
      image: ogImageFor({ title: "Search", subtitle: q, eyebrow: "Divine" }),
    };
  }
  return {
    title: "Search Bhagavad Gita & Knowledge",
    description:
      "Search people, places, events, kingdoms, weapons, concepts, genealogy, Atlas, and Bhagavad Gita verses.",
    path: "/search",
    image: ogImageFor({
      title: "Search",
      subtitle: "Gita, characters, Atlas & more",
      eyebrow: "Divine",
    }),
  };
}

export function atlasIndexSeo(): PageMetadataInput {
  return {
    title: "Ancient Bharata Atlas",
    description:
      "Explore Ancient Bhārata on an interactive Mahābhārata atlas — kingdoms, rivers, events, and journeys with traditional placement certainty.",
    path: "/atlas",
    image: ogImageFor({
      title: "Ancient Bharata Atlas",
      subtitle: "Mahābhārata geography",
      eyebrow: "Atlas",
    }),
  };
}

export function timelineSeo(): PageMetadataInput {
  return {
    title: "Mahabharata Timeline",
    description:
      "Follow the Mahābhārata timeline — key events from the epic narrative in chronological order.",
    path: "/timeline",
    image: ogImageFor({
      title: "Mahabharata Timeline",
      eyebrow: "Events",
    }),
  };
}

export function genealogyIndexSeo(): PageMetadataInput {
  return {
    title: "Genealogy | Family Trees",
    description:
      "Explore Mahābhārata and Purāṇic genealogy — family trees for Krishna, the Pāṇḍavas, Kauravas, and more.",
    path: "/genealogy",
    image: ogImageFor({
      title: "Genealogy",
      subtitle: "Family trees of the epic",
      eyebrow: "Lineage",
    }),
  };
}

export function hubIndexSeo(
  hub: "encyclopedia" | "events" | "kingdoms" | "weapons" | "concepts",
): PageMetadataInput {
  const map = {
    encyclopedia: {
      title: "Encyclopedia",
      description:
        "Browse the Divine encyclopedia — people, places, concepts, weapons, and more from the Bhagavad Gita and Mahābhārata.",
    },
    events: {
      title: "Mahabharata Events",
      description:
        "Explore major events of the Mahābhārata — from dice game to Kurukṣetra and beyond.",
    },
    kingdoms: {
      title: "Ancient Kingdoms",
      description:
        "Discover kingdoms of Ancient Bhārata named in the Mahābhārata — capitals, rivers, and epic significance.",
    },
    weapons: {
      title: "Divine Weapons",
      description:
        "Learn about celestial and legendary weapons of the Mahābhārata — from Brahmāstra to Gāṇḍīva.",
    },
    concepts: {
      title: "Gita & Epic Concepts",
      description:
        "Explore core concepts of the Bhagavad Gita and Mahābhārata — dharma, karma, yoga, and more.",
    },
  } as const;
  const entry = map[hub];
  return {
    title: entry.title,
    description: entry.description,
    path: `/${hub}`,
    image: ogImageFor({ title: entry.title, eyebrow: "Divine" }),
  };
}
