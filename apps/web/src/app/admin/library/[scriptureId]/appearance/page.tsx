import { ScriptureSettingsClient } from "@/features/library/scripture-settings-client";

export const metadata = { title: "Appearance" };

type Props = { params: Promise<{ scriptureId: string }> };

export default async function ScriptureAppearancePage({ params }: Props) {
  const { scriptureId } = await params;
  return <ScriptureSettingsClient scriptureId={scriptureId} mode="appearance" />;
}
