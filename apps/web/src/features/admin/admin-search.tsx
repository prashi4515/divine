"use client";

import { Search } from "lucide-react";
import { useUiStore } from "@/lib/stores";

/**
 * Header search trigger. Opens the command palette; mirrors the ⌘K shortcut.
 */
export function AdminSearch() {
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen);

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="border-border bg-background/60 text-muted-foreground hover:text-foreground hover:border-foreground/20 group inline-flex h-9 w-full max-w-64 items-center gap-2 rounded-md border px-2.5 text-sm transition-colors"
    >
      <Search className="h-4 w-4 shrink-0" aria-hidden />
      <span className="flex-1 text-left">Search…</span>
      <kbd className="border-border bg-muted text-muted-foreground hidden rounded border px-1.5 py-0.5 text-[10px] font-medium sm:inline-block">
        ⌘K
      </kbd>
    </button>
  );
}
