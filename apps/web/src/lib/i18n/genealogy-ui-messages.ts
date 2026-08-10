/**
 * Hub page chrome for Genealogy — follows the UI language switcher.
 * Knowledge Graph titles/summaries stay in their source language.
 */
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import { devanagariToReadingScript } from "@/lib/reading/shloka-script";

export type GenealogyUiMessages = {
  exploreModules: string;
  interactiveCount: (available: number, upcoming: number) => string;
  more: string;
  inPreparation: string;
  currentlyCited: string;
  editorialEyebrow: string;
  editorialTitle: string;
  editorialBody: string;
  editorialVariant: string;
  sourcesOnEveryCard: string;
  variantsPreserved: string;
  linkedToGita: string;
  moduleFallback: string;
  comingSoon: string;
  figures: (n: number) => string;
  explore: string;
  groupAsura: string;
  groupAsuraBlurb: string;
  groupDivine: string;
  groupDivineBlurb: string;
  groupOtherRaces: string;
  groupOtherRacesBlurb: string;
  groupDynasties: string;
  groupDynastiesBlurb: string;
  groupEpicFamilies: string;
  groupEpicFamiliesBlurb: string;
  groupIndexes: string;
  groupIndexesBlurb: string;
};

const en: GenealogyUiMessages = {
  exploreModules: "Explore a module",
  interactiveCount: (a, u) => `${a} interactive · ${u} in preparation`,
  more: "More",
  inPreparation: "In preparation",
  currentlyCited: "Currently being cited and reviewed",
  editorialEyebrow: "Editorial standards",
  editorialTitle: "Every relationship, cited.",
  editorialBody:
    "Genealogy in the Sanatana tradition is preserved not in one book but in many. Divine draws each relationship from an accepted scripture and cites the specific section alongside the fact. Where traditions differ, we mark the entry as a",
  editorialVariant: "Variant Tradition",
  sourcesOnEveryCard: "Sources shown on every card",
  variantsPreserved: "Variant traditions preserved, not hidden",
  linkedToGita: "Linked to the Bhagavad Gita where relevant",
  moduleFallback: "Module",
  comingSoon: "Coming soon",
  figures: (n) => (n === 1 ? "1 figure" : `${n} figures`),
  explore: "Explore",
  groupAsura: "Asura lineages",
  groupAsuraBlurb:
    "Daityas (Diti) and Danavas (Danu) are the Asura houses. Rakshasas are listed next — a separate race, never merged.",
  groupDivine: "Divinity & creation",
  groupDivineBlurb: "Trimurti, Devis, Prajapatis, Manus, Saptarishis and Devas.",
  groupOtherRaces: "Nagas, Yakshas & Gandharvas",
  groupOtherRacesBlurb: "Separate celestial and subterranean races.",
  groupDynasties: "Royal dynasties",
  groupDynastiesBlurb: "Solar, Lunar, Raghu, Yadu and Kuru houses.",
  groupEpicFamilies: "Epic families",
  groupEpicFamiliesBlurb: "Pandavas, Kauravas, Krishna and Rama.",
  groupIndexes: "Indexes",
  groupIndexesBlurb: "Cross-cutting rishis and kings.",
};

