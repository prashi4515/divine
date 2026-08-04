import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/seo/json-ld";
import { cn } from "@/lib/utils";

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

/**
 * Visible breadcrumb trail + semantic nav. Pair with breadcrumbJsonLd in page.
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("text-muted-foreground text-sm", className)}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.name}-${i}`} className="inline-flex items-center gap-1.5">
              {i > 0 ? (
                <span aria-hidden className="text-muted-foreground/60">
                  /
                </span>
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-foreground underline-offset-4 hover:underline"
                >
                  {item.name}
                </Link>
              ) : (
                <span
                  className={cn(isLast && "text-foreground font-medium")}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.name}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
