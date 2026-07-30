/**
 * Repair broken Brahmic orthography where a virama (् / equivalent) is
 * incorrectly followed by a dependent vowel (matra). Browsers then show a
 * dotted circle ◌ with a floating matra — unreadable in every script.
 *
 * Corrupt:  निश्िचतं  (श + ् + ि + च)
 * Fixed:    निश्चितं  (श + ् + च + ि)
 *
 * Same class of OCR/import errors appears across Devanagari sources that feed
 * Telugu / Kannada / Tamil / Malayalam / Odia via Sanscript.
 */

type ScriptRepair = {
  virama: string;
  /** Dependent vowel signs (matras), excluding the virama code point. */
  isMatra: (ch: string) => boolean;
  isConsonant: (ch: string) => boolean;
  nukta?: string;
};

function rangeMatra(start: number, end: number, extra: number[] = []) {
  const extras = new Set(extra);
  return (ch: string) => {
    const cp = ch.codePointAt(0);
    if (cp === undefined) return false;
    if (extras.has(cp)) return true;
    return cp >= start && cp <= end;
  };
}

function rangeCons(start: number, end: number, extra: number[] = []) {
  const extras = new Set(extra);
  return (ch: string) => {
    const cp = ch.codePointAt(0);
    if (cp === undefined) return false;
    if (extras.has(cp)) return true;
    return cp >= start && cp <= end;
  };
}

/**
 * Unicode blocks covered: Devanagari, Bengali, Gujarati, Oriya, Tamil,
 * Telugu, Kannada, Malayalam.
 */
const SCRIPT_REPAIRS: readonly ScriptRepair[] = [
  {
    virama: "\u094d",
    // Devanagari matras ा-ौ etc.; exclude virama U+094D
    isMatra: (ch) => {
      const cp = ch.codePointAt(0) ?? 0;
      return (
        (cp >= 0x093a && cp <= 0x094c && cp !== 0x094d) ||
        cp === 0x094e ||
        cp === 0x094f ||
        (cp >= 0x0955 && cp <= 0x0957)
      );
    },
    isConsonant: rangeCons(0x0915, 0x0939, [
      0x0958, 0x0959, 0x095a, 0x095b, 0x095c, 0x095d, 0x095e, 0x095f,
    ]),
    nukta: "\u093c",
  },
  {
    virama: "\u09cd",
    isMatra: rangeMatra(0x09be, 0x09cc),
    isConsonant: rangeCons(0x0995, 0x09b9),
    nukta: "\u09bc",
  },
  {
    virama: "\u0acd",
    isMatra: rangeMatra(0x0abe, 0x0acc),
    isConsonant: rangeCons(0x0a95, 0x0ab9),
    nukta: "\u0abc",
  },
  {
    virama: "\u0b4d",
    isMatra: rangeMatra(0x0b3e, 0x0b4c),
    isConsonant: rangeCons(0x0b15, 0x0b39),
    nukta: "\u0b3c",
  },
  {
    virama: "\u0bcd",
    isMatra: rangeMatra(0x0bbe, 0x0bcc),
    isConsonant: rangeCons(0x0b95, 0x0bb9),
  },
  {
    virama: "\u0c4d",
    isMatra: rangeMatra(0x0c3e, 0x0c4c),
    isConsonant: rangeCons(0x0c15, 0x0c39),
  },
  {
    virama: "\u0ccd",
    isMatra: rangeMatra(0x0cbe, 0x0ccc),
    isConsonant: rangeCons(0x0c95, 0x0cb9),
    nukta: "\u0cbc",
  },
  {
    virama: "\u0d4d",
    isMatra: rangeMatra(0x0d3e, 0x0d4c),
    isConsonant: rangeCons(0x0d15, 0x0d39),
  },
];

function repairOneScript(text: string, script: ScriptRepair): string {
  if (!text.includes(script.virama)) return text;

  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (
      ch === script.virama &&
      i + 1 < text.length &&
      script.isMatra(text[i + 1]!)
    ) {
      const matra = text[i + 1]!;
      let j = i + 2;
      while (
        j < text.length &&
        (text[j] === "\u200c" || text[j] === "\u200d")
      ) {
        j++;
      }
      if (j < text.length && script.isConsonant(text[j]!)) {
        let cluster = text[j]!;
        j++;
        if (script.nukta && j < text.length && text[j] === script.nukta) {
          cluster += text[j]!;
          j++;
        }
        out += script.virama + cluster + matra;
        i = j - 1;
        continue;
      }
      // No following consonant — attach matra to the previous akshara.
      out += matra;
      i += 1;
      continue;
    }
    out += ch;
  }
  return out;
}

/**
 * Fix virama+matra reversals in any supported Indic script.
 * Idempotent — safe to run on already-correct text.
 */
export function repairIndicOrthography(text: string): string {
  if (!text) return text;
  let out = text;
  for (const script of SCRIPT_REPAIRS) {
    out = repairOneScript(out, script);
  }
  return out;
}
