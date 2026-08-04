import type { Metadata } from "next";
import { buildPageMetadata, hubIndexSeo } from "@/lib/seo";
import { LocalizedModuleHeader } from "@/features/reading/localized-module-header";
import { WeaponsLandingBody } from "@/features/weapons/weapons-landing-body";
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

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata(hubIndexSeo("weapons"));

function groupByCategory(
  weapons: KnowledgeWeapon[],
): Array<{ category: WeaponCategory; label: string; items: KnowledgeWeapon[] }> {
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
    label: weaponCategoryLabel(category),
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
        <WeaponsLandingBody
          mahabharataCount={mahabharata.length}
          broaderCount={broader.length}
          groups={groups}
          broader={broader}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
