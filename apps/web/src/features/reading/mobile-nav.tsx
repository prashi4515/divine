"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  BookOpen,
  Crown,
  GitBranch,
  Globe2,
  Home,
  Library,
  Menu,
  Search,
  Shield,
  Swords,
  UserRound,
  X,
} from "lucide-react";
import { PUBLIC_AUTH_UI_ENABLED } from "@/lib/auth/config";
import { useMessages } from "@/lib/i18n/use-messages";
import { cn } from "@/lib/utils";

/**
 * Mobile hamburger — slide-in nav below `lg`; desktop uses HeaderNav.
 */
export function MobileNav() {
  const pathname = usePathname();
  const t = useMessages();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const items = [
    { href: "/", label: t.home, icon: Home, match: (p: string) => p === "/" },
    { href: "/bhagavad-gita", label: t.allChapters, icon: BookOpen },
    {
      href: "/atlas",
      label: t.navAtlas,
      icon: Globe2,
      match: (p: string) => p.startsWith("/atlas"),
    },
    {
      href: "/events",
      label: t.navEvents,
      icon: Swords,
      match: (p: string) => p.startsWith("/events"),
    },
    {
      href: "/kingdoms",
      label: t.navKingdoms,
      icon: Crown,
      match: (p: string) => p.startsWith("/kingdoms"),
    },
    {
      href: "/weapons",
      label: t.navWeapons,
      icon: Shield,
      match: (p: string) => p.startsWith("/weapons"),
    },
    {
      href: "/encyclopedia",
      label: t.navEncyclopedia,
      icon: Library,
      match: (p: string) => p.startsWith("/encyclopedia"),
    },
    { href: "/genealogy", label: t.navGenealogy, icon: GitBranch },
    { href: "/search", label: t.navSearch, icon: Search },
    ...(PUBLIC_AUTH_UI_ENABLED
      ? [{ href: "/account", label: t.navAccount, icon: UserRound }]
      : []),
  ];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:bg-muted/60 hover:text-foreground focus-visible:ring-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-divine focus-visible:outline-none focus-visible:ring-2 lg:hidden"
          aria-label={t.navMenu}
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "bg-background border-border fixed left-0 top-0 z-50 flex h-svh w-full max-w-xs flex-col overflow-hidden border-r shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
            "duration-200",
          )}
        >
          <div className="border-border/70 flex items-center justify-between border-b px-5 py-4">
            <DialogPrimitive.Title asChild>
              <span className="font-serif text-base">{t.navMenu}</span>
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label={t.navMenu}
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5 transition-divine"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>
          <nav aria-label="Mobile primary" className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {items.map((item) => {
                const active = "match" in item && item.match
                  ? item.match(pathname ?? "")
                  : pathname?.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "hover:bg-muted/60 group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-divine",
                        active
                          ? "bg-muted/70 text-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-md",
                          active
                            ? "cta-saffron text-white"
                            : "bg-muted text-muted-foreground group-hover:text-foreground",
                        )}
                        aria-hidden
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-border/70 border-t px-5 py-4">
            <p className="text-muted-foreground text-xs">{t.tagline}</p>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
