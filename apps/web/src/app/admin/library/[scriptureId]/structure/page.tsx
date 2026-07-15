import { ScriptureStructureClient } from "@/features/library/scripture-structure-client";

export const metadata = { title: "Structure" };

type Props = { params: Promise<{ scriptureId: string }> };

export default async function ScriptureStructurePage({ params }: Props) {
  const { scriptureId } = await params;
  return <ScriptureStructureClient scriptureId={scriptureId} />;
}
