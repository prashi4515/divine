import { describe, expect, it } from "vitest";
import {
  createRelationshipIndex,
  findAncestors,
  findBattlesInvolving,
  findDescendants,
  findPlacesRuledBy,
  getChildren,
  getParents,
  getRelationships,
} from "./relationship-engine";
import { makeRelationId, type KnowledgeRelation } from "./relation";

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
    sources: [{ work: "Mahābhārata", section: "Ādi Parva" }],
  };
}

describe("relationship engine", () => {
  const relations = [
    rel("person.abhimanyu", "father", "person.arjuna"),
    rel("person.arjuna", "son", "person.abhimanyu"),
    rel("person.arjuna", "father", "person.pandu"),
    rel("person.pandu", "son", "person.arjuna"),
    rel("person.krishna", "fought-in", "event.kurukshetra-war"),
    rel("person.krishna", "participated-in", "event.peace-mission"),
    rel("person.yudhishthira", "king-of", "city.hastinapura"),
    rel("person.yudhishthira", "king-of", "city.hastinapura"), // duplicate
    rel("person.bhima", "king-of", "city.hastinapura", "traditional"),
  ];

  it("dedupes identical (source,type,target) and exposes source/target/citation", () => {
    const index = createRelationshipIndex(relations);
    const kings = index.relations.filter(
      (r) =>
        r.fromId === "person.yudhishthira" &&
        r.type === "king-of" &&
        r.toId === "city.hastinapura",
    );
    expect(kings).toHaveLength(1);

    const hops = getRelationships(index, "person.abhimanyu", ["father"]);
    expect(hops[0]?.relationship).toMatchObject({
      type: "father",
      source: "person.abhimanyu",
      target: "person.arjuna",
    });
    expect(hops[0]?.relationship.citation.length).toBeGreaterThan(0);
  });

  it("getParents / getChildren are direction-aware and dedupe dual edges", () => {
    const index = createRelationshipIndex(relations);
    const parents = getParents(index, "person.abhimanyu");
    expect(parents.map((p) => p.otherId)).toEqual(["person.arjuna"]);

    const children = getChildren(index, "person.arjuna");
    expect(children.map((c) => c.otherId)).toEqual(["person.abhimanyu"]);
  });

  it("findAncestors / findDescendants walk multi-hop", () => {
    const index = createRelationshipIndex(relations);
    const ancestors = findAncestors(index, "person.abhimanyu");
    expect(ancestors.map((a) => a.id)).toEqual([
      "person.arjuna",
      "person.pandu",
    ]);

    const descendants = findDescendants(index, "person.pandu");
    expect(descendants.map((d) => d.id)).toEqual([
      "person.arjuna",
      "person.abhimanyu",
    ]);
  });

  it("findBattlesInvolving Krishna", () => {
    const index = createRelationshipIndex(relations);
    const battles = findBattlesInvolving(index, "person.krishna", (id) =>
      id.startsWith("event."),
    );
    expect(battles.map((b) => b.entityId).sort()).toEqual([
      "event.kurukshetra-war",
      "event.peace-mission",
    ]);
  });

  it("findPlacesRuledBy Pandavas", () => {
    const index = createRelationshipIndex(relations);
    const places = findPlacesRuledBy(
      index,
      ["person.yudhishthira", "person.bhima"],
      (id) => id.startsWith("city."),
    );
    expect(places).toHaveLength(1);
    expect(places[0]?.entityId).toBe("city.hastinapura");
    expect(places[0]?.relationships.length).toBeGreaterThanOrEqual(2);
  });
});
