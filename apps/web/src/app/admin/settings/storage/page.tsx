import { HardDrive } from "lucide-react";
import { EmptyState } from "@/features/admin/empty-state";

export const metadata = { title: "Storage" };

export default function StorageSettingsPage() {
  return (
    <EmptyState
      icon={HardDrive}
      title="Storage"
      description="Media storage provider, CDN, and usage limits will be configured here."
      actionLabel="Configure storage"
    />
  );
}
