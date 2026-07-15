"use client";

import * as React from "react";
import type { Verse } from "@divine/types";
import { libraryService } from "@/lib/api/services/library";
import { versesService } from "@/lib/api/services/verses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/features/admin/empty-state";
import { BookOpen } from "lucide-react";

type CatalogChapter = {
  id: string;
  publicId: string;
  number: number;
  title: string | null;
  verseCount: number;
  isPublished: boolean;
};

type Revision = {
  id: string;
  entityType: string;
  entityId: string;
  note: string | null;
  createdAt: string;
  snapshot: Record<string, unknown>;
};

export function ScriptureContentClient({ scriptureId }: { scriptureId: string }) {
  const [chapters, setChapters] = React.useState<CatalogChapter[]>([]);
  const [chapterPublicId, setChapterPublicId] = React.useState<string>("");
  const [verses, setVerses] = React.useState<Verse[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string>("");
  const [revisions, setRevisions] = React.useState<Revision[]>([]);
  const [saving, setSaving] = React.useState(false);

  const [sanskritText, setSanskritText] = React.useState("");
  const [transliteration, setTransliteration] = React.useState("");
  const [translationText, setTranslationText] = React.useState("");
  const [meaning, setMeaning] = React.useState("");
  const [commentary, setCommentary] = React.useState("");
  const [seoTitle, setSeoTitle] = React.useState("");
  const [seoDescription, setSeoDescription] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState(0);
  const [isPublished, setIsPublished] = React.useState(false);

  const [dirty, setDirty] = React.useState(false);
  const hydrated = React.useRef(false);

  const selected = verses.find((v) => v.id === selectedId) ?? null;

  React.useEffect(() => {
    void libraryService
      .listCatalogChapters(scriptureId)
      .then((rows) => {
        setChapters(rows);
        if (rows[0]) setChapterPublicId(rows[0].publicId);
      })
      .catch(() => setChapters([]));
  }, [scriptureId]);

  React.useEffect(() => {
    if (!chapterPublicId) {
      setVerses([]);
      return;
    }
    void libraryService
      .listCatalogVerses(scriptureId, chapterPublicId)
      .then((rows) => {
        setVerses(rows);
        if (rows[0]) setSelectedId(rows[0].id);
      })
      .catch(() => setVerses([]));
  }, [scriptureId, chapterPublicId]);

  React.useEffect(() => {
    if (!selected) return;
    hydrated.current = false;
    setSanskritText(selected.sanskritText);
    setTransliteration(selected.transliteration ?? "");
    setMeaning(selected.meaning ?? "");
    setCommentary(selected.commentary ?? "");
    setSeoTitle(selected.seoTitle ?? "");
    setSeoDescription(selected.seoDescription ?? "");
    setSortOrder(selected.sortOrder);
    setIsPublished(selected.isPublished);
    const en =
      selected.translations.find((t) => t.languageCode === "en") ??
      selected.translations[0];
    setTranslationText(en?.text ?? "");
    setDirty(false);
    void versesService
      .listRevisions(selected.id)
      .then(setRevisions)
      .catch(() => setRevisions([]));
    window.setTimeout(() => {
      hydrated.current = true;
    }, 0);
    // Intentionally key on id — reloading full `selected` would reset dirty edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate on verse id change only
  }, [selected?.id]);

  const markDirty = React.useCallback(() => {
    if (hydrated.current) setDirty(true);
  }, []);

  const save = React.useCallback(
    async (note = "Autosave") => {
      if (!selected) return;
      setSaving(true);
      setStatus("");
      try {
        const updated = await versesService.update(selected.id, {
          sanskritText,
          transliteration: transliteration || null,
          meaning: meaning || null,
          commentary: commentary || null,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
          sortOrder,
          isPublished,
          translationText,
          translationLanguageCode: "en",
          note,
        });
        setVerses((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
        setDirty(false);
        setStatus(`Saved ${new Date().toLocaleTimeString()}`);
        const nextRevisions = await versesService.listRevisions(updated.id);
        setRevisions(nextRevisions);
      } catch {
        setStatus("Save failed");
      } finally {
        setSaving(false);
      }
    },
    [
      selected,
      sanskritText,
      transliteration,
      meaning,
      commentary,
      seoTitle,
      seoDescription,
      sortOrder,
      isPublished,
      translationText,
    ],
  );

  React.useEffect(() => {
    if (!dirty || !selected) return;
    const handle = window.setTimeout(() => {
      void save("Autosave");
    }, 1200);
    return () => window.clearTimeout(handle);
  }, [dirty, selected, save]);

  if (chapters.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No catalog chapters yet"
        description="Import or publish content into the linked Work catalog, then sync structure from the Structure tab."
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr_14rem]">
      <aside className="space-y-3">
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Chapter</span>
          <select
            className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
            value={chapterPublicId}
            onChange={(e) => setChapterPublicId(e.target.value)}
          >
            {chapters.map((c) => (
              <option key={c.id} value={c.publicId}>
                {c.number}. {c.title ?? c.publicId} ({c.verseCount})
              </option>
            ))}
          </select>
        </label>
        <ul className="border-border max-h-[70vh] overflow-auto rounded-md border text-sm">
          {verses.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                className={`hover:bg-muted/40 block w-full px-3 py-2 text-left ${
                  selectedId === v.id ? "bg-muted" : ""
                }`}
                onClick={() => setSelectedId(v.id)}
              >
                <span className="font-mono text-xs">{v.publicId}</span>
                {!v.isPublished ? (
                  <Badge variant="outline" className="ml-2 text-[10px]">
                    draft
                  </Badge>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="space-y-4">
        {selected ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-medium">{selected.publicId}</h2>
                <p className="text-muted-foreground text-xs">
                  {status || "Edit and changes autosave"}
                  {saving ? " · saving…" : ""}
                </p>
              </div>
              <Button type="button" size="sm" onClick={() => void save("Manual save")}>
                Save now
              </Button>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="original">Original text</Label>
                <textarea
                  id="original"
                  className="border-input bg-background min-h-28 w-full rounded-md border px-3 py-2 text-sm"
                  value={sanskritText}
                  onChange={(e) => {
                    setSanskritText(e.target.value);
                    markDirty();
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tl">Transliteration</Label>
                <textarea
                  id="tl"
                  className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                  value={transliteration}
                  onChange={(e) => {
                    setTransliteration(e.target.value);
                    markDirty();
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tr">Translation (English)</Label>
                <textarea
                  id="tr"
                  className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                  value={translationText}
                  onChange={(e) => {
                    setTranslationText(e.target.value);
                    markDirty();
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meaning">Meaning</Label>
                <textarea
                  id="meaning"
                  className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                  value={meaning}
                  onChange={(e) => {
                    setMeaning(e.target.value);
                    markDirty();
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commentary">Commentary</Label>
                <textarea
                  id="commentary"
                  className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                  value={commentary}
                  onChange={(e) => {
                    setCommentary(e.target.value);
                    markDirty();
                  }}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO title</Label>
                  <Input
                    id="seoTitle"
                    value={seoTitle}
                    onChange={(e) => {
                      setSeoTitle(e.target.value);
                      markDirty();
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={sortOrder}
                    onChange={(e) => {
                      setSortOrder(Number(e.target.value) || 0);
                      markDirty();
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO description</Label>
                <textarea
                  id="seoDescription"
                  className="border-input bg-background min-h-16 w-full rounded-md border px-3 py-2 text-sm"
                  value={seoDescription}
                  onChange={(e) => {
                    setSeoDescription(e.target.value);
                    markDirty();
                  }}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => {
                    setIsPublished(e.target.checked);
                    markDirty();
                  }}
                />
                Published / visible
              </label>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">Select a verse to edit.</p>
        )}
      </div>

      <aside className="space-y-3">
        <h3 className="text-sm font-medium">Version history</h3>
        <ul className="border-border max-h-[70vh] space-y-2 overflow-auto rounded-md border p-2 text-xs">
          {revisions.length === 0 ? (
            <li className="text-muted-foreground p-2">No revisions yet.</li>
          ) : (
            revisions.map((r) => (
              <li key={r.id} className="border-border rounded border p-2">
                <p className="font-medium">{r.note ?? r.entityType}</p>
                <p className="text-muted-foreground">
                  {new Date(r.createdAt).toLocaleString()}
                </p>
              </li>
            ))
          )}
        </ul>
      </aside>
    </div>
  );
}
