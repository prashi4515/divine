import type { LucideIcon } from "lucide-react";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { AdminToolbar } from "@/features/admin/admin-toolbar";
import { DataTablePlaceholder } from "@/features/admin/data-table-placeholder";
import { TableSkeleton } from "@/features/admin/skeletons";

type Column = { key: string; label: string; className?: string };

type AdminResourcePageProps = {
  title: string;
  description: string;
  actionLabel: string;
  searchPlaceholder: string;
  filters: string[];
  columns: Column[];
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  /** Static design preview of the loading skeleton. */
  showLoadingPreview?: boolean;
};

export function AdminResourcePage({
  title,
  description,
  actionLabel,
  searchPlaceholder,
  filters,
  columns,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  showLoadingPreview = false,
}: AdminResourcePageProps) {
  return (
    <div className="space-y-6">
      <AdminPageHeader title={title} description={description} actionLabel={actionLabel} />
      <AdminToolbar searchPlaceholder={searchPlaceholder} filters={filters} />
      {showLoadingPreview ? (
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs uppercase tracking-wider">
            Loading state (design)
          </p>
          <TableSkeleton columns={Math.min(columns.length, 4)} />
        </div>
      ) : null}
      <DataTablePlaceholder
        title={title}
        description="Column layout reserved for the upcoming content API."
        columns={columns}
        emptyIcon={emptyIcon}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
    </div>
  );
}
