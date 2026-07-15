import { Suspense } from "react";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { ChaptersTable } from "@/features/admin/chapters-table";
import { TableSkeleton } from "@/features/admin/skeletons";
import { ApiError } from "@/lib/api/client";
import { getPublishedChapters } from "@/lib/api/chapters";

export const metadata = { title: "Chapters" };

function ChaptersError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="border-destructive/40 bg-destructive/5 text-destructive rounded-md border px-4 py-3 text-sm"
    >
      {message}
    </div>
  );
}

async function ChaptersSection() {
  try {
    const chapters = await getPublishedChapters();
    return <ChaptersTable chapters={chapters} />;
  } catch (error: unknown) {
    let message = "Something went wrong while loading chapters.";
    if (error instanceof ApiError) {
      message =
        error.status === 0
          ? `Could not reach the API (${error.message}).`
          : `The API returned ${error.status}.`;
    } else if (error instanceof Error) {
      message = error.message;
    }
    return <ChaptersError message={message} />;
  }
}

export default function AdminChaptersPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Chapters"
        description="Locale-independent chapter structure within a work (e.g. bg.1 … bg.18). Read-only — backed by the live API."
      />
      <Suspense fallback={<TableSkeleton columns={6} />}>
        <ChaptersSection />
      </Suspense>
    </div>
  );
}
