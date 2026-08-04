/**
 * Localized Knowledge Graph labels (kinds, events, weapons, card chrome).
 * kn/ta/ml/or are Hindi→script proxies; sa uses Hindi (Devanagari).
 */
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import { devanagariToReadingScript } from "@/lib/reading/shloka-script";
import {
  ENTITY_KIND_LABELS,
  EVENT_TYPE_LABELS,
  WEAPON_CATEGORY_LABELS,
  WEAPON_FOCUS_LABELS,
  type EntityKind,
  type EventType,
  type WeaponCategory,
  type WeaponFocus,
} from "@/lib/knowledge/types";

export type KnowledgeChromeLabels = {
  encyclopedia: string;
  kingdom: string;
  concept: string;
  weapon: string;
  timeline: string;
  people: string;
  places: string;
  broaderTradition: string;
  section: string;
  entities: string;
};

const kindHi: Record<string, string> = {
  "person": "व्यक्ति",
  "deity": "देवता",
  "avatar": "अवतार",
  "sage": "ऋषि",
  "asura": "असुर",
  "daitya": "दैत्य",
  "danava": "दानव",
  "rakshasa": "राक्षस",
  "deva": "देव",
  "naga": "नाग",
  "yaksha": "यक्ष",
  "gandharva": "गंधर्व",
  "devi": "देवी",
  "prajapati": "प्रजापति",
  "manu": "मनु",
  "king": "राजा",
  "queen": "रानी",
  "prince": "राजकुमार",
  "princess": "राजकुमारी",
  "warrior": "योद्धा",
  "kingdom": "राज्य",
  "city": "नगर",
  "forest": "वन",
  "river": "नदी",
  "mountain": "पर्वत",
  "temple": "मंदिर",
  "pilgrimage": "तीर्थ",
  "ashrama": "आश्रम",
  "battlefield": "रणभूमि",
  "dynasty": "वंश",
  "event": "घटना",
  "battle": "युद्ध",
  "weapon": "अस्त्र",
  "scripture": "शास्त्र",
  "chapter": "अध्याय",
  "verse": "श्लोक",
  "concept": "अवधारणा",
  "other": "अन्य"
};
const kindTe: Record<string, string> = {
  "person": "వ్యక్తి",
  "deity": "దేవత",
  "avatar": "అవతారం",
  "sage": "ఋషి",
  "asura": "అసురుడు",
  "daitya": "దైత్యుడు",
  "danava": "దానవుడు",
  "rakshasa": "రాక్షసుడు",
  "deva": "దేవుడు",
  "naga": "నాగుడు",
  "yaksha": "యక్షుడు",
  "gandharva": "గంధర్వుడు",
  "devi": "దేవి",
  "prajapati": "ప్రజాపతి",
  "manu": "మనువు",
  "king": "రాజు",
  "queen": "రాణి",
  "prince": "యువరాజు",
  "princess": "యువరాణి",
  "warrior": "యోధుడు",
  "kingdom": "రాజ్యం",
  "city": "నగరం",
  "forest": "అడవి",
  "river": "నది",
  "mountain": "పర్వతం",
  "temple": "దేవాలయం",
  "pilgrimage": "తీర్థం",
  "ashrama": "ఆశ్రమం",
  "battlefield": "యుద్ధభూమి",
  "dynasty": "వంశం",
  "event": "సంఘటన",
  "battle": "యుద్ధం",
  "weapon": "ఆయుధం",
  "scripture": "శాస్త్రం",
  "chapter": "అధ్యాయం",
  "verse": "శ్లోకం",
  "concept": "భావన",
  "other": "ఇతరం"
};
const eventHi: Record<string, string> = {
  "birth": "जन्म",
  "plot": "कथानक",
  "ceremony": "अनुष्ठान",
  "game": "द्यूत",
  "exile": "वनवास",
  "embassy": "दूतकार्य",
  "discourse": "उपदेश",
  "battle": "युद्ध",
  "death": "मृत्यु",
  "rite": "संस्कार",
  "other": "घटना"
};
const eventTe: Record<string, string> = {
  "birth": "జననం",
  "plot": "కథాంశం",
  "ceremony": "అనుష్ఠానం",
  "game": "జూదం",
  "exile": "వనవాసం",
  "embassy": "దూతకార్యం",
  "discourse": "ఉపదేశం",
  "battle": "యుద్ధం",
  "death": "మరణం",
  "rite": "సంస్కారం",
  "other": "సంఘటన"
};
const weaponHi: Record<string, string> = {
  "astra": "अस्त्र",
  "bow": "धनुष",
  "mace": "गदा",
  "sword": "खड्ग",
  "spear": "भाला",
  "conch": "शंख",
  "chariot": "रथ",
  "sacred-object": "पवित्र वस्तुएँ"
};
const weaponTe: Record<string, string> = {
  "astra": "అస్త్రాలు",
  "bow": "ధనుస్సులు",
  "mace": "గదలు",
  "sword": "ఖడ్గాలు",
  "spear": "బల్లెాలు",
  "conch": "శంఖాలు",
  "chariot": "రథాలు",
  "sacred-object": "పవిత్ర వస్తువులు"
};
const chromeHi: KnowledgeChromeLabels = {
  "encyclopedia": "विश्वकोश",
  "kingdom": "राज्य",
  "concept": "अवधारणा",
  "weapon": "अस्त्र",
  "timeline": "समयरेखा",
  "people": "व्यक्ति",
  "places": "स्थान",
  "broaderTradition": "व्यापक परंपरा",
  "section": "खंड",
  "entities": "प्रविष्टियाँ"
};
const chromeTe: KnowledgeChromeLabels = {
  "encyclopedia": "విజ్ఞానసర్వస్వం",
  "kingdom": "రాజ్యం",
  "concept": "భావన",
  "weapon": "ఆయుధం",
  "timeline": "కాలరేఖ",
  "people": "వ్యక్తులు",
  "places": "స్థలాలు",
  "broaderTradition": "విస్తృత సంప్రదాయం",
  "section": "విభాగం",
  "entities": "ఎంటిటీలు"
};

