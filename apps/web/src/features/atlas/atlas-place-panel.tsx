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
  ATLAS_FILTER_LABELS,
  atlasCategoryFor,
  atlasHref,
} from "@/lib/atlas/geo";
import { entityHref } from "@/lib/knowledge/search";
import { formatCitation } from "@/lib/knowledge/types";

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
  const cat = atlasCategoryFor(place);

  return (
    <aside
      data-atlas-ui
      className="atlas-panel pointer-events-auto absolute inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-[#c4a574]/40 bg-[#faf6eb]/95 shadow-2xl backdrop-blur-xl sm:max-w-sm"
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
            {ATLAS_FILTER_LABELS[cat]}
          </p>
          <h2 className="mt-1 font-serif text-2xl tracking-tight text-white drop-shadow">
            {place.name}
          </h2>
          {place.englishName !== place.name && (
            <p className="text-sm text-white/75">{place.englishName}</p>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 text-sm text-[#3d2a12]">
        <section>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#8a6a3a]">
            Overview
          </p>
          <p className="mt-2 leading-relaxed">{place.summary}</p>
          {place.atlas.scripturalSignificance && (
            <p className="mt-3 text-[13px] leading-relaxed text-[#5a4020]/90">
              {place.atlas.scripturalSignificance}
            </p>
          )}
        </section>

        {place.atlas.kingdom && (
          <section>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#8a6a3a]">
              Kingdom
            </p>
            <p className="mt-1.5 font-medium">{place.atlas.kingdom}</p>
          </section>
        )}

        <section className="rounded-2xl border border-[#c4a574]/40 bg-[#efe0c0]/55 p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#8a6a3a]">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            Approximate modern location
          </p>
          <p className="mt-2 font-medium">{place.atlas.modernLocation}</p>
          <p className="mt-2 text-[11px] text-[#6a4b1e]/75">
            {place.atlas.latitude.toFixed(2)}°N,{" "}
            {place.atlas.longitude.toFixed(2)}°E · educational context only
          </p>
        </section>

        {related.length > 0 && (
          <section>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#8a6a3a]">
              Related characters
            </p>
            <ul className="mt-2 space-y-1.5">
              {related.slice(0, 10).map((r) => (
                <li key={r.id}>
                  <Link
                    href={r.href}
                    className="text-[#5a4020] underline-offset-2 hover:underline"
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
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#8a6a3a]">
              Related Gītā chapters
            </p>
            <Link
              href="/bhagavad-gita/chapter-1"
              className="mt-2 inline-flex items-center gap-1.5 text-[#5a4020] underline-offset-2 hover:underline"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Chapter 1 — Arjuna Viṣāda Yoga
            </Link>
          </section>
        )}

        {place.scriptureSources.length > 0 && (
          <section>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#8a6a3a]">
              Sources
            </p>
            <ul className="mt-1.5 space-y-0.5 text-xs text-[#6a4b1e]/90">
              {place.scriptureSources.map((s, i) => (
                <li key={i}>{formatCitation(s)}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="space-y-2 border-t border-[#c4a574]/40 p-4">
        <Link
          href={atlasHref(place)}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#6a4b1e] text-sm font-medium text-[#faf3e0] shadow-md transition hover:bg-[#5a3f18]"
        >
          Open place page
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href={entityHref(place)}
            className="inline-flex h-12 items-center justify-center gap-1.5 rounded-2xl border border-[#c4a574]/50 bg-[#efe0c0]/60 text-xs font-medium text-[#5a4020]"
          >
            <Library className="h-4 w-4" />
            Encyclopedia
          </Link>
          <Link
            href="/genealogy"
            className="inline-flex h-12 items-center justify-center gap-1.5 rounded-2xl border border-[#c4a574]/50 bg-[#efe0c0]/60 text-xs font-medium text-[#5a4020]"
          >
            <GitBranch className="h-4 w-4" />
            Genealogy
          </Link>
        </div>
      </div>
    </aside>
  );
}
