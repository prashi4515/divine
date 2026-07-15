"use client";

import * as React from "react";
import { libraryService } from "@/lib/api/services/library";
import type { Scripture } from "@/lib/api/schemas";
import { StatCard } from "@/features/admin/stat-card";
import { ScriptureFormDialog } from "@/features/library/scripture-form-dialog";
import { BookOpen, FolderTree, FileText, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ScriptureOverviewClient({ scriptureId }: { scriptureId: string }) {
  const [scripture, setScripture] = React.useState<Scripture | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);

  const reload = React.useCallback(async () => {
    const data = await libraryService.get(scriptureId);
    setScripture(data);
  }, [scriptureId]);

  React.useEffect(() => {
    void reload().catch(() => setScripture(null));
  }, [reload]);

  if (!scripture) {
    return <p className="text-muted-foreground text-sm">Loading overview…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
          Edit overview
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Books" value={String(scripture.bookCount)} hint="Structural top level" icon={FolderTree} />
        <StatCard label="Chapters" value={String(scripture.chapterCount)} hint="Structural units" icon={FolderTree} />
        <StatCard label="Verses" value={String(scripture.verseCount)} hint="Atomic units" icon={BookOpen} />
        <StatCard label="Translations" value={String(scripture.translationCount)} hint="Across languages" icon={FileText} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Identity and publishing summary.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <Row label="Name" value={scripture.name} />
          <Row label="Slug" value={scripture.slug} />
          <Row label="Religion" value={scripture.religion ?? "—"} />
          <Row label="Original language" value={scripture.originalLanguage ?? "—"} />
          <Row label="Structure" value={scripture.structureLevels.join(" › ") || "—"} />
          <Row label="Published" value={scripture.isPublished ? "Yes" : "No"} />
          <Row label="Created" value={new Date(scripture.createdAt).toLocaleString()} />
          <Row label="Modified" value={new Date(scripture.updatedAt).toLocaleString()} />
          <div className="sm:col-span-2">
            <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">Description</p>
            <p className="inline-flex items-start gap-2">
              <Languages className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {scripture.description ?? "No description yet."}
            </p>
          </div>
        </CardContent>
      </Card>

      <ScriptureFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        scripture={scripture}
        onSubmit={async (payload) => {
          await libraryService.update(scriptureId, payload);
          await reload();
        }}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
