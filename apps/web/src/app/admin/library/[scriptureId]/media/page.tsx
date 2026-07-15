import { ScriptureMediaClient } from "@/features/library/scripture-media-client";

export const metadata = { title: "Media" };

type Props = { params: Promise<{ scriptureId: string }> };

export default async function ScriptureMediaPage({ params }: Props) {
  const { scriptureId } = await params;
  return <ScriptureMediaClient scriptureId={scriptureId} />;
}
