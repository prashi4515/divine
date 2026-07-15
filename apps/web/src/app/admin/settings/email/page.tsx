import { Mail } from "lucide-react";
import { EmptyState } from "@/features/admin/empty-state";

export const metadata = { title: "Email" };

export default function EmailSettingsPage() {
  return (
    <EmptyState
      icon={Mail}
      title="Email"
      description="Transactional email provider, sender identity, and templates will be configured here."
      actionLabel="Configure email"
    />
  );
}