const te: GenealogyUiMessages = {
  exploreModules: "ఒక మాడ్యూల్‌ను అన్వేషించండి",
  more: "మరిన్ని",
  inPreparation: "సిద్ధమవుతోంది",
  currentlyCited: "ప్రస్తుతం ఉల్లేఖనాలు సేకరిస్తున్నాం",
  editorialEyebrow: "సంపాదకీయ ప్రమాణాలు",
  editorialTitle: "ప్రతి సంబంధానికి ఆధారం.",
  editorialBody: "సనాతన సంప్రదాయంలో వంశావళి ఒకే గ్రంథంలో కాక అనేక గ్రంథాలలో భద్రపరచబడింది. Divine ప్రతి సంబంధాన్ని అంగీకృత గ్రంథాల నుంచి తీసుకుంటుంది. సంప్రదాయాలు విభేదించినప్పుడు దానిని",
  editorialVariant: "వైవిధ్య సంప్రదాయం",
  sourcesOnEveryCard: "ప్రతి కార్డుపై ఆధారాలు",
  variantsPreserved: "వైవిధ్య సంప్రదాయాలు దాచబడవు",
  linkedToGita: "అవసరమైన చోట భగవద్గీతకు లింక్",
  moduleFallback: "మాడ్యూల్",
  comingSoon: "త్వరలో",
  explore: "అన్వేషించండి",
  groupAsura: "అసుర వంశాలు",
  groupAsuraBlurb: "దైత్యులు (దితి) మరియు దానవులు (దను) అసుర గృహాలు. రాక్షసులు తర్వాత — వేరు జాతి, కలపబడరు.",
  groupDivine: "దైవత్వం & సృష్టి",
  groupDivineBlurb: "త్రిమూర్తి, దేవీలు, ప్రజాపతులు, మనువులు, సప్తర్షులు మరియు దేవతలు.",
  groupOtherRaces: "నాగులు, యక్షులు & గంధర్వులు",
  groupOtherRacesBlurb: "వేర్వేరు దివ్య మరియు భూగర్భ జాతులు.",
  groupDynasties: "రాజవంశాలు",
  groupDynastiesBlurb: "సూర్య, చంద్ర, రఘు, యదు మరియు కురు వంశాలు.",
  groupEpicFamilies: "ఇతిహాస కుటుంబాలు",
  groupEpicFamiliesBlurb: "పాండవులు, కౌరవులు, కృష్ణుడు మరియు రాముడు.",
  groupIndexes: "సూచికలు",
  groupIndexesBlurb: "ఋషులు మరియు రాజుల సంకలనాలు.",
  interactiveCount: (a, u) => `${a} ఇంటరాక్టివ్ · ${u} సిద్ధమవుతున్నవి`,
  figures: (n) => `${n} వ్యక్తులు`,
};

const hi: GenealogyUiMessages = {
  exploreModules: "एक वंश मॉड्यूल देखें",
  more: "और",
  inPreparation: "तैयारी में",
  currentlyCited: "वर्तमान में उद्धृत और समीक्षित हो रहा है",
  editorialEyebrow: "संपादकीय मानक",
  editorialTitle: "हर संबंध, उद्धृत।",
  editorialBody: "सनातन परंपरा में वंशावली एक पुस्तक में नहीं, अनेक ग्रंथों में सुरक्षित है। Divine प्रत्येक संबंध को स्वीकृत शास्त्र से लेता है। जहाँ परंपराएँ भिन्न हों, हम प्रविष्टि को",
  editorialVariant: "वैकल्पिक परंपरा",
  sourcesOnEveryCard: "हर कार्ड पर स्रोत",
  variantsPreserved: "वैकल्पिक परंपराएँ छिपाई नहीं जातीं",
  linkedToGita: "जहाँ प्रासंगिक हो, भगवद्गीता से जुड़ा",
  moduleFallback: "मॉड्यूल",
  comingSoon: "जल्द आ रहा है",
  explore: "अन्वेषण करें",
  groupAsura: "असुर वंश",
  groupAsuraBlurb: "दैत्य (दिति) और दानव (दनु) असुर कुल हैं। राक्षस अलग जाति हैं.",
  groupDivine: "दिव्यता एवं सृष्टि",
  groupDivineBlurb: "त्रिमूर्ति, देवी, प्रजापति, मनु, सप्तर्षि और देव।",
  groupOtherRaces: "नाग, यक्ष एवं गंधर्व",
  groupOtherRacesBlurb: "पृथक दिव्य और अधोलोक जातियाँ।",
  groupDynasties: "राजवंश",
  groupDynastiesBlurb: "सूर्य, चंद्र, रघु, यदु और कुरु वंश।",
  groupEpicFamilies: "महाकाव्य परिवार",
  groupEpicFamiliesBlurb: "पांडव, कौरव, कृष्ण और राम।",
  groupIndexes: "अनुक्रमणिकाएँ",
  groupIndexesBlurb: "ऋषि और राजाओं की सूचियाँ।",
  interactiveCount: (a, u) => `${a} इंटरैक्टिव · ${u} तैयारी में`,
  figures: (n) => `${n} व्यक्ति`,
};
export const CATALOG: Partial<Record<ReadingLanguageCode, GenealogyUiMessages>> = {
  en,
  te,
  hi,
};

