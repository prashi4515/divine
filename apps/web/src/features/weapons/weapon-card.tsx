import Link from "next/link";
import type { KnowledgeWeapon } from "@/lib/weapons/store";
import { weaponHref } from "@/lib/weapons/store";
import {
  displayEnglishName,
  toModernEnglish,
} from "@/lib/text/modern-english";
import { cn } from "@/lib/utils";

export function WeaponCard({
  weapon,
  index = 0,
}: {
  weapon: KnowledgeWeapon;
  index?: number;
}) {
  const title = displayEnglishName(weapon);
  const category = weapon.weapon?.category
    ? toModernEnglish(weapon.weapon.category.replace(/-/g, " "))
    : "Weapon";

  return (
    <Link
      href={weaponHref(weapon)}
      style={{ ["--card-index" as string]: index }}
      className={cn(
        "group border-border/70 bg-card relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 shadow-xs",
        "hover:border-saffron/40 transition-divine hover:-translate-y-0.5 hover:shadow-md",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
      )}
    >
      <span
        className="absolute inset-x-0 top-0 h-0.5 bg-[#5c4030]"
        aria-hidden
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#5c4030]">
          {category}
        </span>
        {weapon.weapon?.focus === "broader-hindu" ? (
          <span className="text-muted-foreground text-[10px] uppercase tracking-[0.14em]">
            · Broader tradition
          </span>
        ) : null}
      </div>
      <h3 className="text-foreground mt-2 font-serif text-lg leading-tight tracking-tight">
        {title}
      </h3>
      <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">
        {toModernEnglish(weapon.summary)}
      </p>
      <p className="text-muted-foreground mt-3 text-[11px]">
        {toModernEnglish(weapon.primaryScripture)}
      </p>
    </Link>
  );
}
