"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminBreadcrumbs } from "@/features/admin/admin-breadcrumbs";
import { AdminMobileNav } from "@/features/admin/admin-sidebar";
import { getAdminBreadcrumbs } from "@/features/admin/nav";
import { Badge } from "@/components/ui/badge";

export function AdminHeader() {
  const pathname = usePathname();
  const crumbs = getAdminBreadcrumbs(pathname);

  return (
    <header className="border-border bg-background/80 sticky top-0 z-40 flex h-14 items-center gap-3 border-b px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <AdminMobileNav />
      <div className="min-w-0 flex-1">
        <AdminBreadcrumbs items={crumbs} />
      </div>
      <Badge variant="muted" className="hidden sm:inline-flex">
        Internal
      </Badge>
      <ThemeToggle />
    </header>
  );
}
