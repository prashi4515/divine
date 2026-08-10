/**
 * Hub landing chrome (encyclopedia, kingdoms, concepts, weapons, timeline).
 * Entity titles/summaries stay in Knowledge Graph source language.
 */
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import { devanagariToReadingScript } from "@/lib/reading/shloka-script";

export type HubUiMessages = {
  browseBySection: string;
  byKind: string;
  featured: string;
  sectionFallback: string;
  entitiesCount: (n: number) => string;
  kingdomsCount: (n: number) => string;
  conceptsCount: (n: number) => string;
  mahabharataWeapons: (n: number) => string;
  broaderTraditionCount: (n: number) => string;
  broaderHinduTradition: string;
  broaderHinduBlurb: string;
  fullChronicle: string;
  explore: string;
};

const en: HubUiMessages = {
  browseBySection: "Browse by section",
  byKind: "By kind",
  featured: "Featured",
  sectionFallback: "Section",
  entitiesCount: (n) => (n === 1 ? "1 entity" : `${n} entities`),
  kingdomsCount: (n) => (n === 1 ? "1 kingdom" : `${n} kingdoms`),
  conceptsCount: (n) => (n === 1 ? "1 concept" : `${n} concepts`),
  mahabharataWeapons: (n) =>
    n === 1 ? "1 Mahabharata weapon" : `${n} Mahabharata weapons`,
  broaderTraditionCount: (n) =>
    n === 1 ? "1 broader tradition" : `${n} broader tradition`,
  broaderHinduTradition: "Broader Hindu tradition",
  broaderHinduBlurb:
    "These arms belong chiefly to Vedic or Puranic tradition. They appear here because the Mahabharata recalls them — not as Kurukshetra battlefield staples.",
  fullChronicle: "Full chronicle",
  explore: "Explore",
};

const te: HubUiMessages = {
  browseBySection: "విభాగం వారీగా చూడండి",
  byKind: "రకం వారీగా",
  featured: "ప్రముఖమైనవి",
  sectionFallback: "విభాగం",
  entitiesCount: (n) => `${n} ఎంటిటీలు`,
  kingdomsCount: (n) => `${n} రాజ్యాలు`,
  conceptsCount: (n) => `${n} భావనలు`,
  mahabharataWeapons: (n) => `${n} మహాభారత ఆయుధాలు`,
  broaderTraditionCount: (n) => `${n} విస్తృత సంప్రదాయం`,
  broaderHinduTradition: "విస్తృత హిందూ సంప్రదాయం",
  broaderHinduBlurb:
    "ఈ ఆయుధాలు ప్రధానంగా వైదిక లేదా పౌరాణిక సంప్రదాయానికి చెందినవి. మహాభారతం వాటిని గుర్తు చేస్తుంది కాబట్టి ఇక్కడ ఉన్నాయి — కురుక్షేత్ర యుద్ధభూమి ప్రధాన ఆయుధాలు కావు.",
  fullChronicle: "పూర్తి చరిత్ర",
  explore: "అన్వేషించండి",
};

const hi: HubUiMessages = {
  browseBySection: "खंड के अनुसार देखें",
  byKind: "प्रकार के अनुसार",
  featured: "विशेष",
  sectionFallback: "खंड",
  entitiesCount: (n) => `${n} प्रविष्टियाँ`,
  kingdomsCount: (n) => `${n} राज्य`,
  conceptsCount: (n) => `${n} अवधारणाएँ`,
  mahabharataWeapons: (n) => `${n} महाभारत शस्त्र`,
  broaderTraditionCount: (n) => `${n} व्यापक परंपरा`,
  broaderHinduTradition: "व्यापक हिंदू परंपरा",
  broaderHinduBlurb:
    "ये शस्त्र मुख्यतः वैदिक या पौराणिक परंपरा के हैं। महाभारत इन्हें स्मरण करता है — कुरुक्षेत्र के मुख्य युद्ध-शस्त्र के रूप में नहीं।",
  fullChronicle: "पूर्ण इतिहास",
  explore: "अन्वेषण करें",
};

export const CATALOG: Partial<Record<ReadingLanguageCode, HubUiMessages>> = {
  en,
  te,
  hi,
};

const SCRIPT_PROXY_LANGS = new Set(["kn", "ta", "ml", "or"]);

function scriptProxyHub(base: HubUiMessages, code: string): HubUiMessages {
  const t = (s: string) => devanagariToReadingScript(s, code);
  return {
    browseBySection: t(base.browseBySection),
    byKind: t(base.byKind),
    featured: t(base.featured),
    sectionFallback: t(base.sectionFallback),
    entitiesCount: (n) => t(base.entitiesCount(n)),
    kingdomsCount: (n) => t(base.kingdomsCount(n)),
    conceptsCount: (n) => t(base.conceptsCount(n)),
    mahabharataWeapons: (n) => t(base.mahabharataWeapons(n)),
    broaderTraditionCount: (n) => t(base.broaderTraditionCount(n)),
    broaderHinduTradition: t(base.broaderHinduTradition),
    broaderHinduBlurb: t(base.broaderHinduBlurb),
    fullChronicle: t(base.fullChronicle),
    explore: t(base.explore),
  };
}

export function getHubUiMessages(code: string): HubUiMessages {
  if (code === "te") return te;
  if (code === "hi" || code === "sa") return hi;
  if (SCRIPT_PROXY_LANGS.has(code)) return scriptProxyHub(hi, code);
  return en;
}
