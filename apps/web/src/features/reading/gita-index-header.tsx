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
        <p className="text-saffron text-[11px] font-medium uppercase tracking-[0.18em]">
          {t.scripture}
        </p>
        <h1 className="indic-display mt-2 font-serif text-3xl sm:text-4xl md:text-5xl">
          {title}
        </h1>

        <div
          className="mx-auto mt-4 flex items-center justify-center gap-3"
          aria-hidden
        >
          <span
            className="h-px w-10"
            style={{
              background:
                "linear-gradient(90deg, transparent, hsl(var(--saffron) / 0.6))",
            }}
          />
          <span className="text-saffron font-serif text-sm leading-none">ॐ</span>
          <span
            className="h-px w-10"
            style={{
              background:
                "linear-gradient(90deg, hsl(var(--saffron) / 0.6), transparent)",
            }}
          />
        </div>

        <p className="text-muted-foreground mt-4 text-pretty text-sm leading-relaxed sm:text-base">
          {t.gitaBlurb}
        </p>
      </header>
    </>
  );
}
