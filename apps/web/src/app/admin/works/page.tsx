import { Library } from "lucide-react";
import { AdminResourcePage } from "@/features/admin/admin-resource-page";

export const metadata = { title: "Works" };

export default function AdminWorksPage() {
  return (
    <AdminResourcePage
      title="Works"
      description="Top-level scripture corpora. Bhagavad Gita will be the first work (code bg)."
      actionLabel="Add work"
      searchPlaceholder="Search works by title or code…"
      filters={["Published", "Draft"]}
      emptyIcon={Library}
      emptyTitle="No works yet"
      emptyDescription="Import or create a work to begin structuring chapters and verses."
      columns={[
        { key: "code", label: "Code" },
        { key: "title", label: "Title" },
        { key: "slug", label: "Slug" },
        { key: "status", label: "Status" },
        { key: "updated", label: "Updated" },
      ]}
    />
  );
}
