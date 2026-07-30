import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Fredoka } from "next/font/google";
import { Providers } from "@/components/providers";
import { SESSION_COOKIE } from "@/lib/auth/config";
import { readerFontVariableClass } from "@/lib/reading/reader-font-vars";
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
});

export const metadata: Metadata = {
  title: {
    default: "Bhagavad Gita - The Song of God",
    template: "%s · Bhagavad Gita",
  },
  description:
    "A production-grade multilingual Bhagavad Gita platform. Read, reflect, and journey through the timeless verses in your language.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const hasSessionHint = cookieStore.has(SESSION_COOKIE);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fredoka.variable} ${readerFontVariableClass} bg-background text-foreground min-h-svh font-sans antialiased`}
      >
        <Providers hasSessionHint={hasSessionHint}>{children}</Providers>
      </body>
    </html>
  );
}
