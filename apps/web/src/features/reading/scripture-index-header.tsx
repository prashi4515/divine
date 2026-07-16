"use client";

import Link from "next/link";
import {
  localizeWorkDescription,
  localizeWorkTitle,
  useMessages,
} from "@/lib/i18n/use-messages";

type ScriptureIndexHeaderProps = {
  work: { code: string; title: string; description: string | null };
};

export function ScriptureIndexHeader({ work }: ScriptureIndexHeaderProps) {
  const t = useMessages();
  const title = localizeWorkTitle(t, work);
  const description = localizeWorkDescription(t, work);

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 md:mb-5">
        <ol className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
          <li>
            <Link href="/" className="hover:text-foreground transition-divine">
              {t.home}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground">{title}</li>
        </ol>
      </nav>

      <header className="mx-auto max-w-2xl text-center">
        <p className="text-muted-foreground text-[11px] uppercase tracking-[0.18em]">
          {t.scripture}
        </p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground mt-3 text-pretty text-sm leading-relaxed sm:text-base">
            {description}
          </p>
        ) : null}
      </header>
    </>
  );
}
