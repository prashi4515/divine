import type { Metadata } from "next";
import Link from "next/link";
import { LocalizedModuleHeader } from "@/features/reading/localized-module-header";
import { WeaponCard } from "@/features/weapons/weapon-card";
import { SiteFooter } from "@/features/reading/site-footer";
import { SiteHeader } from "@/features/reading/site-header";
import {
  getWeapons,
  WEAPON_CATEGORY_ORDER,
  weaponCategory,
  weaponCategoryLabel,
  weaponFocus,
} from "@/lib/weapons/store";
import type { KnowledgeWeapon } from "@/lib/weapons/store";
import type { WeaponCategory } from "@/lib/knowledge/types";

export const dynamic = "force-static";
export const revalidate = false;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://divine.app";

export const metadata: Metadata = {
  title: "Weapons - Mahabharata Arsenal",
  description:
    "Astras, bows, maces, swords, spears, conches, chariots, and sacred arms from the Mahabharata, with clearly marked weapons from the wider Hindu tradition.",
  alternates: { canonical: "/weapons" },
  openGraph: {
    title: "Weapons - Mahabharata Arsenal",
    description:
      "A cited catalog of epic arms from the shared Knowledge Graph.",
    url: `${SITE_URL}/weapons`,
    type: "website",
  },
};

function groupByCategory(
  weapons: KnowledgeWeapon[],
): Array<{ category: WeaponCategory; items: KnowledgeWeapon[] }> {
  const map = new Map<WeaponCategory, KnowledgeWeapon[]>();
  for (const cat of WEAPON_CATEGORY_ORDER) map.set(cat, []);
  for (const w of weapons) {
    const cat = weaponCategory(w);
    const list = map.get(cat) ?? [];
    list.push(w);
    map.set(cat, list);
  }
  return WEAPON_CATEGORY_ORDER.map((category) => ({
    category,
    items: map.get(category) ?? [],
  })).filter((g) => g.items.length > 0);
}

export default async function WeaponsIndexPage() {
  const weapons = await getWeapons();
  const mahabharata = weapons.filter((w) => weaponFocus(w) === "mahabharata");
  const broader = weapons.filter((w) => weaponFocus(w) === "broader-hindu");
  const groups = groupByCategory(mahabharata);

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <LocalizedModuleHeader
          module="weapons"
          actionLinks={[
            { href: "/events", labelKey: "navEvents" },
            { href: "/encyclopedia/weapon", labelKey: "navEncyclopedia" },
          ]}
        />

        <section className="page-gutter pb-16 pt-4">
          <div className="mx-auto max-w-6xl space-y-12">
            <p className="text-muted-foreground text-sm">
              {mahabharata.length} Mahabharata weapons
              {broader.length > 0 ? ` · ${broader.length} broader tradition` : ""}
            </p>

            {groups.map((group) => (
              <div key={group.category} id={group.category}>
                <h2 className="text-saffron mb-4 text-[10px] font-medium uppercase tracking-[0.18em]">
                  {weaponCategoryLabel(group.category)}
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
                  Broader Hindu tradition
                </h2>
                <p className="text-muted-foreground mb-4 max-w-2xl text-sm leading-relaxed">
                  These arms belong chiefly to Vedic or Puranic tradition. They
                  appear here because the Mahabharata recalls them - not as
                  Kurukshetra battlefield staples.
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
      </main>
      <SiteFooter />
    </div>
  );
}
