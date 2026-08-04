/**
 * Localized encyclopedia section cards.
 */
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import { devanagariToReadingScript } from "@/lib/reading/shloka-script";

export type SectionCopy = {
  title: string;
  eyebrow: string;
  summary: string;
};

const te: Partial<Record<string, SectionCopy>> = {
  "persons-and-deities": {
    title: "వ్యక్తులు & దేవతలు",
    eyebrow: "విజ్ఞానసర్వస్వం",
    summary: "దేవతలు, ఋషులు, రాజులు, అసురులు మరియు ఇతిహాస నాయకులు.",
  },
  "places": {
    title: "స్థలాలు",
    eyebrow: "విజ్ఞానసర్వస్వం",
    summary: "నగరాలు, నదులు మరియు పవిత్ర క్షేత్రాలు.",
  },
  "concepts": {
    title: "భావనలు",
    eyebrow: "విజ్ఞానసర్వస్వం",
    summary: "ధర్మం, కర్మ, భక్తి, జ్ఞానం, యోగం, ఆత్మ మరియు సంబంధిత భావనలు.",
  },
  "dynasties": {
    title: "వంశాలు",
    eyebrow: "విజ్ఞానసర్వస్వం",
    summary: "రాజ మరియు దివ్య వంశాలు.",
  },
  "scriptures": {
    title: "శాస్త్రాలు & శ్లోకాలు",
    eyebrow: "విజ్ఞానసర్వస్వం",
    summary: "గ్రాఫ్‌కు లింక్ అయిన శాస్త్ర మరియు శ్లోక స్టబ్‌లు.",
  },
};

const hi: Partial<Record<string, SectionCopy>> = {
  "persons-and-deities": {
    title: "व्यक्ति एवं देवता",
    eyebrow: "विश्वकोश",
    summary: "देव, ऋषि, राजा, असुर और महाकाव्य नायक।",
  },
  "places": {
    title: "स्थान",
    eyebrow: "विश्वकोश",
    summary: "नगर, नदियाँ और पवित्र क्षेत्र।",
  },
  "concepts": {
    title: "अवधारणाएँ",
    eyebrow: "विश्वकोश",
    summary: "धर्म, कर्म, भक्ति, ज्ञान, योग, आत्मा और संबंधित विचार।",
  },
  "dynasties": {
    title: "वंश",
    eyebrow: "विश्वकोश",
    summary: "राजकीय और दिव्य वंश।",
  },
  "scriptures": {
    title: "शास्त्र एवं श्लोक",
    eyebrow: "विश्वकोश",
    summary: "ज्ञान ग्राफ से जुड़े शास्त्र और श्लोक।",
  },
};

const SCRIPT_PROXY = new Set(["kn", "ta", "ml", "or"]);

function proxy(copy: SectionCopy, code: string): SectionCopy {
  return {
    title: devanagariToReadingScript(copy.title, code),
    eyebrow: devanagariToReadingScript(copy.eyebrow, code),
    summary: devanagariToReadingScript(copy.summary, code),
  };
}

export function localizeEncyclopediaSection(
  section: { slug: string; title: string; eyebrow?: string | null; summary: string },
  code: string,
): SectionCopy {
  if (code === "te") {
    const hit = te[section.slug];
    if (hit) return hit;
  }
  if (code === "hi" || code === "sa") {
    const hit = hi[section.slug];
    if (hit) return hit;
  }
  if (SCRIPT_PROXY.has(code)) {
    const hit = hi[section.slug];
    if (hit) return proxy(hit, code);
  }
  return {
    title: section.title,
    eyebrow: section.eyebrow ?? "Encyclopedia",
    summary: section.summary,
  };
}
