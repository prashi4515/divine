import Link from "next/link";

type TopicChipProps = {
  slug: string;
  name: string;
  active?: boolean;
  href?: string;
};

export function TopicChip({ slug, name, active, href }: TopicChipProps) {
  const className = [
    "inline-flex items-center rounded-md px-2.5 py-1 text-xs tracking-wide transition-divine",
    active
      ? "bg-foreground text-background"
      : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted",
  ].join(" ");

  if (href) {
    return (
      <Link href={href} className={className} data-topic={slug}>
        {name}
      </Link>
    );
  }

  return (
    <span className={className} data-topic={slug}>
      {name}
    </span>
  );
}
