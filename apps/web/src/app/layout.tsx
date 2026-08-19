import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Fredoka } from "next/font/google";
import { Providers } from "@/components/providers";
import { JsonLd } from "@/components/json-ld";
import { SESSION_COOKIE } from "@/lib/auth/config";
import {
  parseReadingLanguageCookie,
  READING_LANGUAGE_COOKIE,
} from "@/lib/i18n/reading-language-cookie";
import { DEFAULT_READING_LANGUAGE } from "@/lib/reading/languages";
import { readerFontVariableClass } from "@/lib/reading/reader-font-vars";
import {
  organizationJsonLd,
  rootMetadata,
  rootViewport,
  websiteJsonLd,
} from "@/lib/seo";
import "@divine/ui/styles/tokens.css";
import "./globals.css";

/**
 * Site-wide UI face. Latin/Hebrew only — Indic glyphs fall through to the
 * reader script fonts registered beside it on <body>.
 */
const fredoka = Fredoka({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = rootMetadata();

export const viewport: Viewport = rootViewport();

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const hasSessionHint = cookieStore.has(SESSION_COOKIE);
  const initialLanguage =
    parseReadingLanguageCookie(
      cookieStore.get(READING_LANGUAGE_COOKIE)?.value,
    ) ?? DEFAULT_READING_LANGUAGE;
  const htmlLang = initialLanguage === "sa" ? "sa" : initialLanguage;

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1748131085265933"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${fredoka.variable} ${readerFontVariableClass} bg-background text-foreground min-h-svh font-sans antialiased`}
      >
        {/*
          One-time sync: older sessions only had localStorage. Promote to cookie
          and reload once so SSR already paints the chosen language (no English flash).
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var r=localStorage.getItem("divine.reading");if(!r)return;var lang=JSON.parse(r).state&&JSON.parse(r).state.preferredLanguage;if(!lang||lang==="en")return;var m=document.cookie.match(/(?:^|; )divine\\.reading-lang=([^;]*)/);var c=m?decodeURIComponent(m[1]):"";if(c===lang)return;document.cookie="divine.reading-lang="+encodeURIComponent(lang)+"; Path=/; Max-Age=31536000; SameSite=Lax";if(sessionStorage.getItem("divine.lang-synced")==="1")return;sessionStorage.setItem("divine.lang-synced","1");location.replace(location.href);}catch(e){}})();`,
          }}
        />
        <a
          href="#main-content"
          className="bg-foreground text-background focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2 focus:ring-2"
        >
          Skip to main content
        </a>
        <JsonLd data={[websiteJsonLd(), organizationJsonLd()]} />
        <Providers
          hasSessionHint={hasSessionHint}
          initialLanguage={initialLanguage}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
