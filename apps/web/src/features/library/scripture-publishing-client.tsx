"use client";

import * as React from "react";
import { libraryService } from "@/lib/api/services/library";
import type { Scripture } from "@/lib/api/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STEPS = ["draft", "review", "published", "archived"] as const;

export function ScripturePublishingClient({ scriptureId }: { scriptureId: string }) {
  const [scripture, setScripture] = React.useState<Scripture | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const reload = React.useCallback(async () => {
    setScripture(await libraryService.get(scriptureId));
  }, [scriptureId]);

  React.useEffect(() => {
    void reload().catch(() => setScripture(null));
  }, [reload]);

  async function run(action: "draft" | "review" | "publish" | "unpublish" | "archive") {
    setBusy(true);
    setMessage(null);
    try {
      if (action === "draft") {
        await libraryService.update(scriptureId, { status: "draft", isPublished: false });
      } else if (action === "review") {
        await libraryService.review(scriptureId);
      } else if (action === "publish") {
        await libraryService.publish(scriptureId);
      } else if (action === "unpublish") {
        await libraryService.unpublish(scriptureId);
      } else {
        await libraryService.archive(scriptureId);
      }
      await reload();
      setMessage(`Moved to ${action === "publish" ? "published" : action}.`);
    } catch {
      setMessage("Publishing action failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!scripture) {
    return <p className="text-muted-foreground text-sm">Loading publishing state…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-medium">Publishing workflow</h2>
        <p className="text-muted-foreground text-sm">
          Draft → Review → Published → Archived. Publishing updates the linked Work catalog
          so the public reader reflects CMS status.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STEPS.map((step) => (
          <Badge
            key={step}
            variant={scripture.status === step ? "secondary" : "outline"}
            className="capitalize"
          >
            {step}
          </Badge>
        ))}
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Current status</dt>
          <dd className="capitalize font-medium">{scripture.status}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Published flag</dt>
          <dd className="font-medium">{scripture.isPublished ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Visibility</dt>
          <dd className="font-medium">{scripture.visibility}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Linked work</dt>
          <dd className="font-mono text-xs">{scripture.workCode ?? "—"}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={busy} onClick={() => void run("draft")}>
          Set draft
        </Button>
        <Button type="button" variant="outline" disabled={busy} onClick={() => void run("review")}>
          Send to review
        </Button>
        <Button type="button" disabled={busy} onClick={() => void run("publish")}>
          Publish
        </Button>
        <Button type="button" variant="outline" disabled={busy} onClick={() => void run("unpublish")}>
          Unpublish
        </Button>
        <Button type="button" variant="secondary" disabled={busy} onClick={() => void run("archive")}>
          Archive
        </Button>
      </div>

      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}
