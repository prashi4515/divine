import { Button } from "@/components/ui/button";

type AdminPageHeaderProps = {
  title: string;
  description: string;
  actionLabel?: string;
};

/**
 * Page chrome for every admin route. Primary action is disabled — design only.
 */
export function AdminPageHeader({ title, description, actionLabel }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground max-w-2xl text-sm">{description}</p>
      </div>
      {actionLabel ? (
        <Button disabled size="sm" className="shrink-0 self-start">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
