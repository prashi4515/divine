import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
};

export function EmptyState({ icon: Icon, title, description, actionLabel }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="border-border bg-muted/40 mb-4 flex h-10 w-10 items-center justify-center rounded-md border">
          <Icon className="text-muted-foreground h-4 w-4" aria-hidden />
        </div>
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">{description}</p>
        {actionLabel ? (
          <Button disabled size="sm" className="mt-5">
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
