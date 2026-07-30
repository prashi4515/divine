import Link from "next/link";
import type { KnowledgeEntity } from "@/lib/knowledge/types";
import { ENTITY_KIND_LABELS, ENTITY_KIND_TOKENS } from "@/lib/knowledge/types";
import { entityHref } from "@/lib/knowledge/search";
import {
  displayEnglishName,
  toModernEnglish,
} from "@/lib/text/modern-english";
import { cn } from "@/lib/utils";

export function EntityCard({
  entity,
  index = 0,
}: {
  entity: KnowledgeEntity;
  index?: number;
}) {
  const tokens = ENTITY_KIND_TOKENS[entity.kind];
  const title = displayEnglishName(entity);
  return (
    <Link
      href={entityHref(entity)}
      style={{ ["--card-index" as string]: index }}
      className={cn(
        "group border-border/70 bg-card relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 shadow-xs",
        "hover:border-saffron/40 transition-divine hover:-translate-y-0.5 hover:shadow-md",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
      )}
    >
      <span
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ background: tokens.accent }}
        aria-hidden
      />
      <p
        className="text-[10px] font-medium uppercase tracking-[0.16em]"
        style={{ color: tokens.accent }}
      >
        {ENTITY_KIND_LABELS[entity.kind]}
      </p>
      <h3 className="text-foreground mt-2 font-serif text-lg leading-tight tracking-tight">
        {title}
      </h3>
      <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">
        {toModernEnglish(entity.summary)}
      </p>
    </Link>
  );
}
