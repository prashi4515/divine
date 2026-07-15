"use client";

import * as React from "react";
import { libraryService } from "@/lib/api/services/library";
import type { Scripture } from "@/lib/api/schemas";
import { ScriptureTabs } from "@/features/library/scripture-tabs";
import { Badge } from "@/components/ui/badge";

export function ScriptureDetailShell({
  scriptureId,
  children,
}: {
  scriptureId: string;
  children: React.ReactNode;
}) {
  const [scripture, setScripture] = React.useState<Scripture | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    void libraryService
      .get(scriptureId)
      .then((data) => {
        if (active) setScripture(data);
      })
      .catch(() => {
        if (active) setError("Scripture not found or you are not signed in.");
      });
    return () => {
      active = false;
    };
  }, [scriptureId]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-muted-foreground font-mono text-xs tracking-wide">{scriptureId}</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {scripture?.name ?? "Scripture"}
          </h1>
          {scripture ? (
            <Badge variant={scripture.isPublished ? "secondary" : "outline"}>
              {scripture.status}
            </Badge>
          ) : null}
        </div>
        <p className="text-muted-foreground max-w-2xl text-sm">
          {scripture?.description ??
            "Manage structure, content, media, SEO, and settings for this scripture."}
        </p>
        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        ) : null}
      </div>
      <ScriptureTabs scriptureId={scriptureId} />
      <div>{children}</div>
    </div>
  );
}
