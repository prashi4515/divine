import { ScriptureTranslationsClient } from "@/features/library/scripture-translations-client";

export const metadata = { title: "Translations" };

type PageProps = {
  params: Promise<{ scriptureId: string }>;
};

export default async function ScriptureTranslationsPage({ params }: PageProps) {
  const { scriptureId } = await params;
  return <ScriptureTranslationsClient scriptureId={scriptureId} />;
}
