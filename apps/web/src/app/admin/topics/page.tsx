import { Sparkles } from "lucide-react";
import { AdminResourcePage } from "@/features/admin/admin-resource-page";

export const metadata = { title: "Topics" };

export default function AdminTopicsPage() {
  return (
    <AdminResourcePage
      title="Topics"
      description="Thematic taxonomy for browse and search. Hierarchy via parent topic is supported in the schema."
      actionLabel="Add topic"
      searchPlaceholder="Search topics…"
      filters={["Parent", "Published"]}
      emptyIcon={Sparkles}
      emptyTitle="No topics yet"
      emptyDescription="Create topics, then map them to verses via VerseTopic."
      columns={[
        { key: "slug", label: "Slug" },
        { key: "name", label: "Name" },
        { key: "parent", label: "Parent" },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
