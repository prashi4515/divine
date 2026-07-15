"use client";

import * as React from "react";
import { libraryService } from "@/lib/api/services/library";
import type { Scripture } from "@/lib/api/schemas";
import { EmptyState } from "@/features/admin/empty-state";
import { Languages } from "lucide-react";

export function ScriptureTranslationsClient({ scriptureId }: { scriptureId: string }) {
  const [scripture, setScripture] = React.useState<Scripture | null>(null);
  const [counts, setCounts] = React.useState<Array<{ language: string; count: number }>>([]);

  React.useEffect(() => {
    void (async () => {
      const s = await libraryService.get(scriptureId);
      setScripture(s);
      const chapters = await libraryService.listCatalogChapters(scriptureId);
      const tallies = new Map<string, number>();
      for (const chapter of chapters.slice(0, 5)) {
        const verses = await libraryService.listCatalogVerses(scriptureId, chapter.publicId);
        for (const verse of verses) {
          for (const t of verse.translations) {
            tallies.set(t.languageCode, (tallies.get(t.languageCode) ?? 0) + 1);
          }
        }
      }
      // Approximate: if many chapters, scale from sample or just show sample + total
      setCounts(
        Array.from(tallies.entries())
          .map(([language, count]) => ({ language, count }))
          .sort((a, b) => a.language.localeCompare(b.language)),
      );
    })().catch(() => {
      setScripture(null);
      setCounts([]);
    });
  }, [scriptureId]);

  if (!scripture) {
    return <p className="text-muted-foreground text-sm">Loading translations…</p>;
  }

  if (scripture.translationCount === 0) {
    return (
      <EmptyState
        icon={Languages}
        title="No translations yet"
        description="Import content or edit verses in the Content tab to add translation rows."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Translations</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {scripture.translationCount} translation rows across this scripture’s linked catalog.
          Edit verse text in the Content tab — language switching on the public reader uses these rows.
        </p>
      </div>
      <div className="border-border overflow-hidden rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-border bg-muted/40 border-b">
              <th className="px-3 py-2 text-xs font-medium">Language</th>
              <th className="px-3 py-2 text-xs font-medium">Sample chapter rows</th>
            </tr>
          </thead>
          <tbody>
            {counts.map((row) => (
              <tr key={row.language} className="border-border border-b last:border-0">
                <td className="px-3 py-2 font-mono text-xs uppercase">{row.language}</td>
                <td className="px-3 py-2">{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
