import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Inter, Instrument_Serif } from "next/font/google";
import { Providers } from "@/components/providers";
import { SESSION_COOKIE } from "@/lib/auth/config";
import "@divine/ui/styles/tokens.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bhagavad Gita — The Song of God",
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
        className={`${inter.variable} ${instrumentSerif.variable} bg-background text-foreground min-h-svh font-sans antialiased`}
      >
        <Providers hasSessionHint={hasSessionHint}>{children}</Providers>
      </body>
    </html>
  );
}
