import { FileText } from "lucide-react";
import { AdminResourcePage } from "@/features/admin/admin-resource-page";

export const metadata = { title: "Translations" };

export default function AdminTranslationsPage() {
  return (
    <AdminResourcePage
      title="Translations"
      description="Meaning of a verse for a language × translation source. Never conflate locale with source."
      actionLabel="Add translation"
      searchPlaceholder="Search translation text…"
      filters={["Language", "Source", "Published"]}
      emptyIcon={FileText}
      emptyTitle="No translations yet"
      emptyDescription="Add languages and sources first, then attach translations to verses."
      columns={[
        { key: "verse", label: "Verse" },
        { key: "language", label: "Language" },
        { key: "source", label: "Source" },
        { key: "preview", label: "Preview" },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
