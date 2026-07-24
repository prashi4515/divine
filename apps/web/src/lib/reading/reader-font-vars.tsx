import {
  Cormorant_Garamond,
  Noto_Serif_Devanagari,
  Noto_Serif_Gujarati,
  Noto_Serif_Kannada,
  Noto_Serif_Malayalam,
  Noto_Serif_Oriya,
  Noto_Serif_Tamil,
  Noto_Serif_Telugu,
} from "next/font/google";

/**
 * Reader fonts — weights kept to 400+700 so chapter pages don't download
 * four faces per script (was a major contributor to slow first paint).
 */
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--font-reader-en",
  display: "swap",
});

const notoDeva = Noto_Serif_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "700"],
  variable: "--font-reader-deva",
  display: "swap",
  preload: false,
});

const notoKn = Noto_Serif_Kannada({
  subsets: ["kannada", "latin"],
  weight: ["400", "700"],
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

const notoTa = Noto_Serif_Tamil({
  subsets: ["tamil", "latin"],
  weight: ["400", "700"],
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

/** Class string that defines all reader font CSS variables on a layout root. */
export const readerFontVariableClass = [
  cormorant.variable,
  notoDeva.variable,
  notoKn.variable,
  notoTe.variable,
  notoTa.variable,
  notoMl.variable,
  notoGu.variable,
  notoOr.variable,
].join(" ");
