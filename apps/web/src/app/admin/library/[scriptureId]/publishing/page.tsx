import { ScripturePublishingClient } from "@/features/library/scripture-publishing-client";

export const metadata = { title: "Publishing" };

type PageProps = {
  params: Promise<{ scriptureId: string }>;
};

export default async function ScripturePublishingPage({ params }: PageProps) {
  const { scriptureId } = await params;
  return <ScripturePublishingClient scriptureId={scriptureId} />;
}
