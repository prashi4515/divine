import { ScriptureContentClient } from "@/features/library/scripture-content-client";

export const metadata = { title: "Content" };

type PageProps = {
  params: Promise<{ scriptureId: string }>;
};

export default async function ScriptureContentPage({ params }: PageProps) {
  const { scriptureId } = await params;
  return <ScriptureContentClient scriptureId={scriptureId} />;
}
