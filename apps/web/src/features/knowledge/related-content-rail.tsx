import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ResolvedRelatedContent } from "@/lib/knowledge/related-content";
import { cn } from "@/lib/utils";

/**
 * Automatic Related Content rail — every bucket from the graph engine.
 * No hard-coded recommendations; empty buckets are omitted.
 */
export function RelatedContentRail({
  related,
  className,
  title = "Keep exploring",
  description = "Recommendations from the Knowledge Graph - ranked by relationship strength, confidence, and proximity.",
}: {
  related: ResolvedRelatedContent;
  className?: string;
  title?: string;
  description?: string;
}) {
  if (related.buckets.length === 0) return null;

  return (
    <section
      aria-labelledby="related-content-engine"
      className={cn(
        "border-border/60 space-y-8 border-t pt-10",
        className,
      )}
    >
      <div>
        <h2
          id="related-content-engine"
          className="text-saffron text-[10px] font-medium uppercase tracking-[0.18em]"
        >
          {title}
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
          {description}
        </p>
      </div>

      <div className="space-y-8">
        {related.buckets.map((group) => (
          <div key={group.bucket}>
            <h3 className="text-foreground mb-3 text-sm font-medium tracking-tight">
              {group.label}
            </h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {group.items.map((item) => (
                <li key={`${group.bucket}-${item.hit.entityId}`}>
                  <Link
                    href={item.link.href}
                    className="border-border/70 bg-card hover:border-saffron/40 group flex items-start justify-between gap-2 rounded-xl border px-3.5 py-3 transition-divine"
                  >
                    <span className="min-w-0">
                      <span className="text-foreground block text-sm font-medium group-hover:underline">
                        {item.link.label}
                      </span>
                      {item.relationLabel ? (
                        <span className="text-muted-foreground mt-0.5 block text-[11px] capitalize">
                          {item.relationLabel}
                          {item.hit.depth > 1
                            ? ` · ${item.hit.depth} hops`
                            : ""}
                        </span>
                      ) : item.hit.depth > 1 ? (
                        <span className="text-muted-foreground mt-0.5 block text-[11px]">
                          {item.hit.depth} hops
                        </span>
                      ) : null}
                    </span>
                    <ArrowUpRight
                      className="text-muted-foreground mt-1 h-3.5 w-3.5 shrink-0"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
