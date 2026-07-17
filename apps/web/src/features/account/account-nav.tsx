"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { label: "Profile", href: "/profile" },
  { label: "Sessions", href: "/settings/sessions" },
  { label: "Bookmarks", href: "/bookmarks" },
  { label: "Reading History", href: "/history" },
] as const;

export function AccountNav() {
  const pathname = usePathname();

  return (
    <div className="border-border border-b">
      <nav aria-label="Account sections" className="-mb-px flex gap-1 overflow-x-auto">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors",
                active
                  ? "border-foreground text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
