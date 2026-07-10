import { Heart } from "lucide-react";
import { AdminResourcePage } from "@/features/admin/admin-resource-page";

export const metadata = { title: "Emotions" };

export default function AdminEmotionsPage() {
  return (
    <AdminResourcePage
      title="Emotions"
      description="Emotion catalog for feeling-based discovery. Mapped to verses through VerseEmotion."
      actionLabel="Add emotion"
      searchPlaceholder="Search emotions…"
      filters={["Published"]}
      emptyIcon={Heart}
      emptyTitle="No emotions yet"
      emptyDescription="Define the emotion taxonomy before wiring emotion search."
      columns={[
        { key: "slug", label: "Slug" },
        { key: "name", label: "Name" },
        { key: "status", label: "Status" },
        { key: "updated", label: "Updated" },
      ]}
    />
  );
}
