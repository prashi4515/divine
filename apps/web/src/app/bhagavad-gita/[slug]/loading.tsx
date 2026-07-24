export default function ChapterLoading() {
  return (
    <div className="animate-pulse space-y-10 pt-2" aria-busy="true" aria-label="Loading chapter">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3">
        <div className="bg-muted h-3 w-24 rounded-full" />
        <div className="bg-muted h-8 w-40 rounded-md" />
        <div className="bg-muted h-10 w-72 max-w-full rounded-md" />
        <div className="bg-muted mt-2 h-4 w-full max-w-xl rounded" />
        <div className="bg-muted h-4 w-5/6 max-w-lg rounded" />
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm sm:p-8">
          <div className="bg-muted h-3 w-16 rounded" />
          <div className="mx-auto mt-8 max-w-3xl space-y-3">
            <div className="bg-muted mx-auto h-7 w-full rounded" />
            <div className="bg-muted mx-auto h-7 w-5/6 rounded" />
            <div className="bg-muted mx-auto h-7 w-4/6 rounded" />
          </div>
          <div className="bg-muted mt-10 h-9 w-full rounded-md" />
          <div className="mt-4 space-y-2">
            <div className="bg-muted h-4 w-full rounded" />
            <div className="bg-muted h-4 w-11/12 rounded" />
            <div className="bg-muted h-4 w-4/5 rounded" />
          </div>
        </div>
        <div className="border-border bg-card mt-6 hidden rounded-2xl border p-4 lg:mt-0 lg:block">
          <div className="bg-muted mb-3 h-3 w-28 rounded" />
          <div className="grid grid-cols-8 gap-1.5">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="bg-muted h-8 w-8 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
