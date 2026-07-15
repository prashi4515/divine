"use client";

import * as React from "react";
import { libraryService } from "@/lib/api/services/library";
import type { Scripture } from "@/lib/api/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ScriptureSeoClient({ scriptureId }: { scriptureId: string }) {
  const [scripture, setScripture] = React.useState<Scripture | null>(null);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    void libraryService.get(scriptureId).then(setScripture).catch(() => setScripture(null));
  }, [scriptureId]);

  if (!scripture) return <p className="text-muted-foreground text-sm">Loading SEO…</p>;

  return (
    <form
      className="max-w-2xl space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        setPending(true);
        void libraryService
          .update(scriptureId, {
            seoTitle: String(form.get("seoTitle") || "") || undefined,
            seoDescription: String(form.get("seoDescription") || "") || undefined,
            seoKeywords: String(form.get("seoKeywords") || "") || undefined,
            canonicalUrl: String(form.get("canonicalUrl") || "") || undefined,
            ogImageUrl: String(form.get("ogImageUrl") || "") || undefined,
          })
          .then((data) => setScripture(data))
          .finally(() => setPending(false));
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="seoTitle">Title</Label>
        <Input id="seoTitle" name="seoTitle" defaultValue={scripture.seoTitle ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="seoDescription">Description</Label>
        <Textarea id="seoDescription" name="seoDescription" defaultValue={scripture.seoDescription ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="seoKeywords">Keywords</Label>
        <Input id="seoKeywords" name="seoKeywords" defaultValue={scripture.seoKeywords ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="canonicalUrl">Canonical URL</Label>
        <Input id="canonicalUrl" name="canonicalUrl" defaultValue={scripture.canonicalUrl ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ogImageUrl">OpenGraph image URL</Label>
        <Input id="ogImageUrl" name="ogImageUrl" defaultValue={scripture.ogImageUrl ?? ""} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save SEO"}
      </Button>
    </form>
  );
}
