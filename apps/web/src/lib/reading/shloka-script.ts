import Sanscript from "@indic-transliteration/sanscript";
import { repairIndicOrthography } from "@/lib/reading/repair-indic-orthography";

/** Sanscript schemes for public reading languages. */
const LANGUAGE_SCHEME: Record<string, string> = {
  sa: "devanagari",
  hi: "devanagari",
  te: "telugu",
  kn: "kannada",
  ta: "tamil",
  ml: "malayalam",
  or: "oriya",
  en: "iast",
};

/**
 * Collapse blank lines so shloka couplets sit like print editions
 * (DB often stores `\n\n` between pādas, which looks huge with pre-line).
 * Also repairs broken virama+matra sequences (dotted-circle glyphs).
 */
export function formatShlokaDisplay(text: string): string {
  return repairIndicOrthography(
    text
      .replace(/\r\n/g, "\n")
      .replace(/[^\S\n]+\n/g, "\n")
      .replace(/\n{2,}/g, "\n")
      .trim(),
  );
}

/** Strip dandas / verse markers left by Devanagari→IAST conversion. */
function cleanIastMarkup(text: string): string {
  return text
    .replace(/[।॥]/g, "")
    .replace(/\|+/g, "")
    .replace(/\b\d+\.\d+\b/g, "")
    .replace(/[^\S\n]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Popular “easy pronunciation” Latin (śhrī, kṛipayā, ch… for च) → standard IAST.
 * Used only when Devanagari is unavailable.
 */
export function normalizePhoneticTransliteration(text: string): string {
  // Distinct PUA placeholders (must not contain "ch").
  const CCH = "\uE000";
  const CCH_UP = "\uE002";
  const CH = "\uE001";
  const CH_UP = "\uE003";
  return text
    .replace(/chchh/g, CCH)
    .replace(/Chchh/g, CCH_UP)
    .replace(/chh/g, CH)
    .replace(/Chh/g, CH_UP)
    .replace(/ch/g, "c")
    .replace(/Ch/g, "C")
    .replaceAll(CCH, "cch")
    .replaceAll(CCH_UP, "Cch")
    .replaceAll(CH, "ch")
    .replaceAll(CH_UP, "Ch")
    .replace(/śh/g, "ś")
    .replace(/Śh/g, "Ś")
    .replace(/ṣh/g, "ṣ")
    .replace(/Ṣh/g, "Ṣ")
    .replace(/ṛi/g, "ṛ")
    .replace(/Ṛi/g, "Ṛ")
    .replace(/ṝi/g, "ṝ")
    .replace(/Ṝi/g, "Ṝ")
    .replace(/\b[Ss]w(?=[aeiouāīūṛṝḷḹeéoó])/g, (m) =>
      m[0] === "S" ? "Sv" : "sv",
    );
}

/**
 * Canonical IAST for display: prefer Devanagari→IAST (Sanscript), else
 * normalize a stored phonetic Latin string.
 */
export function toIast(
  sanskritText: string,
  fallbackPhonetic?: string | null,
): string {
  const source = repairIndicOrthography(sanskritText).trim();
  if (source) {
    try {
      const converted = Sanscript.t(source, "devanagari", "iast");
      return formatShlokaDisplay(cleanIastMarkup(converted));
    } catch {
      // fall through to phonetic cleanup
    }
  }
  const phonetic = fallbackPhonetic?.trim();
  if (phonetic) {
    return formatShlokaDisplay(normalizePhoneticTransliteration(phonetic));
  }
  return "";
}

/**
 * Sanscript → Telugu keeps Sanskrit class-nasals (సఞ్జయ). Print Telugu
 * (holy-bhagavad-gita.org) uses anusvara (సంజయ). Same for other vargas.
 */
export function normalizeTeluguShlokaOrthography(text: string): string {
  return text
    .replace(/\u0C3D/g, "") // avagraha ఽ
    .replace(/ఙ్(?=[కఖగఘ])/gu, "ం")
    .replace(/ఞ్(?=[చఛజఝ])/gu, "ం")
    .replace(/ణ్(?=[టఠడఢ])/gu, "ం")
    .replace(/న్(?=[తథదధ])/gu, "ం")
    .replace(/మ్(?=[పఫబభ])/gu, "ం");
}

/**
 * Render the Sanskrit shloka in the script matching the reading language
 * (stotranidhi-style: Telugu → Telugu script, English → IAST, etc.).
 */
export function shlokaInLanguage(
  sanskritText: string,
  language: string,
  iastFromDb?: string | null,
): string {
  const scheme = LANGUAGE_SCHEME[language] ?? "devanagari";
  // Fix Devanagari before any script conversion so te/kn/ta/ml/or inherit it.
  const source = repairIndicOrthography(sanskritText);

  if (scheme === "devanagari") {
    return formatShlokaDisplay(source);
  }

  if (scheme === "iast") {
    // Always prefer proper IAST from Devanagari — imported Latin is often
    // a non-standard “śhrī / kṛipayā / ch…” pronunciation scheme.
    return toIast(source, iastFromDb);
  }

  try {
    let converted = Sanscript.t(source, "devanagari", scheme);
    if (scheme === "telugu") {
      converted = normalizeTeluguShlokaOrthography(converted);
    }
    return formatShlokaDisplay(converted);
  } catch {
    return formatShlokaDisplay(source);
  }
}

/** Whether the reading language uses a non-Devanagari Brahmic script. */
export function isIndicScriptLanguage(language: string): boolean {
  return ["te", "kn", "ta", "ml", "or"].includes(language);
}

const ENTITY_TRANSLATIONS: Record<string, Record<string, string>> = {
  "Creation": {
    te: "సృష్టి (Creation)",
    hi: "सृष्टि",
    sa: "सृष्टिः",
    kn: "ಸೃಷ್ಟಿ (Creation)",
    ta: "சிருஷ்டி (Creation)",
    ml: "സൃഷ്ടി (Creation)",
    or: "ସୃଷ୍ଟି (Creation)",
  },
  "Major Dynasties": {
    te: "ప్రధాన రాజవంశాలు (Major Dynasties)",
    hi: "प्रमुख राजवंश",
    sa: "प्रधानाः राजवंशः",
    kn: "ಪ್ರಮುಖ ರಾಜವಂಶಗಳು (Major Dynasties)",
    ta: "முக்கிய வம்சங்கள் (Major Dynasties)",
    ml: "പ്രധാന രാജവംശങ്ങൾ (Major Dynasties)",
    or: "ପ୍ରମୁଖ ରାଜବଂଶ (Major Dynasties)",
  },
  "Birth of Krishna": {
    te: "కృష్ణ జన్మ (Birth of Krishna)",
    hi: "कृष्ण जन्म",
    sa: "कृष्णजन्म",
    kn: "ಕೃಷ್ಣ ಜನ್ಮ (Birth of Krishna)",
    ta: "கிருஷ்ண ஜனனம் (Birth of Krishna)",
    ml: "കൃഷ്ണ ജനനം (Birth of Krishna)",
    or: "କୃଷ୍ଣ ଜନ୍ମ (Birth of Krishna)",
  },
  "Pandava Exile": {
    te: "పాండవుల వనవాసం (Pandava Exile)",
    hi: "पांडव वनवास",
    sa: "पाण्डववनवासः",
    kn: "ಪಾಂಡವರ ವನವಾಸ (Pandava Exile)",
    ta: "பாண்டவர் வனவாசம் (Pandava Exile)",
    ml: "പാണ്ഡവ വനവാസം (Pandava Exile)",
    or: "ପାଣ୍ଡବ ବନବାସ (Pandava Exile)",
  },
  "Kurukshetra War": {
    te: "కురుక్షేత్ర యుద్ధం (Kurukshetra War)",
    hi: "कुरुक्षेत्र युद्ध",
    sa: "कुरुक्षेत्रयुद्धम्",
    kn: "ಕುರುಕ್ಷೇತ್ರ ಯುದ್ಧ (Kurukshetra War)",
    ta: "குருக்ஷேத்திர போர் (Kurukshetra War)",
    ml: "കുരുക്ഷേത്ര യുദ്ധം (Kurukshetra War)",
    or: "କୁରୁକ୍ଷେତ୍ର ଯୁଦ୍ଧ (Kurukshetra War)",
  },
  "Kuru": {
    te: "కురు (Kuru)",
    hi: "कुरु",
    sa: "कुरुः",
    kn: "ಕುರು",
    ta: "குரு",
    ml: "കുരു",
    or: "କୁରୁ",
  },
  "Bharata": {
    te: "భరత (Bharata)",
    hi: "भरत",
    sa: "भरतः",
    kn: "ಭರತ",
    ta: "பரதன்",
    ml: "ഭരതൻ",
    or: "ଭରତ",
  },
  "Ikshvaku": {
    te: "ఇక్ష్వాకు (Ikshvaku)",
    hi: "इक्ष्वाकु",
    sa: "इक्ष्वाकुः",
    kn: "ಇಕ್ಷ್ವಾಕು",
    ta: "இக்ஷ்வாகு",
    ml: "ഇക്ഷ്വാകു",
    or: "ଇକ୍ଷାକୂ",
  },
  "Brahmastra": {
    te: "బ్రహ్మాస్త్రం (Brahmastra)",
    hi: "ब्रह्मास्त्र",
    sa: "ब्रह्मास्त्रम्",
    kn: "ಬ್ರಹ್ಮಾಸ್ತ್ರ",
    ta: "பிரம்மாஸ்திரம்",
    ml: "ബ്രഹ്മാസ്ത്രം",
    or: "ବ୍ରହ୍ମାସ୍ତ୍ର",
  },
  "Pashupatastra": {
    te: "పాశుపతాస్త్రం (Pashupatastra)",
    hi: "पाशुपतास्त्र",
    sa: "पाशुपतास्त्रम्",
    kn: "ಪಾಶುಪತಾಸ್ತ್ರ",
    ta: "பாசுபதாஸ்திரம்",
    ml: "പാശുപതാസ്ത്രം",
    or: "ପାଶୁపతాସ୍ତ୍ର",
  },
  "Hastinapura": {
    te: "హస్తినాపురం (Hastinapura)",
    hi: "हस्तिनापुर",
    sa: "हस्तिनापुरम्",
    kn: "ಹಸ್ತಿನಾಪುರ",
    ta: "ஹஸ்தினாபுரம்",
    ml: "ഹസ്തിനപുരം",
    or: "ହସ୍ତିନାପୁର",
  },
  "Indraprastha": {
    te: "ఇంద్రప్రస్థం (Indraprastha)",
    hi: "इंद्रप्रस्थ",
    sa: "इन्द्रप्रस्थम्",
    kn: "ಇಂದ್ರಪ್ರಸ್ಥ",
    ta: "இந்திரபிரஸ்தம்",
    ml: "ഇന്ദ്രപ്രസ്ഥം",
    or: "ଇନ୍ଦ୍ରପ୍ରସ୍ଥ",
  },
};

export function localizeEntityTitle(title: string, language: string): string {
  if (language === "en" || !title) return title;
  const match = ENTITY_TRANSLATIONS[title.trim()];
  if (match?.[language]) return match[language]!;
  if (["te", "kn", "ta", "ml", "or", "hi", "sa"].includes(language)) {
    try {
      const scheme = LANGUAGE_SCHEME[language] ?? "devanagari";
      if (/^[\u0900-\u097F\s]+$/u.test(title)) {
        return devanagariToReadingScript(title, language);
      }
      return Sanscript.t(title, "iast", scheme);
    } catch {
      return title;
    }
  }
  return title;
}

const HINDI_GLOSS_MAP: Record<string, string> = {
  "whence": "कहाँ से",
  "upon thee": "तुझमें / तुम्हें",
  "unto thee": "तुझसे / तुम्हें",
  "dejection": "विषाद / मोह",
  "this": "यह",
  "in perilous strait": "विषम परिस्थिति में",
  "in difficulty": "विपत्ति में",
  "comes": "प्राप्त हुआ",
  "unworthy": "अश्रेष्ठ (अनार्य योग्य)",
  "unaryanlike": "अनार्य जैसा",
  "heavenexcluding": "अस्वर्ग्य (स्वर्ग न देने वाला)",
  "disgraceful": "अकीर्तिकर (अपयशकारी)",
  "o arjuna": "हे अर्जुन",
  "arjuna": "अर्जुन",
  "said": "बोले",
  "spoke": "कहा / बोले",
  "spoke these words": "यह वचन बोले",
  "to him": "उनसे",
  "him": "उसको",
  "thus": "इस प्रकार",
  "overcome": "व्याप्त / आविष्ट",
  "pity": "करुणा / दया",
  "compassion": "दया / करुणा",
  "despondent": "शोकाकुल / दुःखी",
  "with eyes": "नेत्रों से",
  "filled with tears": "अश्रुपूरित / आँसुओं से भरे",
  "agitated": "व्याकुल",
  "destroyer of madhu": "मधुसूदन",
  "krishna": "श्रीकृष्ण",
  "lord": "श्री भगवान्",
  "fear": "भय",
  "grief": "शोक",
  "duty": "कर्तव्य / धर्म",
  "soul": "आत्मा",
  "self": "आत्मा",
  "body": "शरीर",
  "action": "कर्म",
  "actions": "कर्म",
  "work": "कर्म",
  "mind": "मन",
  "wisdom": "ज्ञान",
  "knowledge": "ज्ञान",
  "devotion": "भक्ति",
  "renunciation": "संन्यास / त्याग",
  "yoga": "योग",
  "yogi": "योगी",
  "peace": "शान्ति",
  "truth": "सत्य",
  "delusion": "मोह",
  "sin": "पाप",
  "virtue": "पुण्य",
  "free from": "रहित",
  "attainment": "प्राप्ति",
  "supreme": "परम",
  "highest": "सर्वोच्च",
  "unmanifest": "अव्यक्त",
  "manifest": "व्यक्त",
  "eternal": "नित्य / सनातन",
  "imperishable": "अविनाशी",
  "perishable": "नाशवान्",
  "born": "उत्पन्न",
  "death": "मृत्यु",
  "slain": "मारा गया",
  "slayer": "मारने वाला",
  "weapons": "शस्त्र",
  "fire": "अग्नि",
  "water": "जल",
  "wind": "वायु",
  "indestructible": "अविनाशी",
  "impenetrable": "अछेद्य",
  "unchangeable": "अविकारी",
  "immortal": "अमर",
  "intellect": "बुद्धि",
  "desire": "कामना / इच्छा",
  "anger": "क्रोध",
  "attachment": "आसक्ति",
  "fruit": "फल",
  "renouncing": "त्यागकर",
  "offering": "अर्पण",
  "sacrifice": "यज्ञ",
  "austerity": "तप",
  "charity": "दान",
  "faith": "श्रद्धा",
  "devotee": "भक्त",
  "friend": "मित्र",
  "teacher": "गुरु",
  "enemy": "शत्रु",
  "battle": "युद्ध",
  "field of battle": "रणभूमि",
  "victory": "विजय",
  "defeat": "पराजय",
  "pleasure": "सुख",
  "pain": "दुःख",
  "gain": "लाभ",
  "loss": "हानि",
};

export function translateEnglishGlossToHindi(gloss: string): string {
  const normalized = gloss.trim().toLowerCase().replace(/[(),.]/g, "");
  if (HINDI_GLOSS_MAP[normalized]) {
    return HINDI_GLOSS_MAP[normalized]!;
  }
  let translated = gloss;
  for (const [enKey, hiValue] of Object.entries(HINDI_GLOSS_MAP)) {
    const reg = new RegExp(`\\b${enKey}\\b`, "gi");
    if (reg.test(translated)) {
      translated = translated.replace(reg, hiValue);
    }
  }
  return translated;
}

/**
 * Convert Devanagari/IAST lemmas and translate glosses into the active reading language.
 */
export function localizePadachedaLemmas(
  text: string,
  language: string,
): string {
  const scheme = LANGUAGE_SCHEME[language];

  if (language === "hi") {
    return text
      .split(/[;|]+/)
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => {
        const emDash = chunk.match(/^(.+?)\s+([—–-])\s+(.+)$/u);
        if (emDash) {
          const word = emDash[1]!.trim();
          const gloss = emDash[3]!.trim();
          let devWord = word;
          try {
            if (/^[a-zA-Zāīūṛṝḷēōṁḥṅñṭḍṇśṣ\s]+$/u.test(word)) {
              devWord = Sanscript.t(word, "iast", "devanagari");
            }
          } catch {
            // keep word
          }
          return `${devWord} — ${translateEnglishGlossToHindi(gloss)}`;
        }
        return chunk;
      })
      .join("; ");
  }

  if (language === "sa") {
    return text
      .split(/[;|]+/)
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => {
        const emDash = chunk.match(/^(.+?)\s+([—–-])\s+(.+)$/u);
        if (emDash) {
          const word = emDash[1]!.trim();
          const gloss = emDash[3]!.trim();
          let devWord = word;
          try {
            if (/^[a-zA-Zāīūṛṝḷēōṁḥṅñṭḍṇśṣ\s]+$/u.test(word)) {
              devWord = Sanscript.t(word, "iast", "devanagari");
            }
          } catch {
            // keep word
          }
          return `${devWord} — ${gloss}`;
        }
        return chunk;
      })
      .join("; ");
  }

  if (!scheme || scheme === "iast") return text;

  return text
    .split(/[;|]+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const emDash = chunk.match(/^(.+?)\s+([—–-])\s+(.+)$/u);
      if (emDash) {
        const word = emDash[1]!.trim();
        const gloss = emDash[3]!.trim();
        try {
          let converted = word;
          if (/^[a-zA-Zāīūṛṝḷēōṁḥṅñṭḍṇśṣ\s]+$/u.test(word)) {
            converted = Sanscript.t(word, "iast", scheme);
          } else {
            converted = Sanscript.t(
              normalizeDevanagariForRescript(word),
              "devanagari",
              scheme,
            );
          }
          converted = stripForeignIndicMarks(converted);
          if (scheme === "telugu") {
            converted = normalizeTeluguShlokaOrthography(converted);
          }
          return `${converted} — ${gloss}`;
        } catch {
          return chunk;
        }
      }
      // Sivananda often uses "word gloss" without an em dash.
      const space = chunk.match(
        /^([\u0900-\u097F][\u0900-\u097F\s]*)\s+(.+)$/u,
      );
      if (space) {
        try {
          let converted = stripForeignIndicMarks(
            Sanscript.t(
              normalizeDevanagariForRescript(space[1]!.trim()),
              "devanagari",
              scheme,
            ),
          );
          if (scheme === "telugu") {
            converted = normalizeTeluguShlokaOrthography(converted);
          }
          return `${converted} — ${space[2]!.trim()}`;
        } catch {
          return chunk;
        }
      }
      return chunk;
    })
    .join("; ");
}

