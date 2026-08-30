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
  chapterTitle?: string,
): PageMetadataInput {
  const title = `Bhagavad Gita ${chapterNumber}.${verseNumber} – Meaning & Translation`;

  const descriptionSnippet = snippet
    ? snippet.replace(/\s+/g, " ").trim()
    : undefined;

  const description = clampDescription(
    descriptionSnippet
      ? `Read Bhagavad Gita ${chapterNumber}.${verseNumber}${
          chapterTitle ? ` (${chapterTitle})` : ""
        } in Sanskrit with English translation, word-by-word meaning, and commentary: “${descriptionSnippet}”`
      : `Read Bhagavad Gita ${chapterNumber}.${verseNumber}${
          chapterTitle ? ` from ${chapterTitle}` : ""
        } in Sanskrit with English translation, word-by-word meaning, and commentary.`,
  );

  return {
    title,
    description,
    path: `/verse/${chapterNumber}/${verseNumber}`,
    type: "article",
    image: ogImageFor({
      title: `Bhagavad Gita ${chapterNumber}.${verseNumber}`,
      subtitle: chapterTitle || "Sanskrit, translation & meaning",
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
      path: "/search",
      noindex: true,
      image: ogImageFor({ title: "Search", subtitle: q, eyebrow: "Divine" }),
    };
  }
  return {
    title: "Search Bhagavad Gita & Knowledge",
    description:
      "Search people, places, events, kingdoms, weapons, concepts, genealogy, Atlas, and Bhagavad Gita verses.",
    path: "/search",
    noindex: true,
    image: ogImageFor({
      title: "Search",
      subtitle: "Bhagavad Gita & Knowledge",
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
    title: "Bhagavad Gita Family Tree & Mahabharata Lineages",
    description:
      "Explore the complete Bhagavad Gita family tree — interactive, cited lineages for the Pandavas, Kauravas, Krishna, Kuru dynasty, and Purāṇic sages.",
    path: "/genealogy",
    image: ogImageFor({
      title: "Bhagavad Gita Family Tree",
      subtitle: "Lineages of the Mahabharata & Purāṇas",
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

export function babyNameIndexSeo(): PageMetadataInput {
  return {
    title: "Ancient Scripture & Sanskrit Baby Names",
    description:
      "Explore verified ancient Indian and Sanskrit baby names with etymology, scripture citations, and 4-tier meanings from the Bhagavad Gita, Mahabharata & Ramayana.",
    path: "/baby-names",
    image: ogImageFor({
      title: "Ancient Scripture Baby Names",
      subtitle: "Sanskrit etymology & scriptural citations",
      eyebrow: "Names",
    }),
  };
}

export function babyNameSeo(
  nameEn: string,
  classification: string,
  primaryMeaning: string,
  primaryScripture?: string
): PageMetadataInput {
  let title = `${nameEn} – Meaning & Sanskrit Origin`;
  if (classification === "SCRIPTURAL_ATTESTED" && primaryScripture) {
    if (primaryScripture.includes("Mahabharata")) {
      title = `${nameEn} – Meaning & Mahabharata Origin`;
    } else if (primaryScripture.includes("Bhagavad Gita")) {
      title = `${nameEn} – Meaning & Gita Significance`;
    } else if (primaryScripture.includes("Ramayana")) {
      title = `${nameEn} – Meaning & Ramayana Origin`;
    }
  } else if (classification === "TRADITIONALLY_ATTESTED") {
    title = `${nameEn} – Meaning & Traditional Origin`;
  }

  const cleanMeaning = primaryMeaning.replace(/^.*meaning\s+“?/i, "").replace(/”\.?$/, "");

  const description = clampDescription(
    `What does ${nameEn} mean? Discover the Sanskrit etymology, literal root meaning (${cleanMeaning}), scriptural citations, and modern significance of ${nameEn}.`
  );

  return {
    title,
    description,
    path: `/baby-names/${nameEn.toLowerCase()}`,
    type: "article",
    image: ogImageFor({
      title: `${nameEn} – Name Meaning`,
      subtitle: primaryMeaning,
      eyebrow: "Scripture Baby Names",
    }),
  };
}


export function babyNameCategorySeo(category: string): PageMetadataInput {
  const catCap = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: `${catCap} Ancient Scripture & Sanskrit Baby Names`,
    description: `Explore verified ${category} baby names from ancient Sanskrit scriptures, Bhagavad Gita, Mahabharata, and Ramayana with literal meanings and citations.`,
    path: `/baby-names/${category.toLowerCase()}`,
    image: ogImageFor({
      title: `${catCap} Baby Names`,
      subtitle: "Scripture & Sanskrit origin",
      eyebrow: "Names",
    }),
  };
}

