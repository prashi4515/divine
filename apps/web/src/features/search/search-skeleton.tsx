import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading placeholder for the search route — mirrors the results layout so the
 * page doesn't visibly jump when data streams in.
 */
export function SearchSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl" aria-hidden>
      <Skeleton className="mx-auto mt-6 h-11 w-full rounded-lg" />

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>

      <ul className="mt-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <li
            key={i}
            className="border-border bg-card rounded-xl border p-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="mt-4 h-5 w-3/4" />
            <Skeleton className="mt-2.5 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
          </li>
        ))}
      </ul>
    </div>
  );
}
