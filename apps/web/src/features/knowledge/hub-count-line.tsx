"use client";

import { useHubUiMessages } from "@/lib/i18n/use-messages";
import type { ReadingLanguageCode } from "@/lib/reading/languages";

type CountKind = "kingdoms" | "concepts";

export function HubCountLine({
  count,
  kind,
  initialLanguage,
}: {
  count: number;
  kind: CountKind;
  initialLanguage?: ReadingLanguageCode;
}) {
  const t = useHubUiMessages(initialLanguage);
  const label =
    kind === "kingdoms" ? t.kingdomsCount(count) : t.conceptsCount(count);
  return <p className="text-muted-foreground mb-6 text-sm">{label}</p>;
}
