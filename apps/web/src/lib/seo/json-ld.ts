import { absoluteUrl, getSiteUrl } from "@/lib/seo/site";
import { SITE_NAME, DEFAULT_DESCRIPTION } from "@/lib/seo/config";

export type BreadcrumbItem = {
  name: string;
  /** Path only; omit for the current (last) crumb. */
  href?: string;
};

export function breadcrumbJsonLd(crumbs: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(c.href ? { item: absoluteUrl(c.href) } : {}),
    })),
  };
}

export function websiteJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: getSiteUrl(),
    description: DEFAULT_DESCRIPTION,
  };
}

export function bookSeriesJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "BookSeries",
    name: "Bhagavad Gita",
    alternateName: ["Bhagavad-gītā", "Song of God"],
    url: absoluteUrl("/bhagavad-gita"),
    description:
      "The Bhagavad Gita — eighteen chapters of dialogue between Krishna and Arjuna.",
    numberOfItems: 18,
  };
}

export function chapterBookJsonLd(opts: {
  chapterNumber: number;
  title: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: `Bhagavad Gita Chapter ${opts.chapterNumber}: ${opts.title}`,
    url: absoluteUrl(opts.path),
    description: opts.description,
    isPartOf: {
      "@type": "BookSeries",
      name: "Bhagavad Gita",
      url: absoluteUrl("/bhagavad-gita"),
    },
    position: opts.chapterNumber,
    inLanguage: "en",
  };
}

export function verseCreativeWorkJsonLd(opts: {
  chapterNumber: number;
  verseNumber: number;
  chapterTitle?: string;
  name: string;
  description: string;
  path: string;
  text?: string;
  sanskritText?: string;
  transliteration?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: opts.name,
    headline: `Bhagavad Gita ${opts.chapterNumber}.${opts.verseNumber}`,
    url: absoluteUrl(opts.path),
    description: opts.description,
    ...(opts.text ? { text: opts.text } : {}),
    ...(opts.sanskritText
      ? {
          workExample: {
            "@type": "CreativeWork",
            inLanguage: "sa",
            text: opts.sanskritText,
          },
        }
      : {}),
    isPartOf: {
      "@type": "Book",
      name: opts.chapterTitle
        ? `Bhagavad Gita Chapter ${opts.chapterNumber}: ${opts.chapterTitle}`
        : `Bhagavad Gita Chapter ${opts.chapterNumber}`,
      url: absoluteUrl(`/bhagavad-gita/chapter-${opts.chapterNumber}`),
    },
    inLanguage: ["sa", "en"],
  };
}

export function verseFaqJsonLd(opts: {
  chapterNumber: number;
  verseNumber: number;
  chapterTitle: string;
  englishTranslation?: string;
  meaningSummary?: string;
}) {
  const c = opts.chapterNumber;
  const v = opts.verseNumber;
  const ch = opts.chapterTitle;

  const faqs = [
    {
      question: `What is Bhagavad Gita Chapter ${c}, Verse ${v}?`,
      answer: `Bhagavad Gita ${c}.${v} (also commonly written as BG ${c}.${v}, Gita ${c}.${v}, or Bhagavad Gita Chapter ${c}, Verse ${v}) is a verse from Chapter ${c} (${ch}).`,
    },
  ];

  if (opts.englishTranslation) {
    faqs.push({
      question: `What is the English translation of Bhagavad Gita ${c}.${v}?`,
      answer: opts.englishTranslation,
    });
  }

  if (opts.meaningSummary) {
    faqs.push({
      question: `What is the meaning and explanation of Bhagavad Gita ${c}.${v}?`,
      answer: opts.meaningSummary,
    });
  }

  return faqPageJsonLd(faqs);
}


export function collectionPageJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  items?: Array<{ name: string; path: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    ...(opts.items?.length
      ? {
          mainEntity: {
            "@type": "ItemList",
            itemListElement: opts.items.map((item, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: item.name,
              url: absoluteUrl(item.path),
            })),
          },
        }
      : {}),
  };
}

export function personJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  alternateName?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: opts.name,
    alternateName: opts.alternateName,
    description: opts.description,
    url: absoluteUrl(opts.path),
  };
}

export function placeJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  latitude?: number;
  longitude?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    ...(opts.latitude != null && opts.longitude != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: opts.latitude,
            longitude: opts.longitude,
          },
        }
      : {}),
  };
}

export function articleJsonLd(opts: {
  headline: string;
  description: string;
  path: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    url: absoluteUrl(opts.path),
    mainEntityOfPage: absoluteUrl(opts.path),
    ...(opts.image
      ? { image: opts.image.startsWith("http") ? opts.image : absoluteUrl(opts.image) }
      : {}),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: getSiteUrl(),
    },
  };
}

export function faqPageJsonLd(
  faqs: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}