const SCRIPT_PROXY = new Set(["kn", "ta", "ml", "or"]);

function proxyMap(base: Record<string, string>, code: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(base)) {
    out[k] = devanagariToReadingScript(v, code);
  }
  return out;
}

function proxyChrome(base: KnowledgeChromeLabels, code: string): KnowledgeChromeLabels {
  const t = (s: string) => devanagariToReadingScript(s, code);
  return {
    encyclopedia: t(base.encyclopedia),
    kingdom: t(base.kingdom),
    concept: t(base.concept),
    weapon: t(base.weapon),
    timeline: t(base.timeline),
    people: t(base.people),
    places: t(base.places),
    broaderTradition: t(base.broaderTradition),
    section: t(base.section),
    entities: t(base.entities),
  };
}

function kindCatalog(code: string): Record<string, string> {
  if (code === "te") return kindTe;
  if (code === "hi" || code === "sa") return kindHi;
  if (SCRIPT_PROXY.has(code)) return proxyMap(kindHi, code);
  return ENTITY_KIND_LABELS as Record<string, string>;
}

function eventCatalog(code: string): Record<string, string> {
  if (code === "te") return eventTe;
  if (code === "hi" || code === "sa") return eventHi;
  if (SCRIPT_PROXY.has(code)) return proxyMap(eventHi, code);
  return EVENT_TYPE_LABELS as Record<string, string>;
}

function weaponCatalog(code: string): Record<string, string> {
  if (code === "te") return weaponTe;
  if (code === "hi" || code === "sa") return weaponHi;
  if (SCRIPT_PROXY.has(code)) return proxyMap(weaponHi, code);
  return WEAPON_CATEGORY_LABELS as Record<string, string>;
}

