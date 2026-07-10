import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <Card>
      <CardHeader className="space-y-3 border-b pb-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-64" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-border divide-y">
          {Array.from({ length: rows }).map((_, row) => (
            <div key={row} className="grid grid-cols-2 gap-4 px-6 py-3.5 md:grid-cols-4">
              {Array.from({ length: columns }).map((__, col) => (
                <Skeleton key={col} className="h-4 w-full max-w-[9rem]" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatSkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-3 w-20" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
