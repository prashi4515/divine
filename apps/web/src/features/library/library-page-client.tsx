"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  Copy,
  Eye,
  EyeOff,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { EmptyState } from "@/features/admin/empty-state";
import { TableSkeleton } from "@/features/admin/skeletons";
import { ScriptureFormDialog } from "@/features/library/scripture-form-dialog";
import { libraryService } from "@/lib/api/services/library";
import { resolveMediaUrl } from "@/lib/api/services/verses";
import type { Scripture } from "@/lib/api/schemas";
import { CONTENT_STATUSES } from "@/lib/api/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Library } from "lucide-react";

export function LibraryPageClient() {
  const router = useRouter();
  const [rows, setRows] = React.useState<Scripture[]>([]);
  const [meta, setMeta] = React.useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<string>("");
  const [published, setPublished] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState("sortOrder");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [page, setPage] = React.useState(1);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Scripture | null>(null);

  const load = React.useCallback(
    async (opts?: { q?: string; page?: number }) => {
      setLoading(true);
      setError(null);
      try {
        const result = await libraryService.list({
          page: opts?.page ?? page,
          pageSize: 20,
          search: (opts?.q ?? search).trim() || undefined,
          status: status || undefined,
          published:
            published === ""
              ? undefined
              : published === "true",
          sortBy,
          sortDir,
        });
        setRows(result.data);
        setMeta(result.meta);
      } catch {
        setError("Could not load scriptures. Sign in again if your session expired.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [page, search, status, published, sortBy, sortDir],
  );

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      setPage(1);
      void load({ q: search, page: 1 });
    }, 250);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce search only
  }, [search]);

  async function handleCreate(payload: Record<string, unknown>) {
    const created = await libraryService.create(payload);
    await load();
    router.push(`/admin/library/${created.id}`);
  }

  async function handleUpdate(payload: Record<string, unknown>) {
    if (!editTarget) return;
    await libraryService.update(editTarget.id, payload);
    setEditTarget(null);
    await load();
  }

  async function handleDelete(scripture: Scripture) {
    const ok = window.confirm(`Delete “${scripture.name}”? This cannot be undone.`);
    if (!ok) return;
    await libraryService.remove(scripture.id);
    await load();
  }

  async function runAction(
    action: "publish" | "unpublish" | "archive" | "duplicate",
    scripture: Scripture,
  ) {
    try {
      if (action === "publish") await libraryService.publish(scripture.id);
      if (action === "unpublish") await libraryService.unpublish(scripture.id);
      if (action === "archive") await libraryService.archive(scripture.id);
      if (action === "duplicate") {
        const copy = await libraryService.duplicate(scripture.id);
        router.push(`/admin/library/${copy.id}`);
        return;
      }
      await load();
    } catch {
      setError(`Action “${action}” failed for ${scripture.name}.`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <AdminPageHeader
          title="Library"
          description="Every scripture in the platform — structure, translations, and media."
        />
        <Button size="sm" className="shrink-0 self-start" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden />
          New Scripture
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" aria-hidden />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scriptures…"
            className="pl-8"
            aria-label="Search scriptures"
          />
        </div>
        <select
          className="border-input bg-background h-9 rounded-md border px-3 text-sm"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {CONTENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="border-input bg-background h-9 rounded-md border px-3 text-sm"
          value={published}
          onChange={(e) => {
            setPublished(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by published"
        >
          <option value="">Published: any</option>
          <option value="true">Published</option>
          <option value="false">Unpublished</option>
        </select>
        <select
          className="border-input bg-background h-9 rounded-md border px-3 text-sm"
          value={`${sortBy}:${sortDir}`}
          onChange={(e) => {
            const [by, dir] = e.target.value.split(":") as [string, "asc" | "desc"];
            setSortBy(by);
            setSortDir(dir);
            setPage(1);
          }}
          aria-label="Sort scriptures"
        >
          <option value="sortOrder:asc">Sort: order</option>
          <option value="name:asc">Name A–Z</option>
          <option value="name:desc">Name Z–A</option>
          <option value="updatedAt:desc">Updated newest</option>
          <option value="updatedAt:asc">Updated oldest</option>
          <option value="verseCount:desc">Most verses</option>
          <option value="status:asc">Status</option>
        </select>
      </div>

      {error ? (
        <p role="alert" className="border-destructive/40 bg-destructive/5 text-destructive rounded-md border px-3 py-2 text-sm">
          {error}
        </p>
      ) : null}

      {loading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Library}
          title="No scriptures yet"
          description="Create your first scripture to begin structuring books, chapters, and verses."
          actionLabel="New Scripture"
        />
      ) : (
        <>
          <div className="border-border overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[64rem] text-left text-sm">
              <thead>
                <tr className="border-border bg-muted/40 border-b">
                  {[
                    "Cover",
                    "Name",
                    "Slug",
                    "Religion",
                    "Language",
                    "Structure",
                    "Books",
                    "Chapters",
                    "Verses",
                    "Translations",
                    "Published",
                    "Status",
                    "Updated",
                    "Actions",
                  ].map((label) => (
                    <th key={label} className="text-muted-foreground px-3 py-2.5 text-xs font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const cover = resolveMediaUrl(row.coverImageUrl);
                  return (
                    <tr key={row.id} className="border-border hover:bg-muted/20 border-b last:border-0">
                      <td className="px-3 py-2.5">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cover}
                            alt=""
                            className="border-border h-9 w-9 rounded-md border object-cover"
                          />
                        ) : (
                          <span className="border-border bg-muted text-muted-foreground inline-flex h-9 w-9 items-center justify-center rounded-md border text-[10px]">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-medium">
                        <Link href={`/admin/library/${row.id}`} className="hover:underline">
                          {row.name}
                        </Link>
                      </td>
                      <td className="text-muted-foreground px-3 py-2.5 font-mono text-xs">{row.slug}</td>
                      <td className="px-3 py-2.5">{row.religion ?? "—"}</td>
                      <td className="px-3 py-2.5">{row.originalLanguage ?? "—"}</td>
                      <td className="text-muted-foreground max-w-[10rem] truncate px-3 py-2.5 text-xs">
                        {row.structureLevels.join(" › ") || "—"}
                      </td>
                      <td className="px-3 py-2.5">{row.bookCount}</td>
                      <td className="px-3 py-2.5">{row.chapterCount}</td>
                      <td className="px-3 py-2.5">{row.verseCount}</td>
                      <td className="px-3 py-2.5">{row.translationCount}</td>
                      <td className="px-3 py-2.5">
                        <Badge variant={row.isPublished ? "secondary" : "outline"}>
                          {row.isPublished ? "Yes" : "No"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 capitalize">
                        <Badge variant="outline">{row.status}</Badge>
                      </td>
                      <td className="text-muted-foreground px-3 py-2.5 text-xs">
                        {new Date(row.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Actions for ${row.name}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/library/${row.id}`}>Open</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditTarget(row)}>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {!row.isPublished ? (
                              <DropdownMenuItem onClick={() => void runAction("publish", row)}>
                                <Eye className="h-4 w-4" aria-hidden />
                                Publish
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => void runAction("unpublish", row)}>
                                <EyeOff className="h-4 w-4" aria-hidden />
                                Unpublish
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => void runAction("duplicate", row)}>
                              <Copy className="h-4 w-4" aria-hidden />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => void runAction("archive", row)}>
                              <Archive className="h-4 w-4" aria-hidden />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => void handleDelete(row)}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm">
            <p className="text-muted-foreground">
              Page {meta.page} of {meta.totalPages} · {meta.total} scriptures
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={meta.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      <ScriptureFormDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} />
      <ScriptureFormDialog
        open={Boolean(editTarget)}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        scripture={editTarget}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