/**
 * Re-script an entire padacheda string from one Brahmic scheme to another
 * (used to adapt Telugu word-meanings into kn/ta/ml/or).
 */
export function rescriptPadacheda(
  text: string,
  fromScheme: string,
  toScheme: string,
): string {
  if (fromScheme === toScheme) return text;
  return text
    .split(/[;|]+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const emDash = chunk.match(/^(.+?)\s+([—–-])\s+(.+)$/u);
      if (!emDash) {
        try {
          let out = stripForeignIndicMarks(
            Sanscript.t(chunk, fromScheme, toScheme),
          );
          if (toScheme === "telugu") {
            out = normalizeTeluguShlokaOrthography(out);
          }
          return out;
        } catch {
          return chunk;
        }
      }
      try {
        let word = stripForeignIndicMarks(
          Sanscript.t(emDash[1]!.trim(), fromScheme, toScheme),
        );
        let gloss = emDash[3]!.trim();
        try {
          const rescriptedGloss = stripForeignIndicMarks(
            Sanscript.t(gloss, fromScheme, toScheme),
          );
          if (rescriptedGloss.replace(/[-—–\s;(),.]/g, "").length > 0) {
            gloss = rescriptedGloss;
          }
        } catch {
          // keep original gloss if rescripting fails
        }
        if (toScheme === "telugu") {
          word = normalizeTeluguShlokaOrthography(word);
        }
        return `${word} — ${gloss}`;
      } catch {
        return chunk;
      }
    })
    .join("; ");
}

