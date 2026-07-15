"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminBreadcrumbs } from "@/features/admin/admin-breadcrumbs";
import { AdminMobileNav } from "@/features/admin/admin-sidebar";
import { AdminSearch } from "@/features/admin/admin-search";
import { AdminUserMenu } from "@/features/admin/admin-user-menu";
import { getAdminBreadcrumbs } from "@/features/admin/nav";

export function AdminHeader() {
  const pathname = usePathname();
  const crumbs = getAdminBreadcrumbs(pathname);

  return (
    <header className="border-border bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 flex h-14 items-center gap-3 border-b px-4 backdrop-blur md:px-6">
      <AdminMobileNav />
      <div className="min-w-0 flex-1">
        <AdminBreadcrumbs items={crumbs} />
      </div>
      <div className="hidden md:block">
        <AdminSearch />
      </div>
      <ThemeToggle />
      <AdminUserMenu />
    </header>
  );
}
