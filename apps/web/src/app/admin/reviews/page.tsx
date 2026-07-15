import { ClipboardCheck } from "lucide-react";
import { AdminResourcePage } from "@/features/admin/admin-resource-page";

export const metadata = { title: "Reviews" };

export default function AdminReviewsPage() {
  return (
    <AdminResourcePage
      title="Reviews"
      description="Reviewer queue. Approve, reject, and comment on submitted translations and content."
      actionLabel="Assign reviewer"
      searchPlaceholder="Search submissions…"
      filters={["Pending", "Approved", "Rejected"]}
      emptyIcon={ClipboardCheck}
      emptyTitle="Nothing to review"
      emptyDescription="Submitted content awaiting review will appear here."
      columns={[
        { key: "item", label: "Item" },
        { key: "type", label: "Type" },
        { key: "submittedBy", label: "Submitted by" },
        { key: "language", label: "Language" },
        { key: "status", label: "Status" },
        { key: "actions", label: "Actions" },
      ]}
    />
  );
}
