/**
 * Normalize Knowledge Graph entities for reader-facing modern English.
 * Applied once when the store loads so every module gets clean copy.
 */
import type {
  KnowledgeEntity,
  KnowledgeRelation,
  KnowledgeCollection,
  ScriptureReference,
} from "@/lib/knowledge/types";
import { toModernEnglish } from "@/lib/text/modern-english";

function modernizeStrings(list: string[] | undefined): string[] {
  if (!list) return [];
  return list.map((s) => toModernEnglish(s)).filter(Boolean);
}

function modernizeOptional(text: string | undefined): string | undefined {
  if (text === undefined) return undefined;
  return toModernEnglish(text);
}

function modernizeCitation(ref: ScriptureReference): ScriptureReference {
  return {
    ...ref,
    work: toModernEnglish(ref.work),
    section: modernizeOptional(ref.section),
    chapter: modernizeOptional(ref.chapter),
    verse: modernizeOptional(ref.verse),
    note: modernizeOptional(ref.note),
  };
}

export function modernizeKnowledgeEntity(
  entity: KnowledgeEntity,
): KnowledgeEntity {
  const displayName = toModernEnglish(entity.englishName || entity.name);

  return {
    ...entity,
    name: displayName,
    englishName: displayName,
    // Keep scholarly forms for search / deep tooling; UI should not surface them.
    epithet: modernizeOptional(entity.epithet),
    summary: toModernEnglish(entity.summary),
    description: toModernEnglish(entity.description),
    aliases: modernizeStrings(entity.aliases),
    primaryScripture: toModernEnglish(entity.primaryScripture),
    scriptureSources: (entity.scriptureSources ?? []).map(modernizeCitation),
    notes: modernizeOptional(entity.notes),
    seo: entity.seo
      ? {
          ...entity.seo,
          title: modernizeOptional(entity.seo.title),
          description: modernizeOptional(entity.seo.description),
        }
      : entity.seo,
    atlas: entity.atlas
      ? {
          ...entity.atlas,
          kingdom: modernizeOptional(entity.atlas.kingdom),
          modernLocation: toModernEnglish(entity.atlas.modernLocation),
          scripturalSignificance: modernizeOptional(
            entity.atlas.scripturalSignificance,
          ),
        }
      : entity.atlas,
    concept: entity.concept
      ? {
          ...entity.concept,
          definition: toModernEnglish(entity.concept.definition),
          meaning: toModernEnglish(entity.concept.meaning),
          etymology: modernizeOptional(entity.concept.etymology),
          examples: modernizeStrings(entity.concept.examples),
        }
      : entity.concept,
    weapon: entity.weapon
      ? {
          ...entity.weapon,
          powers: modernizeStrings(entity.weapon.powers),
          notableUses: modernizeStrings(entity.weapon.notableUses),
          counters: modernizeStrings(entity.weapon.counters),
        }
      : entity.weapon,
    variantTraditions: (entity.variantTraditions ?? []).map((v) => ({
      ...v,
      label: toModernEnglish(v.label),
      description: toModernEnglish(v.description),
      sources: (v.sources ?? []).map(modernizeCitation),
    })),
  };
}

export function modernizeKnowledgeRelation(
  relation: KnowledgeRelation,
): KnowledgeRelation {
  return {
    ...relation,
    note: modernizeOptional(relation.note),
    sources: (relation.sources ?? []).map(modernizeCitation),
  };
}

export function modernizeKnowledgeCollection(
  collection: KnowledgeCollection,
): KnowledgeCollection {
  return {
    ...collection,
    title: toModernEnglish(collection.title),
    eyebrow: modernizeOptional(collection.eyebrow),
    summary: toModernEnglish(collection.summary),
    description: toModernEnglish(collection.description),
    scriptureSources: (collection.scriptureSources ?? []).map(modernizeCitation),
    faq: collection.faq?.map((item) => ({
      question: toModernEnglish(item.question),
      answer: toModernEnglish(item.answer),
    })),
    seo: collection.seo
      ? {
          ...collection.seo,
          title: modernizeOptional(collection.seo.title),
          description: modernizeOptional(collection.seo.description),
        }
      : collection.seo,
  };
}
