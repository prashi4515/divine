import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Publishing" };

const COLUMNS = [
  "Draft",
  "Review",
  "Approved",
  "Scheduled",
  "Published",
  "Archived",
] as const;

export default function AdminPublishingPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Publishing"
        description="The editorial workflow board. Move content through draft, review, approval, scheduling, and publication."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {COLUMNS.map((column) => (
          <section
            key={column}
            aria-label={column}
            className="border-border bg-muted/20 rounded-lg border p-3"
          >
            <header className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium">{column}</h2>
              <Badge variant="muted">0</Badge>
            </header>
            <div className="border-border/60 text-muted-foreground rounded-md border border-dashed px-3 py-8 text-center text-xs">
              No items
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
