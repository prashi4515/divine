import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/features/admin/empty-state";

export const metadata = { title: "Analytics" };

export default function ScriptureAnalyticsPage() {
  return (
    <EmptyState
      icon={BarChart3}
      title="No analytics yet"
      description="Readership, popular chapters, and language breakdowns for this scripture will appear here."
    />
  );
}
