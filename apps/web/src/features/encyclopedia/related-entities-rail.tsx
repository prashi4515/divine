import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { KnowledgeEntity } from "@/lib/knowledge/types";
import { ENTITY_KIND_LABELS } from "@/lib/knowledge/types";
import { entityHref } from "@/lib/knowledge/search";
import { displayEnglishName } from "@/lib/text/modern-english";

/**
 * Chapter-level encyclopedia cross-links for Gita readers.
 */
export function RelatedEntitiesRail({
  entities,
  chapterNumber,
}: {
  entities: KnowledgeEntity[];
  chapterNumber: number;
}) {
  if (entities.length === 0) return null;

  return (
    <section
      className="mx-auto mt-14 max-w-3xl border-t border-border/60 pt-10"
      aria-labelledby="related-entities"
    >
      <h2
        id="related-entities"
        className="text-saffron text-[10px] font-medium uppercase tracking-[0.18em]"
      >
        Encyclopedia · Chapter {chapterNumber}
      </h2>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        Persons, places and concepts linked to verses in this chapter.
      </p>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {entities.slice(0, 12).map((entity) => (
          <li key={entity.id}>
            <Link
              href={entityHref(entity)}
              className="border-border/70 bg-card hover:border-saffron/40 group flex items-start justify-between gap-2 rounded-xl border px-3.5 py-3 transition-divine"
            >
              <span className="min-w-0">
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                  {ENTITY_KIND_LABELS[entity.kind]}
                </span>
                <span className="text-foreground mt-0.5 block text-sm font-medium group-hover:underline">
                  {displayEnglishName(entity)}
                </span>
              </span>
              <ArrowUpRight
                className="text-muted-foreground mt-1 h-3.5 w-3.5 shrink-0"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-4">
        <Link
          href="/encyclopedia"
          className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
        >
          Browse the full encyclopedia
        </Link>
      </p>
    </section>
  );
}
