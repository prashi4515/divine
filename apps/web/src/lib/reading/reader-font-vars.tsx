import {
  Noto_Serif_Gujarati,
  Noto_Serif_Malayalam,
  Noto_Serif_Oriya,
  Noto_Serif_Telugu,
  Tiro_Devanagari_Sanskrit,
  Tiro_Kannada,
  Tiro_Tamil,
} from "next/font/google";

/**
 * Indic scripture faces — paired with Fredoka (--font-sans) on the document
 * root. Latin UI uses Fredoka; these cover Telugu / Devanagari / etc.
 *
 * Telugu uses Noto Serif Telugu (holy-bhagavad-gita–like readability) rather
 * than a heavy display face that warps conjuncts like సంజయ.
 */
const tiroDeva = Tiro_Devanagari_Sanskrit({
  subsets: ["devanagari", "latin"],
  weight: "400",
  variable: "--font-reader-deva",
  display: "swap",
  preload: false,
});

const tiroKn = Tiro_Kannada({
  subsets: ["kannada", "latin"],
  weight: "400",
  variable: "--font-reader-kn",
  display: "swap",
  preload: false,
});

const notoTe = Noto_Serif_Telugu({
  subsets: ["telugu", "latin"],
  weight: ["400", "700"],
  variable: "--font-reader-te",
  display: "swap",
  preload: false,
});

const tiroTa = Tiro_Tamil({
  subsets: ["tamil", "latin"],
  weight: "400",
  variable: "--font-reader-ta",
  display: "swap",
  preload: false,
});

const notoMl = Noto_Serif_Malayalam({
  subsets: ["malayalam", "latin"],
  weight: ["400", "700"],
  variable: "--font-reader-ml",
  display: "swap",
  preload: false,
});

const notoGu = Noto_Serif_Gujarati({
  subsets: ["gujarati", "latin"],
  weight: ["400", "700"],
  variable: "--font-reader-gu",
  display: "swap",
  preload: false,
});

const notoOr = Noto_Serif_Oriya({
  subsets: ["oriya", "latin"],
  weight: ["400", "700"],
  variable: "--font-reader-or",
  display: "swap",
  preload: false,
});

/** Class string that defines Indic reader font CSS variables on a layout root. */
export const readerFontVariableClass = [
  tiroDeva.variable,
  tiroKn.variable,
  notoTe.variable,
  tiroTa.variable,
  notoMl.variable,
  notoGu.variable,
  notoOr.variable,
].join(" ");
