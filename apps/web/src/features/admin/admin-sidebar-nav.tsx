"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminNavGroups } from "@/features/admin/nav";
import { usePermissions } from "@/features/rbac";
import { useUiStore } from "@/lib/stores";

function isActive(pathname: string, href: string): boolean {
  return href === "/admin"
    ? pathname === "/admin"
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { can } = usePermissions();
  const collapsedGroups = useUiStore((s) => s.collapsedGroups);
  const toggleGroup = useUiStore((s) => s.toggleGroup);

  return (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
      {adminNavGroups.map((group) => {
        const items = group.items.filter((item) => can(item.permission));
        if (items.length === 0) return null;

        const collapsed = collapsedGroups[group.id] ?? false;

        return (
          <div key={group.id} className="space-y-1">
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              aria-expanded={!collapsed}
              className="text-muted-foreground hover:text-foreground flex w-full items-center justify-between px-2.5 py-1 text-xs font-medium uppercase tracking-wider transition-colors"
            >
              <span>{group.label}</span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  collapsed && "-rotate-90",
                )}
                aria-hidden
              />
            </button>

            {!collapsed && (
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onNavigate?.()}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-secondary text-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active
                            ? "text-foreground"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                        aria-hidden
                      />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
