"use client";

import { WeaponCard } from "@/features/weapons/weapon-card";
import { localizedWeaponCategoryLabel } from "@/lib/i18n/knowledge-labels";
import { useHubUiMessages, useUiLanguage } from "@/lib/i18n/use-messages";
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import type { WeaponCategory } from "@/lib/knowledge/types";
import type { KnowledgeWeapon } from "@/lib/weapons/helpers";

type Group = {
  category: WeaponCategory;
  label: string;
  items: KnowledgeWeapon[];
};

type Props = {
  mahabharataCount: number;
  broaderCount: number;
  groups: Group[];
  broader: KnowledgeWeapon[];
  initialLanguage?: ReadingLanguageCode;
};

export function WeaponsLandingBody({
  mahabharataCount,
  broaderCount,
  groups,
  broader,
  initialLanguage,
}: Props) {
  const t = useHubUiMessages(initialLanguage);
  const lang = useUiLanguage(initialLanguage);

  return (
    <section className="page-gutter pb-16 pt-4">
      <div className="mx-auto max-w-6xl space-y-12">
        <p className="text-muted-foreground text-sm">
          {t.mahabharataWeapons(mahabharataCount)}
          {broaderCount > 0
            ? ` · ${t.broaderTraditionCount(broaderCount)}`
            : ""}
        </p>

        {groups.map((group) => (
          <div key={group.category} id={group.category}>
            <h2 className="text-saffron mb-4 text-[10px] font-medium uppercase tracking-[0.16em]">
              {localizedWeaponCategoryLabel(group.category, lang)}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((weapon, i) => (
                <li key={weapon.id}>
                  <WeaponCard weapon={weapon} index={i} />
                </li>
              ))}
            </ul>
          </div>
        ))}

        {broader.length > 0 ? (
          <div id="broader-hindu">
            <h2 className="text-saffron mb-2 text-[10px] font-medium uppercase tracking-[0.18em]">
              {t.broaderHinduTradition}
            </h2>
            <p className="text-muted-foreground mb-4 max-w-2xl text-sm leading-relaxed">
              {t.broaderHinduBlurb}
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {broader.map((weapon, i) => (
                <li key={weapon.id}>
                  <WeaponCard weapon={weapon} index={i} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
