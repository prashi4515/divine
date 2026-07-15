import { Skeleton } from "@/components/ui/skeleton";

export function ChapterGridSkeleton() {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="border-border bg-card flex flex-col rounded-xl border p-6 shadow-xs"
        >
          <div className="flex items-start justify-between">
            <Skeleton className="h-14 w-16 rounded-md" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="mt-6 h-7 w-3/4" />
          <Skeleton className="mt-3 h-4 w-20" />
          <Skeleton className="mt-10 h-8 w-16" />
        </li>
      ))}
    </ul>
  );
}
