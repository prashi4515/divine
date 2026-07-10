import { Languages } from "lucide-react";
import { AdminResourcePage } from "@/features/admin/admin-resource-page";

export const metadata = { title: "Languages" };

export default function AdminLanguagesPage() {
  return (
    <AdminResourcePage
      title="Languages"
      description="BCP-47 language catalog used by translations and future UI locales."
      actionLabel="Add language"
      searchPlaceholder="Search by code or name…"
      filters={["Published"]}
      emptyIcon={Languages}
      emptyTitle="No languages yet"
      emptyDescription="Seed en and hi first — more Indian languages follow."
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Name" },
        { key: "native", label: "Native name" },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
