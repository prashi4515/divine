"use client";

import Link from "next/link";
import { ChevronRight, GitBranch } from "lucide-react";
import { useMessages, useUiLanguage } from "@/lib/i18n/use-messages";
import { devanagariToReadingScript } from "@/lib/reading/shloka-script";
import { cn } from "@/lib/utils";

export type Breadcrumb = { href?: string; label: string };

/**
 * Header strip used by entity detail pages.
 * Renders page title + breadcrumbs + eyebrow, fully responsive to language switching.
 */
export function GenealogyHeader({
  eyebrow,
  title,
  sanskritTitle,
  description,
  breadcrumbs,
  actions,
}: {
  eyebrow?: string;
  title: string;
  sanskritTitle?: string;
  description?: string;
  breadcrumbs: Breadcrumb[];
  actions?: React.ReactNode;
}) {
  const t = useMessages();
  const lang = useUiLanguage();

  const translateCrumbLabel = (label: string): string => {
    const norm = label.trim().toLowerCase();
    if (norm === "home") return t.home;
    if (norm === "events" || norm === "event") return t.navEvents;
    if (norm === "kingdoms" || norm === "kingdom") return t.navKingdoms;
    if (norm === "weapons" || norm === "weapon") return t.navWeapons;
    if (norm === "encyclopedia") return t.navEncyclopedia;
    if (norm === "genealogy") return t.navGenealogy;
    if (norm === "atlas") return t.navAtlas;
    if (norm === "search") return t.search;
    if (["te", "kn", "ta", "ml", "or"].includes(lang) && sanskritTitle) {
      return devanagariToReadingScript(sanskritTitle, lang);
    }
    return label;
  };

  const translateEyebrow = (eb?: string): string | undefined => {
    if (!eb) return undefined;
    const norm = eb.trim().toLowerCase();
    if (norm === "event" || norm === "events") return t.navEvents;
    if (norm === "kingdom" || norm === "kingdoms") return t.navKingdoms;
    if (norm === "weapon" || norm === "weapons") return t.navWeapons;
    if (norm === "concept" || norm === "encyclopedia") return t.navEncyclopedia;
    if (norm === "genealogy" || norm === "lineage") return t.navGenealogy;
    return eb;
  };

  const displayTitle =
    ["te", "kn", "ta", "ml", "or"].includes(lang) && sanskritTitle
      ? devanagariToReadingScript(sanskritTitle, lang)
      : title;

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 60% 90% at 10% 0%, hsl(var(--saffron) / 0.10), transparent 55%),
            radial-gradient(ellipse 50% 60% at 95% 100%, hsl(var(--gold) / 0.08), transparent 50%),
            hsl(var(--muted) / 0.30)
          `,
        }}
      />
      <div className="page-gutter w-full py-8 md:py-12">
        <nav aria-label="Breadcrumb" className="mb-4 md:mb-5">
          <ol
            className={cn(
              "text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px]",
            )}
          >
            {breadcrumbs.map((crumb, i) => {
              const last = i === breadcrumbs.length - 1;
              const label = translateCrumbLabel(crumb.label);
              return (
                <li
                  key={`${crumb.href ?? crumb.label}-${i}`}
                  className="flex items-center gap-1.5"
                >
                  {crumb.href && !last ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-foreground transition-divine underline-offset-4 hover:underline"
                    >
                      {label}
                    </Link>
                  ) : (
                    <span
                      className={cn(last && "text-foreground font-medium")}
                      aria-current={last ? "page" : undefined}
                    >
                      {label}
                    </span>
                  )}
                  {!last && (
                    <ChevronRight
                      className="text-muted-foreground/70 h-3.5 w-3.5"
                      aria-hidden
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            {eyebrow && (
              <p className="text-saffron mb-2 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em]">
                <GitBranch className="h-3.5 w-3.5" aria-hidden />
                {translateEyebrow(eyebrow)}
              </p>
            )}
            <h1 className="text-foreground font-serif text-3xl leading-tight tracking-tight sm:text-4xl md:text-[2.75rem]">
              {displayTitle}
            </h1>
            {sanskritTitle && (
              <p className="indic-display text-muted-foreground mt-2 font-serif text-lg sm:text-xl">
                {lang === "sa" || lang === "hi"
                  ? sanskritTitle
                  : devanagariToReadingScript(sanskritTitle, lang)}
              </p>
            )}
            {description && (
              <p className="text-muted-foreground mt-4 max-w-2xl text-sm leading-relaxed sm:text-base">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
