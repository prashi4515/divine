import type { LucideIcon } from "lucide-react";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { EmptyState } from "@/features/admin/empty-state";

type AdminPlaceholderProps = {
  title: string;
  description: string;
  actionLabel?: string;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  /** Optional content rendered between the header and the empty state. */
  children?: React.ReactNode;
};

/**
 * Standard scaffold for a section whose data API does not exist yet:
 * page header + optional preview content + honest empty state.
 */
export function AdminPlaceholder({
  title,
  description,
  actionLabel,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  children,
}: AdminPlaceholderProps) {
  return (
    <div className="space-y-6">
      <AdminPageHeader title={title} description={description} actionLabel={actionLabel} />
      {children}
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    </div>
  );
}
