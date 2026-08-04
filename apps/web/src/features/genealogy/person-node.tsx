"use client";

import * as React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Person } from "@/lib/genealogy/types";
import {
  CATEGORY_TOKENS,
} from "@/lib/genealogy/types";
import { localizedPersonCategoryLabel } from "@/lib/i18n/knowledge-labels";
import { useUiLanguage } from "@/lib/i18n/use-messages";
import { cn } from "@/lib/utils";

/**
 * PersonNode — the visible card for every graph vertex.
 * Category-tinted top ring; category badge; portrait placeholder; Sanskrit +
 * Latin name; hover lift; focus ring. Memoised — parent re-renders never
 * cause a re-layout unless data changes.
 */

export type PersonNodeData = {
  person: Person;
  onOpen: (id: string) => void;
  isDimmed: boolean;
  isHighlighted: boolean;
  isRoot: boolean;
};

function PersonNodeInner({
  data,
  selected,
}: NodeProps & { data: PersonNodeData }) {
  const lang = useUiLanguage();
  const { person, onOpen, isDimmed, isHighlighted, isRoot } = data;
  const tokens = CATEGORY_TOKENS[person.category];
  const placeholder = person.imagePlaceholder ?? "◈";

  return (
    <button
      type="button"
      onClick={() => onOpen(person.id)}
      aria-label={`${person.name} — ${localizedPersonCategoryLabel(person.category, lang)}`}
      className={cn(
        "group border-border/80 bg-card/95 relative flex w-[200px] flex-col items-start gap-1.5 rounded-xl border px-3 py-2.5 text-left shadow-xs transition-divine",
        "backdrop-blur-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        selected || isHighlighted
          ? "translate-y-[-2px] shadow-md"
          : "hover:-translate-y-0.5 hover:shadow-md",
        isDimmed && "opacity-40",
      )}
      style={{
        borderColor:
          selected || isHighlighted ? tokens.ring : undefined,
        boxShadow:
          selected || isHighlighted
            ? `0 0 0 2px ${tokens.ring}55, 0 8px 20px -12px ${tokens.accent}44`
            : undefined,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-0 !bg-transparent"
        isConnectable={false}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-0 !bg-transparent"
        isConnectable={false}
      />

      <span
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-xl"
        style={{ background: tokens.accent }}
        aria-hidden
      />

      <div className="flex w-full items-center gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg leading-none"
          style={{
            background: tokens.tint,
            color: tokens.accent,
          }}
          aria-hidden
        >
          {placeholder}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-[13px] font-medium leading-tight">
            {person.name}
          </p>
          {person.sanskritName && (
            <p
              className="indic-display text-muted-foreground truncate font-serif text-[11px] leading-tight"
              lang="sa"
            >
              {person.sanskritName}
            </p>
          )}
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-1">
        <span
          className="rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider"
          style={{
            background: tokens.tint,
            color: tokens.accent,
          }}
        >
          {localizedPersonCategoryLabel(person.category, lang)}
        </span>
        <span className="flex items-center gap-1">
          {hasVerifiedEdge(person) && (
            <span
              className="rounded-full border border-emerald-700/25 bg-emerald-50 px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-wider text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100"
              title="Has scripture-verified relationships"
            >
              Verified
            </span>
          )}
          {isRoot && (
            <span className="text-muted-foreground/80 text-[9px] uppercase tracking-wider">
              Root
            </span>
          )}
        </span>
      </div>
      {person.primaryScripture && (
        <p className="text-muted-foreground/80 w-full truncate text-[9px] leading-tight">
          {person.primaryScripture}
        </p>
      )}
    </button>
  );
}

function hasVerifiedEdge(person: Person): boolean {
  return person.relationships.some((r) => r.confidence === "verified");
}

export const PersonNode = React.memo(PersonNodeInner);
