import type { Metadata } from "next";
import { History } from "lucide-react";

export const metadata: Metadata = { title: "Reading History" };

export default function HistoryPage() {
  return (
    <div
      className="border-border bg-muted/20 rounded-xl border border-dashed px-6 py-16 text-center"
    >
      <div className="border-border bg-background mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md border">
        <History className="text-muted-foreground h-4 w-4" aria-hidden />
      </div>
      <h2 className="font-serif text-xl tracking-tight">Nothing to continue yet</h2>
      <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-relaxed">
        Your last scripture, chapter, and verse will appear here so you can pick up
        right where you left off.
      </p>
    </div>
  );
}
