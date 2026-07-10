import { FolderTree } from "lucide-react";
import { AdminResourcePage } from "@/features/admin/admin-resource-page";

export const metadata = { title: "Chapters" };

export default function AdminChaptersPage() {
  return (
    <AdminResourcePage
      title="Chapters"
      description="Locale-independent chapter structure within a work (e.g. bg.1 … bg.18)."
      actionLabel="Add chapter"
      searchPlaceholder="Search by public ID or number…"
      filters={["Work", "Published"]}
      emptyIcon={FolderTree}
      emptyTitle="No chapters yet"
      emptyDescription="Chapters appear after a work exists and content is imported."
      columns={[
        { key: "publicId", label: "Public ID" },
        { key: "work", label: "Work" },
        { key: "number", label: "Number" },
        { key: "verses", label: "Verses" },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
