import { Users } from "lucide-react";
import { AdminResourcePage } from "@/features/admin/admin-resource-page";

export const metadata = { title: "Users" };

export default function AdminUsersPage() {
  return (
    <AdminResourcePage
      title="Users"
      description="Team members, roles, and access. Invite, deactivate, assign roles, and reset passwords."
      actionLabel="Invite user"
      searchPlaceholder="Search by name or email…"
      filters={["Role", "Status"]}
      emptyIcon={Users}
      emptyTitle="No users yet"
      emptyDescription="Invite your first team member to collaborate on content."
      columns={[
        { key: "user", label: "User" },
        { key: "email", label: "Email" },
        { key: "roles", label: "Roles" },
        { key: "status", label: "Status" },
        { key: "lastLogin", label: "Last login" },
        { key: "actions", label: "Actions" },
      ]}
    />
  );
}
