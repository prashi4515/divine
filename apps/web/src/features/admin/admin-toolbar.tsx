import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type AdminToolbarProps = {
  searchPlaceholder: string;
  filters?: string[];
};

/**
 * Search + filter chips. Non-functional placeholders for the design system.
 */
export function AdminToolbar({ searchPlaceholder, filters = [] }: AdminToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full max-w-sm">
        <Search className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          readOnly
          placeholder={searchPlaceholder}
          className="pl-8"
          aria-label="Search (design placeholder)"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <Button key={filter} variant="outline" size="sm" disabled>
            {filter}
            <Badge variant="muted" className="ml-1.5 font-normal">
              —
            </Badge>
          </Button>
        ))}
      </div>
    </div>
  );
}
