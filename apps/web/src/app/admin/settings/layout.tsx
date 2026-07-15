import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { SettingsNav } from "@/features/settings";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Settings"
        description="Platform configuration — branding, SEO, email, storage, API keys, and access control."
      />
      <SettingsNav />
      <div>{children}</div>
    </div>
  );
}
