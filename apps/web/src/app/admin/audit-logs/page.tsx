import { ScrollText } from "lucide-react";
import { AdminResourcePage } from "@/features/admin/admin-resource-page";

export const metadata = { title: "Audit Logs" };

export default function AdminAuditLogsPage() {
  return (
    <AdminResourcePage
      title="Audit Logs"
      description="An immutable record of who did what, and when. Every mutation is tracked for accountability."
      searchPlaceholder="Search by user, action, or entity…"
      filters={["Action", "Entity", "Date"]}
      emptyIcon={ScrollText}
      emptyTitle="No audit entries yet"
      emptyDescription="Administrative and editorial actions will be recorded here."
      columns={[
        { key: "user", label: "User" },
        { key: "action", label: "Action" },
        { key: "entity", label: "Entity" },
        { key: "date", label: "Date" },
        { key: "ip", label: "IP" },
      ]}
    />
  );
}
