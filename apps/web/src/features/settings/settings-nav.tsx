"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { label: "General", href: "/admin/settings" },
  { label: "Branding", href: "/admin/settings/branding" },
  { label: "SEO", href: "/admin/settings/seo" },
  { label: "Email", href: "/admin/settings/email" },
  { label: "Storage", href: "/admin/settings/storage" },
  { label: "API Keys", href: "/admin/settings/api-keys" },
  { label: "Roles", href: "/admin/settings/roles" },
  { label: "Permissions", href: "/admin/settings/permissions" },
] as const;

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <div className="border-border border-b">
      <nav aria-label="Settings sections" className="-mb-px flex gap-1 overflow-x-auto">
        {ITEMS.map((item) => {
          const active =
            item.href === "/admin/settings"
              ? pathname === item.href
              : pathname.startsWith(item.href);
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
