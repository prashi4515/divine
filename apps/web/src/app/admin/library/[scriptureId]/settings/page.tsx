import { ScriptureSettingsClient } from "@/features/library/scripture-settings-client";

export const metadata = { title: "Scripture settings" };

type Props = { params: Promise<{ scriptureId: string }> };

export default async function ScriptureSettingsPage({ params }: Props) {
  const { scriptureId } = await params;
  return <ScriptureSettingsClient scriptureId={scriptureId} mode="settings" />;
}
