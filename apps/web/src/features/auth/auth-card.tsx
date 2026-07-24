import Link from "next/link";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/**
 * Shared shell for authentication screens — calm, centered, brand-led.
 */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none"
        >
          <span
            className="border-border bg-background/80 flex h-9 w-9 items-center justify-center rounded-lg border shadow-xs"
            aria-hidden
          >
            <span className="font-serif text-base leading-none">ॐ</span>
          </span>
          <span className="font-serif text-2xl tracking-tight">
            Bhagavad Gita
          </span>
        </Link>
      </div>

      <div className="border-border bg-card rounded-xl border p-6 shadow-xs sm:p-8">
        <h1 className="font-serif text-2xl tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>

      {footer ? (
        <p className="text-muted-foreground mt-6 text-center text-sm">{footer}</p>
      ) : null}
    </div>
  );
}