const SCRIPT_PROXY_LANGS = new Set(["kn", "ta", "ml", "or"]);

function scriptProxyMessages(
  base: GenealogyUiMessages,
  code: string,
): GenealogyUiMessages {
  const t = (s: string) => devanagariToReadingScript(s, code);
  return {
    exploreModules: t(base.exploreModules),
    interactiveCount: (a, u) => t(base.interactiveCount(a, u)),
    more: t(base.more),
    inPreparation: t(base.inPreparation),
    currentlyCited: t(base.currentlyCited),
    editorialEyebrow: t(base.editorialEyebrow),
    editorialTitle: t(base.editorialTitle),
    editorialBody: t(base.editorialBody),
    editorialVariant: t(base.editorialVariant),
    sourcesOnEveryCard: t(base.sourcesOnEveryCard),
    variantsPreserved: t(base.variantsPreserved),
    linkedToGita: t(base.linkedToGita),
    moduleFallback: t(base.moduleFallback),
    comingSoon: t(base.comingSoon),
    figures: (n) => t(base.figures(n)),
    explore: t(base.explore),
    groupAsura: t(base.groupAsura),
    groupAsuraBlurb: t(base.groupAsuraBlurb),
    groupDivine: t(base.groupDivine),
    groupDivineBlurb: t(base.groupDivineBlurb),
    groupOtherRaces: t(base.groupOtherRaces),
    groupOtherRacesBlurb: t(base.groupOtherRacesBlurb),
    groupDynasties: t(base.groupDynasties),
    groupDynastiesBlurb: t(base.groupDynastiesBlurb),
    groupEpicFamilies: t(base.groupEpicFamilies),
    groupEpicFamiliesBlurb: t(base.groupEpicFamiliesBlurb),
    groupIndexes: t(base.groupIndexes),
    groupIndexesBlurb: t(base.groupIndexesBlurb),
  };
}

export function getGenealogyUiMessages(code: string): GenealogyUiMessages {
  if (code === "te") return te;
  if (code === "hi" || code === "sa") return hi;
  if (SCRIPT_PROXY_LANGS.has(code)) return scriptProxyMessages(hi, code);
  return en;
}

export const GENEALOGY_GROUP_IDS = [
  "asura-lineages",
  "divine",
  "other-races",
  "dynasties",
  "epic-families",
  "indexes",
] as const;

export type GenealogyGroupId = (typeof GENEALOGY_GROUP_IDS)[number];

export function genealogyGroupCopy(
  t: GenealogyUiMessages,
  id: GenealogyGroupId,
): { title: string; blurb: string } {
  switch (id) {
    case "asura-lineages":
      return { title: t.groupAsura, blurb: t.groupAsuraBlurb };
    case "divine":
      return { title: t.groupDivine, blurb: t.groupDivineBlurb };
    case "other-races":
      return { title: t.groupOtherRaces, blurb: t.groupOtherRacesBlurb };
    case "dynasties":
      return { title: t.groupDynasties, blurb: t.groupDynastiesBlurb };
    case "epic-families":
      return { title: t.groupEpicFamilies, blurb: t.groupEpicFamiliesBlurb };
    case "indexes":
      return { title: t.groupIndexes, blurb: t.groupIndexesBlurb };
  }
}
