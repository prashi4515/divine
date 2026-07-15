import { ScriptureOverviewClient } from "@/features/library/scripture-overview-client";

export const metadata = { title: "Overview" };

type Props = { params: Promise<{ scriptureId: string }> };

export default async function ScriptureOverviewPage({ params }: Props) {
  const { scriptureId } = await params;
  return <ScriptureOverviewClient scriptureId={scriptureId} />;
}
