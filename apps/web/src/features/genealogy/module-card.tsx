import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { GenealogyModule } from "@/lib/genealogy/types";
import { cn } from "@/lib/utils";

/**
 * Premium module card used on the /genealogy landing.
 * Server component — no interactivity, purely presentational.
 */
export function ModuleCard({
  module: mod,
  index,
}: {
  module: GenealogyModule;
  index: number;
}) {
  const isAvailable = mod.status === "available";
  const accent = mod.color?.accent ?? "#8b6d2c";
  const tint = mod.color?.tint ?? "#f8ecc9";
  const personCount = mod.personIds.length;

  const className = cn(
    "group border-border/70 bg-card relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 shadow-xs sm:p-7",
    "transition-divine",
    isAvailable
      ? "hover:border-saffron/40 focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none hover:-translate-y-1 hover:shadow-md"
      : "opacity-70",
  );

  const body = (
    <>
      <span
        className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 opacity-0 transition-divine group-hover:scale-x-100 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 transition-divine group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle, ${tint}, transparent 70%)`,
        }}
        aria-hidden
      />

      <div className="flex items-start justify-between gap-4">
        <span
          className={cn(
            "text-saffron text-[10px] font-medium uppercase tracking-[0.18em]",
          )}
        >
          {mod.eyebrow ?? "Module"}
        </span>
        {isAvailable ? (
          <ArrowUpRight
            className="text-muted-foreground group-hover:text-foreground h-4 w-4 shrink-0 transition-divine"
            aria-hidden
          />
        ) : (
          <span className="text-muted-foreground bg-muted rounded-full px-2 py-0.5 text-[10px] tracking-wide">
            Coming soon
          </span>
        )}
      </div>

      <h2 className="text-foreground mt-3 font-serif text-xl leading-tight tracking-tight sm:text-[1.35rem]">
        {mod.title}
      </h2>
      {mod.sanskritTitle && (
        <p className="indic-display text-muted-foreground mt-0.5 font-serif text-sm">
          {mod.sanskritTitle}
        </p>
      )}

      <p className="text-muted-foreground mt-3 flex-1 text-sm leading-relaxed">
        {mod.summary}
      </p>

      <div className="border-border/60 mt-5 flex items-center justify-between border-t pt-4">
        <span className="text-muted-foreground/90 inline-flex items-center gap-1.5 text-xs">
          <Sparkles className="h-3 w-3" aria-hidden />
          {personCount === 0
            ? "In preparation"
            : `${personCount} figures`}
        </span>
        {isAvailable ? (
          <span className="text-foreground text-xs font-medium underline-offset-4 group-hover:underline">
            Explore
          </span>
        ) : (
          <span className="text-muted-foreground/80 text-xs">In preparation</span>
        )}
      </div>
    </>
  );

  if (isAvailable) {
    return (
      <Link
        href={`/genealogy/${mod.slug}`}
        style={{ ["--card-index" as string]: index }}
        className={className}
      >
        {body}
      </Link>
    );
  }

  return (
    <div
      role="group"
      aria-disabled
      style={{ ["--card-index" as string]: index }}
      className={className}
    >
      {body}
    </div>
  );
}
