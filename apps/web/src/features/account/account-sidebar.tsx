"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Clock3,
  LogOut,
  NotebookPen,
  Sunrise,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { AUTH_ROUTES } from "@/lib/auth/config";
import { cn } from "@/lib/utils";

const ITEMS: Array<{
  label: string;
  href: string;
  icon: typeof UserRound;
  exact?: boolean;
}> = [
  { label: "Profile", href: "/account", icon: UserRound, exact: true },
  {
    label: "Verse of the Day",
    href: "/account/verse-of-the-day",
    icon: Sunrise,
  },
  { label: "Bookmarks", href: "/account/bookmarks", icon: Bookmark },
  { label: "My Notes", href: "/account/notes", icon: NotebookPen },
  { label: "Reading Progress", href: "/account/history", icon: Clock3 },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const { logout, status } = useAuth();

  return (
    <aside className="border-border bg-card/40 h-fit rounded-xl border p-3 md:sticky md:top-24">
      <p className="text-muted-foreground px-2 pb-2 text-xs font-medium tracking-wide uppercase">
        My Account
      </p>
      <nav aria-label="Account sections" className="flex flex-col gap-0.5">
        {ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}

        {status === "authenticated" ? (
          <button
            type="button"
            onClick={() => void logout()}
            className="text-muted-foreground hover:bg-muted/60 hover:text-foreground mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            Log Out
          </button>
        ) : (
          <Link
            href={`${AUTH_ROUTES.login}?next=${AUTH_ROUTES.account}`}
            className="text-muted-foreground hover:bg-muted/60 hover:text-foreground mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            Sign in
          </Link>
        )}
      </nav>
    </aside>
  );
}
