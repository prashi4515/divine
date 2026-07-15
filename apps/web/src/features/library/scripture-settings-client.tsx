"use client";

import * as React from "react";
import { libraryService } from "@/lib/api/services/library";
import type { Scripture } from "@/lib/api/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ScriptureSettingsClient({
  scriptureId,
  mode,
}: {
  scriptureId: string;
  mode: "settings" | "appearance";
}) {
  const [scripture, setScripture] = React.useState<Scripture | null>(null);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    void libraryService.get(scriptureId).then(setScripture).catch(() => setScripture(null));
  }, [scriptureId]);

  if (!scripture) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  return (
    <form
      className="max-w-xl space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        setPending(true);
        const payload =
          mode === "appearance"
            ? {
                themeColor: String(form.get("themeColor") || "") || undefined,
                accentColor: String(form.get("accentColor") || "") || undefined,
              }
            : {
                visibility: String(form.get("visibility") || "private"),
                defaultLanguage: String(form.get("defaultLanguage") || "") || undefined,
                readingDirection: String(form.get("readingDirection") || "ltr"),
                accentColor: String(form.get("accentColor") || "") || undefined,
                themeColor: String(form.get("themeColor") || "") || undefined,
              };
        void libraryService
          .update(scriptureId, payload)
          .then(setScripture)
          .finally(() => setPending(false));
      }}
    >
      {mode === "appearance" || mode === "settings" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="themeColor">Theme color</Label>
            <Input id="themeColor" name="themeColor" defaultValue={scripture.themeColor ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accentColor">Accent color</Label>
            <Input id="accentColor" name="accentColor" defaultValue={scripture.accentColor ?? ""} />
          </div>
        </>
      ) : null}

      {mode === "settings" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <select
              id="visibility"
              name="visibility"
              defaultValue={scripture.visibility}
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultLanguage">Default language</Label>
            <Input
              id="defaultLanguage"
              name="defaultLanguage"
              defaultValue={scripture.defaultLanguage ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="readingDirection">Reading direction</Label>
            <select
              id="readingDirection"
              name="readingDirection"
              defaultValue={scripture.readingDirection}
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
            >
              <option value="ltr">Left to right</option>
              <option value="rtl">Right to left</option>
            </select>
          </div>
        </>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