export function localizedEntityKindLabel(kind: EntityKind, code: string): string {
  return kindCatalog(code)[kind] ?? ENTITY_KIND_LABELS[kind] ?? kind;
}

export function localizedEventTypeLabel(type: EventType, code: string): string {
  return eventCatalog(code)[type] ?? EVENT_TYPE_LABELS[type] ?? type;
}

export function localizedWeaponCategoryLabel(
  category: WeaponCategory,
  code: string,
): string {
  return weaponCatalog(code)[category] ?? WEAPON_CATEGORY_LABELS[category] ?? category;
}

export function localizedWeaponFocusLabel(focus: WeaponFocus, code: string): string {
  if (code === "en") return WEAPON_FOCUS_LABELS[focus];
  const chrome = localizedKnowledgeChrome(code);
  if (focus === "broader-hindu") return chrome.broaderTradition;
  // Mahabharata — keep proper name, lightly localized
  if (code === "te") return "మహాభారతం";
  if (code === "hi" || code === "sa") return "महाभारत";
  if (SCRIPT_PROXY.has(code)) return devanagariToReadingScript("महाभारत", code);
  return WEAPON_FOCUS_LABELS[focus];
}

export function localizedKnowledgeChrome(code: string): KnowledgeChromeLabels {
  if (code === "te") return chromeTe;
  if (code === "hi" || code === "sa") return chromeHi;
  if (SCRIPT_PROXY.has(code)) return proxyChrome(chromeHi, code);
  return {
    encyclopedia: "Encyclopedia",
    kingdom: "Kingdom",
    concept: "Concept",
    weapon: "Weapon",
    timeline: "Timeline",
    people: "people",
    places: "places",
    broaderTradition: "Broader tradition",
    section: "Section",
    entities: "entities",
  };
}

export type ReadingLang = ReadingLanguageCode;


const personCategoryHi: Record<string, string> = {
  supreme: "परम",
  trimurti: "त्रिमूर्ति",
  avatar: "अवतार",
  devi: "देवी",
  prajapati: "प्रजापति",
  manu: "मनु",
  rishi: "ऋषि",
  saptarishi: "सप्तर्षि",
  king: "राजा",
  queen: "रानी",
  prince: "राजकुमार",
  princess: "राजकुमारी",
  warrior: "योद्धा",
  deva: "देव",
  daitya: "दैत्य",
  danava: "दानव",
  rakshasa: "राक्षस",
  asura: "असुर",
  yaksha: "यक्ष",
  gandharva: "गंधर्व",
  naga: "नाग",
  "dynasty-founder": "वंश संस्थापक",
  other: "अन्य",
};

const personCategoryTe: Record<string, string> = {
  supreme: "పరమ",
  trimurti: "త్రిమూర్తి",
  avatar: "అవతారం",
  devi: "దేవి",
  prajapati: "ప్రజాపతి",
  manu: "మనువు",
  rishi: "ఋషి",
  saptarishi: "సప్తర్షి",
  king: "రాజు",
  queen: "రాణి",
  prince: "యువరాజు",
  princess: "యువరాణి",
  warrior: "యోధుడు",
  deva: "దేవుడు",
  daitya: "దైత్యుడు",
  danava: "దానవుడు",
  rakshasa: "రాక్షసుడు",
  asura: "అసురుడు",
  yaksha: "యక్షుడు",
  gandharva: "గంధర్వుడు",
  naga: "నాగుడు",
  "dynasty-founder": "వంశ స్థాపకుడు",
  other: "ఇతరం",
};

export function localizedPersonCategoryLabel(
  category: string,
  code: string,
): string {
  if (code === "te") return personCategoryTe[category] ?? category;
  if (code === "hi" || code === "sa") return personCategoryHi[category] ?? category;
  if (SCRIPT_PROXY.has(code)) {
    const hi = personCategoryHi[category];
    return hi ? devanagariToReadingScript(hi, code) : category;
  }
  return category;
}
