import type { Metadata } from "next";
import { AdminCommandPalette } from "@/features/admin/admin-command-palette";
import { AdminHeader } from "@/features/admin/admin-header";
import { AdminSidebar } from "@/features/admin/admin-sidebar";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s · Bhagavad Gita Admin",
  },
  description: "Internal content management for the Bhagavad Gita platform.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-svh">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
      <AdminCommandPalette />
    </div>
  );
}
