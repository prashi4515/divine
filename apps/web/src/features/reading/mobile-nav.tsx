"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  BookOpen,
  GitBranch,
  Home,
  Menu,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match?: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home, match: (p) => p === "/" },
  { href: "/bhagavad-gita", label: "All Chapters", icon: BookOpen },
  { href: "/genealogy", label: "Genealogy", icon: GitBranch },
  { href: "/search", label: "Search", icon: Search },
  { href: "/account", label: "My Account", icon: UserRound },
];

/**
 * Mobile hamburger — slide-in nav sheet with primary destinations.
 * Rendered only on <md; desktop uses HeaderNav.
 */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:bg-muted/60 hover:text-foreground focus-visible:ring-ring inline-flex h-9 w-9 items-center justify-center rounded-md transition-divine focus-visible:outline-none focus-visible:ring-2 md:hidden"
          aria-label="Open navigation menu"
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
            "bg-background border-border fixed right-0 top-0 z-50 flex h-svh w-full max-w-xs flex-col overflow-hidden border-l shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
            "duration-200",
          )}
        >
          <div className="border-border/70 flex items-center justify-between border-b px-5 py-4">
            <DialogPrimitive.Title asChild>
              <span className="font-serif text-base">Menu</span>
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close navigation menu"
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5 transition-divine"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>
          <nav aria-label="Mobile primary" className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = item.match
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
            <p className="text-muted-foreground text-xs">
              Read the Bhagavad Gītā and explore Hindu genealogy with clarity
              and reverence.
            </p>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
