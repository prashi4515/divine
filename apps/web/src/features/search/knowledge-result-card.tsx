"use client";

import Link from "next/link";
import type { KnowledgeSearchHit } from "@divine/types";
import { HighlightText } from "./highlight-text";

type KnowledgeResultCardProps = {
  hit: KnowledgeSearchHit;
  query: string;
};

const SURFACE_LABEL: Record<string, string> = {
  encyclopedia: "Encyclopedia",
  atlas: "Atlas",
  events: "Events",
  genealogy: "Genealogy",
  timeline: "Timeline",
  gita: "Gita",
};

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function KnowledgeResultCard({ hit, query }: KnowledgeResultCardProps) {
  const subtitle =
    hit.englishTitle &&
    hit.englishTitle.toLowerCase() !== hit.title.toLowerCase()
      ? hit.englishTitle
      : hit.iast ?? null;

  return (
    <article className="border-border/50 group border-b py-4 last:border-b-0">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <Link
          href={hit.href}
          prefetch
          className="font-serif text-lg tracking-tight underline-offset-4 hover:underline"
        >
          <HighlightText text={hit.title} terms={[query]} />
        </Link>
        <span className="text-muted-foreground text-[11px] uppercase tracking-wider">
          {hit.kind.replace(/-/g, " ")}
        </span>
      </div>

      {subtitle ? (
        <p className="text-muted-foreground mt-0.5 text-sm">
          <HighlightText text={subtitle} terms={[query]} />
        </p>
      ) : null}

      {hit.sanskrit && hit.group === "verses" ? (
        <p
          lang="sa"
          className="text-muted-foreground mt-2 font-serif text-[0.95rem] leading-relaxed"
        >
          {clip(hit.sanskrit, 100)}
        </p>
      ) : null}

      {hit.summary ? (
        <p className="text-foreground/85 mt-2 text-sm leading-relaxed">
          <HighlightText text={clip(hit.summary, 220)} terms={[query]} />
        </p>
      ) : null}

      {hit.aliases.length > 0 ? (
        <p className="text-muted-foreground mt-2 text-[11px]">
          Also known as{" "}
          {hit.aliases.slice(0, 4).map((a, i) => (
            <span key={a}>
              {i > 0 ? ", " : ""}
              <HighlightText text={a} terms={[query]} />
            </span>
          ))}
        </p>
      ) : null}

      {hit.surfaces.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {hit.surfaces.slice(0, 4).map((s) => (
            <span
              key={s}
              className="bg-muted/60 text-muted-foreground rounded-md px-2 py-0.5 text-[10px] tracking-wide"
            >
              {SURFACE_LABEL[s] ?? s}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
