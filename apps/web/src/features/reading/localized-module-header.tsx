"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { GenealogyHeader } from "@/features/genealogy/genealogy-header";
import { useMessages } from "@/lib/i18n/use-messages";
import type { Messages } from "@/lib/i18n/messages";

export type KnowledgeModuleId =
  | "atlas"
  | "events"
  | "kingdoms"
  | "weapons"
  | "concepts"
  | "timeline"
  | "encyclopedia"
  | "genealogy";

type MessageKey = keyof Messages;

function moduleCopy(
  id: KnowledgeModuleId,
  t: Messages,
): { title: string; description: string } {
  switch (id) {
    case "atlas":
      return { title: t.atlasTitle, description: t.atlasDescription };
    case "events":
      return { title: t.eventsTitle, description: t.eventsDescription };
    case "kingdoms":
      return { title: t.kingdomsTitle, description: t.kingdomsDescription };
    case "weapons":
      return { title: t.weaponsTitle, description: t.weaponsDescription };
    case "concepts":
      return { title: t.conceptsTitle, description: t.conceptsDescription };
    case "timeline":
      return { title: t.timelineTitle, description: t.timelineDescription };
    case "encyclopedia":
      return {
        title: t.encyclopediaTitle,
        description: t.encyclopediaDescription,
      };
    case "genealogy":
      return { title: t.genealogyTitle, description: t.genealogyDescription };
  }
}

function resolveLabel(t: Messages, key: MessageKey): string {
  const value = t[key];
  return typeof value === "string" ? value : String(key);
}

/**
 * Client module hero — titles/descriptions/actions update live with language.
 */
export function LocalizedModuleHeader({
  module,
  actionLinks,
  actions,
}: {
  module: KnowledgeModuleId;
  actionLinks?: Array<{ href: string; labelKey: MessageKey }>;
  actions?: ReactNode;
}) {
  const t = useMessages();
  const copy = moduleCopy(module, t);

  const resolvedActions =
    actions ??
    (actionLinks ? (
      <>
        {actionLinks.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="border-border bg-background/80 hover:border-saffron/40 inline-flex rounded-full border px-3.5 py-1.5 text-xs transition-divine"
            prefetch
          >
            {resolveLabel(t, a.labelKey)}
          </Link>
        ))}
      </>
    ) : undefined);

  return (
    <GenealogyHeader
      eyebrow={t.signatureExperience}
      title={copy.title}
      description={copy.description}
      breadcrumbs={[
        { href: "/", label: t.home },
        { label: copy.title },
      ]}
      actions={resolvedActions}
    />
  );
}
