"use client";

import { useMessages } from "@/lib/i18n/use-messages";

/** Live-translated caption under the atlas explorer. */
export function AtlasArchitectureNote() {
  const t = useMessages();
  return (
    <p className="text-muted-foreground mt-4 text-center text-xs leading-relaxed">
      {t.atlasArchitectureNote}
    </p>
  );
}
