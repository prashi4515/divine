import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Column = { key: string; label: string; className?: string };

type DataTablePlaceholderProps = {
  title: string;
  description: string;
  columns: Column[];
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
};

/**
 * Table chrome with headers + in-table empty state.
 * Real rows arrive when CRUD is wired later.
 */
export function DataTablePlaceholder({
  title,
  description,
  columns,
  emptyIcon: Icon,
  emptyTitle,
  emptyDescription,
}: DataTablePlaceholderProps) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <Badge variant="outline">0 rows</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-border bg-muted/40 border-b">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`text-muted-foreground px-6 py-3 font-medium ${col.className ?? ""}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="px-6 py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="border-border bg-muted/40 mb-3 flex h-9 w-9 items-center justify-center rounded-md border">
                      <Icon className="text-muted-foreground h-4 w-4" aria-hidden />
                    </div>
                    <p className="text-sm font-medium">{emptyTitle}</p>
                    <p className="text-muted-foreground mt-1 max-w-sm text-sm">{emptyDescription}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
