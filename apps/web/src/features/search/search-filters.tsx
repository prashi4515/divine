"use client";

import {
  KNOWLEDGE_SEARCH_GROUP_LABELS,
  KNOWLEDGE_SEARCH_GROUPS,
  type KnowledgeSearchGroup,
} from "@divine/types";

type SearchFiltersProps = {
  group?: KnowledgeSearchGroup;
  onGroupChange: (group: KnowledgeSearchGroup | undefined) => void;
};

export function SearchFilters({ group, onGroupChange }: SearchFiltersProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-muted-foreground mb-2 text-[11px] uppercase tracking-[0.16em]">
          Groups
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            aria-pressed={!group}
            onClick={() => onGroupChange(undefined)}
            className={[
              "inline-flex cursor-pointer items-center rounded-md px-2.5 py-1 text-xs tracking-wide transition-divine",
              !group
                ? "bg-foreground text-background"
                : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
            ].join(" ")}
          >
            All
          </button>
          {KNOWLEDGE_SEARCH_GROUPS.map((g) => {
            const active = group === g;
            return (
              <button
                key={g}
                type="button"
                aria-pressed={active}
                onClick={() => onGroupChange(active ? undefined : g)}
                className={[
                  "inline-flex cursor-pointer items-center rounded-md px-2.5 py-1 text-xs tracking-wide transition-divine",
                  active
                    ? "bg-foreground text-background"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                {KNOWLEDGE_SEARCH_GROUP_LABELS[g]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
