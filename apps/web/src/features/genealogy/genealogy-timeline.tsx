"use client";

import * as React from "react";
import { CATEGORY_LABELS, CATEGORY_TOKENS, type Era, type Person } from "@/lib/genealogy/types";
import { cn } from "@/lib/utils";

const ERA_ORDER: Era[] = [
  "pre-creation",
  "creation",
  "satya-yuga",
  "treta-yuga",
  "dvapara-yuga",
  "kali-yuga",
  "eternal",
  "unspecified",
];

const ERA_LABELS: Record<Era, string> = {
  "pre-creation": "Before creation",
  creation: "Creation",
  "satya-yuga": "Satya Yuga",
  "treta-yuga": "Treta Yuga",
  "dvapara-yuga": "Dvapara Yuga",
  "kali-yuga": "Kali Yuga",
  eternal: "Eternal / beyond yugas",
  unspecified: "Unspecified era",
};

/**
 * Chronological reading of a module — groups people by Purāṇic era.
 * Complements the graph view; does not invent dates.
 */
export function GenealogyTimeline({
  people,
  selectedId,
  onSelect,
}: {
  people: readonly Person[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const groups = React.useMemo(() => {
    const map = new Map<Era, Person[]>();
    for (const era of ERA_ORDER) map.set(era, []);
    for (const person of people) {
      const era = person.era ?? "unspecified";
      const list = map.get(era) ?? [];
      list.push(person);
      map.set(era, list);
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          b.importance - a.importance || a.name.localeCompare(b.name),
      );
    }
    return ERA_ORDER.filter((era) => (map.get(era)?.length ?? 0) > 0).map(
      (era) => ({ era, people: map.get(era)! }),
    );
  }, [people]);

  return (
    <div className="h-full overflow-y-auto px-4 py-5 sm:px-6">
      <p className="text-muted-foreground mb-6 max-w-2xl text-xs leading-relaxed">
        Timeline mode groups figures by traditional cosmological era (yuga /
        kalpa). These are scriptural categories, not modern calendar dates —
        sources often disagree on sequence, so treat this as a reading aid.
      </p>
      <ol className="relative space-y-8 border-l border-border/70 pl-6">
        {groups.map(({ era, people: row }) => (
          <li key={era} className="relative">
            <span
              className="bg-saffron absolute -left-[0.34rem] top-1.5 h-2.5 w-2.5 rounded-full"
              aria-hidden
            />
            <h3 className="text-saffron text-[11px] font-medium uppercase tracking-[0.18em]">
              {ERA_LABELS[era]}
            </h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {row.map((person) => {
                const token = CATEGORY_TOKENS[person.category];
                const active = selectedId === person.id;
                return (
                  <li key={person.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(person.id)}
                      className={cn(
                        "border-border/70 bg-card hover:border-saffron/40 w-full rounded-xl border px-3 py-2.5 text-left transition-divine",
                        active && "border-saffron/60 ring-1 ring-saffron/30",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
                          style={{ background: token.tint, color: token.accent }}
                          aria-hidden
                        >
                          {person.imagePlaceholder ?? "ॐ"}
                        </span>
                        <span className="min-w-0">
                          <span className="text-foreground block truncate text-sm font-medium">
                            {person.name}
                          </span>
                          <span className="text-muted-foreground block truncate text-[11px]">
                            {CATEGORY_LABELS[person.category]}
                            {person.sanskritName
                              ? ` · ${person.sanskritName}`
                              : ""}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