export function readingLanguageScheme(language: string): string | null {
  return LANGUAGE_SCHEME[language] ?? null;
}

/**
 * Prepare Devanagari (usually Hindi) before Sanscript → kn/ta/ml.
 * Nukta consonants otherwise produce unreadable glyphs like Tamil "லட़".
 */
export function normalizeDevanagariForRescript(text: string): string {
  return repairIndicOrthography(
    text
      .replace(/\u093C/g, "") // nukta ़
      .replace(/\u0901/g, "\u0902") // candrabindu ँ → anusvara ं
      .replace(/\u0964/g, ".") // danda ।
      .replace(/\u0965/g, ".."), // double danda ॥
  );
}

/**
 * Remove leftover Devanagari / nukta after a Brahmic rescript.
 */
export function stripForeignIndicMarks(text: string): string {
  return text
    .replace(/\u093C/g, "")
    .replace(/[\u0900-\u097F]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Convert Devanagari Hindi (or Sanskrit) into a reading-language Brahmic script
 * without nukta / Devanagari leftovers that break Tamil/Kannada/Malayalam fonts.
 */
export function devanagariToReadingScript(
  text: string,
  language: string,
): string {
  const scheme = LANGUAGE_SCHEME[language];
  if (!scheme || scheme === "devanagari" || scheme === "iast") {
    return text;
  }
  try {
    const prepared = normalizeDevanagariForRescript(text);
    let out = stripForeignIndicMarks(
      Sanscript.t(prepared, "devanagari", scheme),
    );
    if (scheme === "telugu") {
      out = normalizeTeluguShlokaOrthography(out);
    }
    return out;
  } catch {
    return stripForeignIndicMarks(text);
  }
}

/**
 * Clean already-stored script-proxy rows (Sanscript artifacts in DB).
 */
export function normalizeScriptProxyText(text: string): string {
  return stripForeignIndicMarks(
    repairIndicOrthography(
      text.replace(/\u0964/g, ".").replace(/\u0965/g, ".."),
    ),
  );
}
