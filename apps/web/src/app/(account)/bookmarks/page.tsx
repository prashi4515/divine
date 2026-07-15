import type { Metadata } from "next";
import { Bookmark } from "lucide-react";

export const metadata: Metadata = { title: "Bookmarks" };

export default function BookmarksPage() {
  return (
    <div
      className="border-border bg-muted/20 rounded-xl border border-dashed px-6 py-16 text-center"
    >
      <div className="border-border bg-background mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md border">
        <Bookmark className="text-muted-foreground h-4 w-4" aria-hidden />
      </div>
      <h2 className="font-serif text-xl tracking-tight">No bookmarks yet</h2>
      <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-relaxed">
        Save verses, chapters, and scriptures with a note to find them here later.
      </p>
    </div>
  );
}
