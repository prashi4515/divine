import { ScriptureDetailShell } from "@/features/library/scripture-detail-shell";

type ScriptureDetailLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ scriptureId: string }>;
};

export default async function ScriptureDetailLayout({
  children,
  params,
}: ScriptureDetailLayoutProps) {
  const { scriptureId } = await params;
  return <ScriptureDetailShell scriptureId={scriptureId}>{children}</ScriptureDetailShell>;
}
