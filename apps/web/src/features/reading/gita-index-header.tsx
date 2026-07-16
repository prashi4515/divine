"use client";

import Link from "next/link";
import { localizeWorkTitle, useMessages } from "@/lib/i18n/use-messages";

type GitaIndexHeaderProps = {
  workCode?: string;
};

export function GitaIndexHeader({ workCode = "bg" }: GitaIndexHeaderProps) {
  const t = useMessages();
  const title = localizeWorkTitle(t, { code: workCode, title: t.gitaTitle });

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
        <p className="text-muted-foreground mt-3 text-pretty text-sm leading-relaxed sm:text-base">
          {t.gitaBlurb}
        </p>
      </header>
    </>
  );
}
