import { UiLanguageProvider } from "@/lib/i18n/ui-language-context";
import { isSupportedLocale } from "@/lib/i18n/locales";
import { notFound } from "next/navigation";
import type { ReadingLanguageCode } from "@/lib/reading/languages";

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export default async function LocalizedLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) {
    notFound();
  }

  return (
    <UiLanguageProvider initialLanguage={lang as ReadingLanguageCode}>
      {children}
    </UiLanguageProvider>
  );
}
