"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  GitBranch,
  Library,
  MapPin,
  X,
} from "lucide-react";
import type { AtlasPlace } from "@/lib/atlas/geo";
import {
  atlasCategoryFor,
  atlasHref,
} from "@/lib/atlas/geo";
import { entityHref } from "@/lib/knowledge/search";
import { formatCitation } from "@/lib/knowledge/types";
import { atlasFilterLabel } from "@/lib/atlas/i18n-labels";
import { displayLocalizedName } from "@/lib/i18n/localize-entity";
import { useMessages } from "@/lib/i18n/use-messages";
import { useReadingStore } from "@/lib/stores/reading-store";

type Related = Array<{
  id: string;
  name: string;
  kind: string;
  href: string;
}>;

/**
 * Premium place side panel — overview, modern context, relationships.
 */
export function AtlasPlacePanel({
  place,
  related,
  onClose,
}: {
  place: AtlasPlace;
  related: Related;
  onClose: () => void;
}) {
  const t = useMessages();
  const lang = useReadingStore((s) => s.preferredLanguage);
  const cat = atlasCategoryFor(place);
  const localizedName = displayLocalizedName(place, lang);

  return (
    <aside
      data-atlas-ui
      className="atlas-panel border-border bg-background fixed inset-y-0 right-0 z-40 flex h-full w-full max-w-md flex-col border-l shadow-xl md:static md:z-auto md:max-w-none md:w-[360px] md:shadow-sm"
    >
      {/* Hero */}
      <div
        className="relative h-36 shrink-0 overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 80% 80% at 30% 20%, hsl(32 55% 55% / 0.45), transparent 55%),
            radial-gradient(ellipse 60% 70% at 90% 80%, hsl(25 40% 40% / 0.35), transparent 50%),
            linear-gradient(160deg, #c4a060, #8a5a2b)
          `,
        }}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><circle cx=%222%22 cy=%222%22 r=%221%22 fill=%22%23ffffff%22 opacity=%220.08%22/></svg>')] opacity-60" />
        <button
          type="button"
          aria-label="Close panel"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="absolute bottom-4 left-5 right-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/80">
            {atlasFilterLabel(t, cat)}
          </p>
          <h2 className="mt-1 font-serif text-2xl tracking-tight text-white drop-shadow">
            {localizedName}
          </h2>
          {place.englishName !== localizedName && (
            <p className="text-sm text-white/75">{place.englishName}</p>
          )}
        </div>
      </div>

      <div className="text-foreground flex-1 space-y-5 overflow-y-auto px-5 py-5 text-sm">
        <section>
          <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.16em]">
            History
          </p>
          <p className="mt-2 leading-relaxed">{place.summary}</p>
          {place.atlas.scripturalSignificance && (
            <p className="text-muted-foreground mt-3 text-[13px] leading-relaxed">
              {place.atlas.scripturalSignificance}
            </p>
          )}
        </section>

        {place.atlas.kingdom && (
          <section>
            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.16em]">
              Kingdom
            </p>
            <p className="mt-1.5 font-medium">{place.atlas.kingdom}</p>
          </section>
        )}

        <section className="border-border bg-muted/40 rounded-xl border p-4">
          <p className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em]">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            Modern equivalent
          </p>
          <p className="mt-2 font-medium">{place.atlas.modernLocation}</p>
          <p className="text-muted-foreground mt-2 text-[11px]">
            {place.atlas.latitude.toFixed(2)}°N,{" "}
            {place.atlas.longitude.toFixed(2)}°E
          </p>
          <p className="text-muted-foreground mt-2 text-[10px] font-medium uppercase tracking-[0.14em]">
            Certainty:{" "}
            {place.atlas.certainty === "verified"
              ? "Verified"
              : place.atlas.certainty === "approximate"
                ? "Approximate"
                : "Traditional"}
          </p>
        </section>

        {related.length > 0 && (
          <section>
            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.16em]">
              Related characters
            </p>
            <ul className="mt-2 space-y-1.5">
              {related.slice(0, 10).map((r) => (
                <li key={r.id}>
                  <Link
                    href={r.href}
                    className="text-foreground underline-offset-2 hover:underline"
                  >
                    {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {place.categories.includes("battlefield") && (
          <section>
            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.16em]">
              Related chapters
            </p>
            <Link
              href="/bhagavad-gita/chapter-1"
              className="mt-2 inline-flex items-center gap-1.5 underline-offset-2 hover:underline"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Chapter 1 — Arjuna Viṣāda Yoga
            </Link>
          </section>
        )}

        {place.scriptureSources.length > 0 && (
          <section>
            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.16em]">
              Sources
            </p>
            <ul className="text-muted-foreground mt-1.5 space-y-0.5 text-xs">
              {place.scriptureSources.map((s, i) => (
                <li key={i}>{formatCitation(s)}</li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.16em]">
            Atlas links
          </p>
          <div className="mt-2 flex flex-col gap-2">
            <Link
              href={atlasHref(place)}
              className="text-foreground inline-flex items-center gap-1.5 text-sm underline-offset-2 hover:underline"
            >
              Place page <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/genealogy"
              className="text-foreground inline-flex items-center gap-1.5 text-sm underline-offset-2 hover:underline"
            >
              <GitBranch className="h-3.5 w-3.5" /> Genealogy
            </Link>
          </div>
        </section>
      </div>

      <div className="border-border space-y-2 border-t p-4">
        <Link
          href={atlasHref(place)}
          className="bg-foreground text-background flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium"
        >
          Open place page
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        <Link
          href={entityHref(place)}
          className="border-border text-foreground inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border text-xs font-medium"
        >
          <Library className="h-4 w-4" />
          Encyclopedia
        </Link>
      </div>
    </aside>
  );
}
