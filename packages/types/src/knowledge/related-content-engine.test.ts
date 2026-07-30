import { describe, expect, it } from "vitest";
import { createRelationshipIndex } from "./relationship-engine";
import { makeRelationId, type KnowledgeRelation } from "./relation";
import {
  buildRelatedContent,
  classifyRelatedBuckets,
  scoreRelatedHop,
  type RelatedContentEntity,
} from "./related-content-engine";

function rel(
  fromId: string,
  type: KnowledgeRelation["type"],
  toId: string,
  confidence: KnowledgeRelation["confidence"] = "verified",
): KnowledgeRelation {
  return {
    id: makeRelationId(fromId, type, toId),
    fromId,
    toId,
    type,
    confidence,
    sources: [{ work: "Bhagavad Gītā", chapter: "2" }],
  };
}

function ent(
  id: string,
  kind: RelatedContentEntity["kind"],
  extra: Partial<RelatedContentEntity> = {},
): RelatedContentEntity {
  const slug = id.split(".").pop() ?? id;
  return {
    id,
    kind,
    name: slug,
    slug,
    importance: 4,
    status: "published",
    ...extra,
  };
}

describe("related content engine", () => {
  const entities = new Map<string, RelatedContentEntity>([
    ["person.arjuna", ent("person.arjuna", "warrior", { importance: 5 })],
    ["person.krishna", ent("person.krishna", "avatar", { importance: 5 })],
    ["weapon.gandiva", ent("weapon.gandiva", "weapon")],
    ["concept.dharma", ent("concept.dharma", "concept", {
      concept: {
        definition: "duty",
        meaning: "order",
        chapters: [1, 2],
        examples: [],
      },
    })],
    ["verse.bg.2.47", ent("verse.bg.2.47", "verse", {
      externalRefs: { publicId: "bg.2.47" },
    })],
    ["city.hastinapura", ent("city.hastinapura", "city", {
      atlas: {
        latitude: 29.1,
        longitude: 78.0,
        modernLocation: "Haryana",
        scripturalSignificance: "Kuru capital",
      },
    })],
    ["kingdom.kuru", ent("kingdom.kuru", "kingdom")],
    ["event.bhagavad-gita", ent("event.bhagavad-gita", "event", {
      event: {
        eventType: "discourse",
        timelineOrder: 80,
        participants: [],
        places: [],
        kingdoms: [],
        weapons: [],
        scriptures: [],
        chapters: [1, 2],
        verses: [],
        relatedEvents: [],
      },
    })],
    ["person.abhimanyu", ent("person.abhimanyu", "prince", {
      externalRefs: { genealogyId: "abhimanyu" },
    })],
  ]);

  const relations = [
    rel("person.arjuna", "wielded", "weapon.gandiva"),
    rel("person.arjuna", "connected-to", "concept.dharma"),
    rel("concept.dharma", "mentioned-in", "verse.bg.2.47"),
    rel("person.arjuna", "fought-in", "event.bhagavad-gita"),
    rel("person.krishna", "participated-in", "event.bhagavad-gita"),
    rel("person.arjuna", "king-of", "city.hastinapura", "traditional"),
    rel("person.arjuna", "father", "person.abhimanyu"),
    rel("person.abhimanyu", "son", "person.arjuna"),
  ];

  it("classifies kinds into product buckets (incl. atlas + genealogy)", () => {
    expect(classifyRelatedBuckets(entities.get("weapon.gandiva")!)).toEqual([
      "weapons",
    ]);
    expect(classifyRelatedBuckets(entities.get("city.hastinapura")!)).toEqual(
      expect.arrayContaining(["places", "atlas"]),
    );
    expect(classifyRelatedBuckets(entities.get("person.abhimanyu")!)).toEqual(
      expect.arrayContaining(["characters", "genealogy"]),
    );
    expect(classifyRelatedBuckets(entities.get("kingdom.kuru")!)).toContain(
      "kingdoms",
    );
  });

  it("scores verified closer hops above distant traditional ones", () => {
    const near = scoreRelatedHop({
      type: "wielded",
      confidence: "verified",
      depth: 1,
      importance: 5,
    });
    const far = scoreRelatedHop({
      type: "connected-to",
      confidence: "traditional",
      depth: 2,
      importance: 3,
    });
    expect(near).toBeGreaterThan(far);
  });

  it("builds bucketed recommendations from graph only", () => {
    const index = createRelationshipIndex(relations);
    const result = buildRelatedContent(index, "person.arjuna", entities, {
      maxDepth: 2,
      perBucketLimit: 6,
    });

    expect(result.rootId).toBe("person.arjuna");
    expect(result.hits.some((h) => h.entityId === "person.arjuna")).toBe(false);

    const weapons = result.buckets.find((b) => b.bucket === "weapons");
    expect(weapons?.hits[0]?.entityId).toBe("weapon.gandiva");

    const concepts = result.buckets.find((b) => b.bucket === "concepts");
    expect(concepts?.hits.some((h) => h.entityId === "concept.dharma")).toBe(
      true,
    );

    const verses = result.buckets.find((b) => b.bucket === "verses");
    expect(verses?.hits.some((h) => h.entityId === "verse.bg.2.47")).toBe(true);

    const chapters = result.buckets.find((b) => b.bucket === "chapters");
    expect(
      chapters?.hits.some((h) => h.entityId === "gita.chapter.2"),
    ).toBe(true);

    const atlas = result.buckets.find((b) => b.bucket === "atlas");
    expect(atlas?.hits.some((h) => h.entityId === "city.hastinapura")).toBe(
      true,
    );

    const genealogy = result.buckets.find((b) => b.bucket === "genealogy");
    expect(
      genealogy?.hits.some((h) => h.entityId === "person.abhimanyu"),
    ).toBe(true);
  });

  it("never invents neighbors outside the relation index", () => {
    const index = createRelationshipIndex([
      rel("person.arjuna", "wielded", "weapon.gandiva"),
    ]);
    const result = buildRelatedContent(index, "person.arjuna", entities);
    expect(result.hits.every((h) => h.entityId === "weapon.gandiva")).toBe(
      true,
    );
  });
});
