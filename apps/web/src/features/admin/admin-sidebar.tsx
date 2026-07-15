"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AdminSidebarNav } from "@/features/admin/admin-sidebar-nav";

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5 px-4 py-4">
      <div className="border-border flex h-7 w-7 items-center justify-center rounded-md border">
        <span className="font-serif text-xs">ॐ</span>
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium tracking-tight">Divine</div>
        <div className="text-muted-foreground truncate text-[11px]">Scripture CMS</div>
      </div>
    </Link>
  );
}

export function AdminSidebar() {
  return (
    <aside className="border-border bg-background hidden w-60 shrink-0 flex-col border-r md:flex">
      <Brand />
      <Separator />
      <AdminSidebarNav />
      <div className="text-muted-foreground mt-auto border-t px-4 py-3 text-[11px]">
        Foundation · v0
      </div>
    </aside>
  );
}

export function AdminMobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="border-border bg-background absolute inset-y-0 left-0 flex w-[min(100%,17rem)] flex-col border-r shadow-sm">
            <div className="flex items-center justify-between pr-2">
              <Brand />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Separator />
            <AdminSidebarNav onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
