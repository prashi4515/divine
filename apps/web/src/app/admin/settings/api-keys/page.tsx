import { KeyRound } from "lucide-react";
import { EmptyState } from "@/features/admin/empty-state";

export const metadata = { title: "API Keys" };

export default function ApiKeysSettingsPage() {
  return (
    <EmptyState
      icon={KeyRound}
      title="No API keys"
      description="Programmatic access keys and webhooks for integrations will be managed here."
      actionLabel="Create API key"
    />
  );
}
