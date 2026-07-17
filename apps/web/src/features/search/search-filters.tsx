"use client";

const FILTER_TOPICS = [
  { slug: "karma", name: "Karma" },
  { slug: "bhakti", name: "Bhakti" },
  { slug: "jnana", name: "Jnana" },
  { slug: "mind", name: "Mind" },
  { slug: "meditation", name: "Meditation" },
  { slug: "soul", name: "Soul" },
  { slug: "death", name: "Death" },
  { slug: "duty", name: "Duty" },
  { slug: "detachment", name: "Detachment" },
] as const;

const LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "te", label: "Telugu" },
  { code: "sa", label: "Sanskrit" },
] as const;

type SearchFiltersProps = {
  topic?: string;
  lang?: string;
  onTopicChange: (topic: string | undefined) => void;
  onLangChange: (lang: string) => void;
};

export function SearchFilters({
  topic,
  lang = "en",
  onTopicChange,
  onLangChange,
}: SearchFiltersProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-muted-foreground mb-2 text-[11px] uppercase tracking-[0.16em]">
          Topics
        </p>
        <div className="flex flex-wrap gap-1.5">
          {FILTER_TOPICS.map((t) => {
            const active = topic === t.slug;
            return (
              <button
                key={t.slug}
                type="button"
                aria-pressed={active}
                onClick={() => onTopicChange(active ? undefined : t.slug)}
                className={[
                  "inline-flex cursor-pointer items-center rounded-md px-2.5 py-1 text-xs tracking-wide transition-divine",
                  active
                    ? "bg-foreground text-background"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-muted-foreground mb-2 text-[11px] uppercase tracking-[0.16em]">
          Translation
        </p>
        <div className="flex flex-wrap gap-1.5">
          {LANGS.map((l) => {
            const active = lang === l.code;
            return (
              <button
                key={l.code}
                type="button"
                aria-pressed={active}
                onClick={() => onLangChange(l.code)}
                className={[
                  "inline-flex cursor-pointer items-center rounded-md px-2.5 py-1 text-xs tracking-wide transition-divine",
                  active
                    ? "bg-foreground text-background"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
