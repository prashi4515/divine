/**
 * Concepts module — all sections resolve from shared Knowledge Graph JSON.
 * No Neon. No parallel concepts dataset.
 */
import "server-only";
import {
  getAllEntities,
  getRelated,
  type RelatedEdge,
} from "@/lib/knowledge/store";
import type { KnowledgeEntity } from "@/lib/knowledge/types";
import {
  gitaChapterHref,
  isKnowledgeEvent,
  verseReaderHref,
  type KnowledgeEvent,
} from "@/lib/events/helpers";
import { isCharacterEntity } from "@/lib/encyclopedia/character-kinds";
import {
  isKnowledgeConcept,
  type KnowledgeConcept,
} from "@/lib/concepts/helpers";

export type { KnowledgeConcept } from "@/lib/concepts/helpers";
export { conceptHref, isKnowledgeConcept } from "@/lib/concepts/helpers";

export async function getConcepts(): Promise<KnowledgeConcept[]> {
  const all = await getAllEntities();
  return all
    .filter(isKnowledgeConcept)
    .sort(
      (a, b) =>
        b.importance - a.importance || a.name.localeCompare(b.name, "en"),
    );
}

export async function getConceptBySlug(
  slug: string,
): Promise<KnowledgeConcept | null> {
  const concepts = await getConcepts();
  return concepts.find((c) => c.slug === slug) ?? null;
}

export type ConceptResolvedLinks = {
  definition: string;
  meaning: string;
  etymology: string | null;
  examples: string[];
  aliases: string[];
  overview: {
    summary: string;
    description: string;
    primaryScripture: string;
    sources: KnowledgeEntity["scriptureSources"];
  };
  verses: Array<{
    id: string;
    entity: KnowledgeEntity | null;
    href: string | null;
    label: string;
  }>;
  chapters: Array<{ number: number; href: string; label: string }>;
  characters: KnowledgeEntity[];
  events: KnowledgeEvent[];
  relatedConcepts: KnowledgeEntity[];
  relatedEdges: RelatedEdge[];
};

function dedupeEntities(list: KnowledgeEntity[]): KnowledgeEntity[] {
  const seen = new Set<string>();
  const out: KnowledgeEntity[] = [];
  for (const e of list) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    out.push(e);
  }
  return out;
}

function isVerse(e: KnowledgeEntity): boolean {
  return e.kind === "verse" || e.id.startsWith("verse.");
}

/**
 * Resolve every concept page section from KG entities + relations + concept meta.
 */
export async function resolveConceptLinks(
  concept: KnowledgeConcept,
): Promise<ConceptResolvedLinks> {
  const related = await getRelated(concept.id);

  const meta = concept.concept;

  const verses: ConceptResolvedLinks["verses"] = [];
  const characters: KnowledgeEntity[] = [];
  const events: KnowledgeEvent[] = [];
  const relatedConcepts: KnowledgeEntity[] = [];
  const chapterNums = new Set<number>(meta?.chapters ?? []);

  for (const edge of related) {
    const other = edge.other;
    const t = edge.relation.type;

    if (
      (t === "mentioned-in" || t === "appears-in") &&
      isVerse(other)
    ) {
      const publicId =
        other.externalRefs?.publicId ?? other.id.replace(/^verse\./, "");
      verses.push({
        id: other.id,
        entity: other,
        href: verseReaderHref(publicId),
        label: other.name,
      });
      const m = /(?:bg\.)?(\d{1,2})\./i.exec(publicId);
      if (m) chapterNums.add(Number(m[1]));
    }

    if (isCharacterEntity(other)) {
      characters.push(other);
    }

    if (isKnowledgeEvent(other)) {
      events.push(other);
    }

    if (isKnowledgeConcept(other) && other.id !== concept.id) {
      relatedConcepts.push(other);
    }
  }

  // Also pick up events that list nothing but are edged the other way already covered.
  // Resolve verse stubs referenced only by id in notes — skip.

  // Deduplicate verses
  const verseSeen = new Set<string>();
  const versesDeduped = verses.filter((v) => {
    if (verseSeen.has(v.id)) return false;
    verseSeen.add(v.id);
    return true;
  });

  const chapters = [...chapterNums]
    .filter((n) => n >= 1 && n <= 18)
    .sort((a, b) => a - b)
    .map((n) => ({
      number: n,
      href: gitaChapterHref(n),
      label: `Bhagavad Gītā ${n}`,
    }));

  events.sort((a, b) => a.event.timelineOrder - b.event.timelineOrder);

  return {
    definition: meta?.definition ?? concept.summary,
    meaning: meta?.meaning ?? concept.description,
    etymology: meta?.etymology ?? null,
    examples: meta?.examples ?? [],
    aliases: concept.aliases ?? [],
    overview: {
      summary: concept.summary,
      description: concept.description,
      primaryScripture: concept.primaryScripture,
      sources: concept.scriptureSources ?? [],
    },
    verses: versesDeduped,
    chapters,
    characters: dedupeEntities(characters).sort(
      (a, b) => b.importance - a.importance,
    ),
    events,
    relatedConcepts: dedupeEntities(relatedConcepts).sort(
      (a, b) => b.importance - a.importance,
    ),
    relatedEdges: related,
  };
}
