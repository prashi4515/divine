"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Overview", segment: "" },
  { label: "Structure", segment: "structure" },
  { label: "Content", segment: "content" },
  { label: "Translations", segment: "translations" },
  { label: "Media", segment: "media" },
  { label: "Publishing", segment: "publishing" },
  { label: "SEO", segment: "seo" },
  { label: "Appearance", segment: "appearance" },
  { label: "Settings", segment: "settings" },
] as const;

export function ScriptureTabs({ scriptureId }: { scriptureId: string }) {
  const pathname = usePathname();
  const base = `/admin/library/${scriptureId}`;

  return (
    <div className="border-border border-b">
      <nav aria-label="Scripture sections" className="-mb-px flex gap-1 overflow-x-auto">
        {TABS.map((tab) => {
          const href = tab.segment ? `${base}/${tab.segment}` : base;
          const active = tab.segment ? pathname.startsWith(href) : pathname === base;
          return (
            <Link
              key={tab.label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors",
                active
                  ? "border-foreground text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
