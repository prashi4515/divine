type ReadingErrorProps = {
  title?: string;
  message: string;
};

export function ReadingError({
  title = "Unable to load",
  message,
}: ReadingErrorProps) {
  return (
    <div
      role="alert"
      className="border-border bg-muted/20 rounded-xl border px-6 py-14 text-center"
    >
      <p className="font-serif text-xl tracking-tight">{title}</p>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{message}</p>
      <p className="text-muted-foreground mt-4 text-xs">
        Ensure the API is running and <span className="font-mono">DIVINE_API_URL</span> is set.
      </p>
    </div>
  );
}
