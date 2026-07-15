import { Tags } from "lucide-react";
import { EmptyState } from "@/features/admin/empty-state";

export const metadata = { title: "Topics" };

export default function ScriptureTopicsPage() {
  return (
    <EmptyState
      icon={Tags}
      title="No topics linked"
      description="Thematic topics tagged to this scripture's verses will appear here for curation."
      actionLabel="Link topics"
    />
  );
}
