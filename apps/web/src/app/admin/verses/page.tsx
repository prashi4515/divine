import { BookOpen } from "lucide-react";
import { AdminResourcePage } from "@/features/admin/admin-resource-page";

export const metadata = { title: "Verses" };

export default function AdminVersesPage() {
  return (
    <AdminResourcePage
      title="Verses"
      description="Atomic scripture units with stable public IDs (bg.2.47). Sanskrit lives here; meaning lives in Translations."
      actionLabel="Add verse"
      searchPlaceholder="Search public ID or Sanskrit…"
      filters={["Chapter", "Published"]}
      emptyIcon={BookOpen}
      emptyTitle="No verses yet"
      emptyDescription="The verse catalog is empty until the content pipeline runs."
      showLoadingPreview
      columns={[
        { key: "publicId", label: "Public ID" },
        { key: "chapter", label: "Chapter" },
        { key: "number", label: "No." },
        { key: "sanskrit", label: "Sanskrit" },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
