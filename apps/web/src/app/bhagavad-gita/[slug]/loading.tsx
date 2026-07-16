export default function ChapterLoading() {
  return (
    <div className="animate-pulse space-y-8 pt-4">
      <div className="mx-auto h-8 w-48 rounded-md bg-muted" />
      <div className="border-border bg-card rounded-xl border p-8">
        <div className="mx-auto h-4 w-20 rounded bg-muted" />
        <div className="mt-8 space-y-3">
          <div className="h-6 rounded bg-muted" />
          <div className="h-6 w-5/6 rounded bg-muted" />
          <div className="h-6 w-4/6 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
