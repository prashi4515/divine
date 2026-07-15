import type { Chapter } from "@divine/types";
import { FolderTree } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ChaptersTableProps = {
  chapters: Chapter[];
};

/**
 * Read-only admin table for published chapters from the live API.
 */
export function ChaptersTable({ chapters }: ChaptersTableProps) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Chapters</CardTitle>
            <CardDescription className="mt-1">
              Published chapters from GET /v1/chapters (read-only).
            </CardDescription>
          </div>
          <Badge variant="outline">{chapters.length} rows</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-border bg-muted/40 border-b">
                <th className="text-muted-foreground px-6 py-3 font-medium">Public ID</th>
                <th className="text-muted-foreground px-6 py-3 font-medium">Work</th>
                <th className="text-muted-foreground px-6 py-3 font-medium">Number</th>
                <th className="text-muted-foreground px-6 py-3 font-medium">Title</th>
                <th className="text-muted-foreground px-6 py-3 font-medium">Verses</th>
                <th className="text-muted-foreground px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {chapters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="border-border bg-muted/40 mb-3 flex h-9 w-9 items-center justify-center rounded-md border">
                        <FolderTree className="text-muted-foreground h-4 w-4" aria-hidden />
                      </div>
                      <p className="text-sm font-medium">No published chapters yet</p>
                      <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                        Chapters appear here after content is imported and marked published.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                chapters.map((chapter) => (
                  <tr key={chapter.id} className="border-border border-b last:border-b-0">
                    <td className="px-6 py-3 font-mono text-xs">{chapter.publicId}</td>
                    <td className="px-6 py-3">
                      <div className="font-medium">{chapter.work.title}</div>
                      <div className="text-muted-foreground font-mono text-xs">
                        {chapter.work.code}
                      </div>
                    </td>
                    <td className="px-6 py-3 tabular-nums">{chapter.number}</td>
                    <td className="text-muted-foreground px-6 py-3">
                      {chapter.title ?? "—"}
                    </td>
                    <td className="px-6 py-3 tabular-nums">{chapter.verseCount}</td>
                    <td className="px-6 py-3">
                      <Badge variant={chapter.isPublished ? "default" : "secondary"}>
                        {chapter.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
