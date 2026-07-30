import type { KnowledgeEntity } from "@/lib/knowledge/types";
import {
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_LABELS,
  WEAPON_FOCUS_LABELS,
  type WeaponCategory,
  type WeaponFocus,
} from "@/lib/knowledge/types";

export type KnowledgeWeapon = KnowledgeEntity & {
  kind: "weapon";
};

export function isKnowledgeWeapon(
  entity: KnowledgeEntity,
): entity is KnowledgeWeapon {
  return entity.kind === "weapon" && entity.status === "published";
}

export function weaponHref(
  entity: Pick<KnowledgeEntity, "slug"> | string,
): string {
  const slug = typeof entity === "string" ? entity : entity.slug;
  return `/weapons/${slug}`;
}

export function weaponCategory(entity: KnowledgeEntity): WeaponCategory {
  return entity.weapon?.category ?? "sacred-object";
}

export function weaponFocus(entity: KnowledgeEntity): WeaponFocus {
  return entity.weapon?.focus ?? "mahabharata";
}

export function weaponCategoryLabel(category: WeaponCategory): string {
  return WEAPON_CATEGORY_LABELS[category];
}

export function weaponFocusLabel(focus: WeaponFocus): string {
  return WEAPON_FOCUS_LABELS[focus];
}

/** Stable catalog order for hub grouping. */
export const WEAPON_CATEGORY_ORDER: readonly WeaponCategory[] = WEAPON_CATEGORIES;
