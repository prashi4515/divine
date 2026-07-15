import { Globe } from "lucide-react";
import { EmptyState } from "@/features/admin/empty-state";

export const metadata = { title: "SEO" };

export default function SeoSettingsPage() {
  return (
    <EmptyState
      icon={Globe}
      title="SEO"
      description="Default metadata, canonical rules, sitemaps, and hreflang settings will live here."
      actionLabel="Edit SEO"
    />
  );
}
