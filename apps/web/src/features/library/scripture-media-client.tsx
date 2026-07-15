"use client";

import * as React from "react";
import { Images, Trash2, Upload } from "lucide-react";
import { libraryService } from "@/lib/api/services/library";
import { resolveMediaUrl } from "@/lib/api/services/verses";
import type { MediaAsset } from "@/lib/api/schemas";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/features/admin/empty-state";

const KINDS = ["cover", "banner", "icon", "illustration", "audio", "pdf", "video", "other"] as const;

export function ScriptureMediaClient({ scriptureId }: { scriptureId: string }) {
  const [items, setItems] = React.useState<MediaAsset[]>([]);
  const [kind, setKind] = React.useState<(typeof KINDS)[number]>("cover");
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const reload = React.useCallback(async () => {
    setItems(await libraryService.listMedia(scriptureId));
  }, [scriptureId]);

  React.useEffect(() => {
    void reload().catch(() => setItems([]));
  }, [reload]);

  async function onUpload(file: File) {
    const url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("read failed"));
      reader.readAsDataURL(file);
    });
    setPreviewUrl(url);
    await libraryService.createMedia(scriptureId, {
      kind,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      url,
    });
    setPreviewUrl(null);
    await reload();
  }

  return (
    <div className="space-y-6">
      <div className="border-border flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-end">
        <label className="space-y-2 text-sm">
          <span className="font-medium">Kind</span>
          <select
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
            value={kind}
            onChange={(e) => setKind(e.target.value as (typeof KINDS)[number])}
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1 space-y-2 text-sm">
          <span className="font-medium">Upload file</span>
          <input
            type="file"
            className="border-input bg-background block w-full rounded-md border px-3 py-2 text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onUpload(file);
            }}
          />
        </label>
        <p className="text-muted-foreground text-xs sm:max-w-[14rem]">
          Files are saved on the API uploads disk. Preview appears before save.
        </p>
      </div>

      {previewUrl ? (
        <div className="border-border rounded-lg border p-3">
          <p className="mb-2 text-sm font-medium">Preview</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Upload preview" className="h-40 max-w-full rounded-md object-contain" />
        </div>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          icon={Images}
          title="No media yet"
          description="Upload cover, banner, audio, PDF, or video for this scripture."
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const src = resolveMediaUrl(item.url) ?? item.url;
            return (
            <li key={item.id} className="border-border rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.fileName}</p>
                  <p className="text-muted-foreground text-xs capitalize">
                    {item.kind} · {Math.round(item.sizeBytes / 1024)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${item.fileName}`}
                  onClick={() =>
                    void libraryService.deleteMedia(scriptureId, item.id).then(reload)
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {item.mimeType.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" className="mt-3 h-28 w-full rounded-md object-cover" />
              ) : item.mimeType.startsWith("audio/") ? (
                <audio controls className="mt-3 w-full" src={src}>
                  <track kind="captions" />
                </audio>
              ) : item.mimeType === "application/pdf" ? (
                <a
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground mt-3 flex h-28 items-center justify-center rounded-md border border-dashed text-xs underline"
                >
                  Open PDF
                </a>
              ) : (
                <div className="text-muted-foreground mt-3 flex h-28 items-center justify-center rounded-md border border-dashed text-xs">
                  <Upload className="mr-2 h-4 w-4" aria-hidden />
                  {item.mimeType}
                </div>
              )}
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
