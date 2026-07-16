"use client";

import Link from "next/link";
import type { Work } from "@divine/types";
import { ArrowRight } from "lucide-react";
import {
  localizeWorkDescription,
  localizeWorkTitle,
  useMessages,
} from "@/lib/i18n/use-messages";
import { publicWorkPath } from "@/lib/reading/work-paths";

type PublishedScripturesProps = {
  works: Work[];
};

/**
 * Public catalog of every published work — CMS publish status drives this list.
 */
export function PublishedScriptures({ works }: PublishedScripturesProps) {
  const t = useMessages();
  if (works.length === 0) return null;

  return (
    <section
      aria-labelledby="published-scriptures-heading"
      className="mx-auto w-full max-w-3xl px-6 pb-28"
    >
      <h2
        id="published-scriptures-heading"
        className="font-serif text-2xl tracking-tight sm:text-3xl"
      >
        {t.scriptures}
      </h2>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        {t.scripturesHint}
      </p>
      <ul className="mt-8 divide-y divide-border border-y border-border">
        {works.map((work) => (
          <li key={work.id}>
            <Link
              href={publicWorkPath(work)}
              className="group flex items-start justify-between gap-4 py-5 transition-colors hover:bg-muted/30"
            >
              <div className="min-w-0">
                <p className="font-serif text-xl tracking-tight group-hover:underline">
                  {localizeWorkTitle(t, work)}
                </p>
                {localizeWorkDescription(t, work) ? (
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-relaxed">
                    {localizeWorkDescription(t, work)}
                  </p>
                ) : null}
              </div>
              <span className="text-muted-foreground mt-1 flex shrink-0 items-center gap-2 text-xs">
                <span className="font-mono">{work.code}</span>
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
