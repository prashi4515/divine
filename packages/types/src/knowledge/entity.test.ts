import { describe, expect, it } from "vitest";
import {
  knowledgeEntitySchema,
  knowledgeRelationSchema,
  knowledgeCollectionSchema,
  makeRelationId,
  formatCitation,
  entitySearchKeys,
} from "./index";

describe("knowledgeEntitySchema", () => {
  it("accepts a person entity shaped for future Prisma", () => {
    const entity = knowledgeEntitySchema.parse({
      id: "person.krishna",
      slug: "krishna",
      kind: "avatar",
      name: "Kṛṣṇa",
      englishName: "Krishna",
      iastName: "Kṛṣṇa",
      aliases: ["Govinda", "Mādhava"],
      gender: "male",
      era: "dvapara-yuga",
      summary: "Avatāra of Viṣṇu; speaker of the Bhagavad Gītā.",
      description:
        "Kṛṣṇa, son of Vasudeva and Devakī, is the central figure of the Bhāgavata's tenth skandha.",
      primaryScripture: "Bhāgavata Purāṇa",
      scriptureSources: [
        { work: "Bhāgavata Purāṇa", section: "Skandha 10" },
      ],
      importance: 5,
      externalRefs: { workCode: "bg", genealogyId: "krishna" },
      status: "published",
    });
    expect(entity.id).toBe("person.krishna");
    expect(entity.aliases).toContain("Govinda");
    expect(entitySearchKeys(entity)).toContain("govinda");
  });
});

describe("knowledgeEntitySchema event hub", () => {
  it("accepts an event entity with event metadata arrays", () => {
    const entity = knowledgeEntitySchema.parse({
      id: "event.dice-game",
      slug: "dice-game",
      kind: "event",
      name: "Dice Game",
      englishName: "Dice Game",
      iastName: "Dyūta",
      summary: "Śakuni's dice strip Yudhiṣṭhira of kingdom.",
      description: "In the Hastināpura sabhā, the dice game precipitates exile.",
      primaryScripture: "Mahābhārata",
      scriptureSources: [{ work: "Mahābhārata", section: "Sabhā Parva" }],
      importance: 5,
      event: {
        eventType: "game",
        timelineOrder: 40,
        participants: ["person.yudhishthira", "person.shakuni"],
        places: ["city.hastinapura"],
        kingdoms: ["kingdom.kuru"],
        weapons: [],
        scriptures: [],
        chapters: [],
        verses: [],
        relatedEvents: ["event.exile"],
      },
      status: "published",
    });
    expect(entity.event?.eventType).toBe("game");
    expect(entity.event?.participants).toContain("person.shakuni");
  });
});

describe("knowledgeRelationSchema", () => {
  it("requires confidence and at least one citation", () => {
    const rel = knowledgeRelationSchema.parse({
      id: makeRelationId("person.krishna", "father", "person.vasudeva"),
      fromId: "person.krishna",
      toId: "person.vasudeva",
      type: "father",
      confidence: "verified",
      sources: [
        { work: "Bhāgavata Purāṇa", section: "Skandha 10", chapter: "3" },
      ],
    });
    expect(rel.id).toContain("person.krishna");
    expect(() =>
      knowledgeRelationSchema.parse({
        id: "bad",
        fromId: "a",
        toId: "b",
        type: "friend",
        confidence: "verified",
        sources: [],
      }),
    ).toThrow();
  });

  it("accepts born-at / died-at / located-at place edges", () => {
    const born = knowledgeRelationSchema.parse({
      id: makeRelationId("person.krishna", "born-at", "city.mathura"),
      fromId: "person.krishna",
      toId: "city.mathura",
      type: "born-at",
      confidence: "traditional",
      sources: [{ work: "Bhāgavata Purāṇa", section: "Skandha 10" }],
    });
    expect(born.type).toBe("born-at");
  });
});

describe("knowledgeCollectionSchema", () => {
  it("accepts a genealogy module collection", () => {
    const col = knowledgeCollectionSchema.parse({
      id: "genealogy.asuras",
      slug: "asuras",
      title: "Asuras",
      kind: "genealogy-module",
      summary: "Daityas and Dānavas",
      description: "Asura houses kept separate from Rākṣasas.",
      entityIds: ["person.hiranyakashipu", "person.prahlada"],
      rootEntityId: "person.kashyapa",
      order: 38,
    });
    expect(col.kind).toBe("genealogy-module");
  });
});

describe("entity atlas metadata", () => {
  it("accepts atlas placement on a place entity", () => {
    const entity = knowledgeEntitySchema.parse({
      id: "city.hastinapura",
      slug: "hastinapura",
      kind: "city",
      name: "Hastināpura",
      englishName: "Hastinapura",
      iastName: "Hastināpura",
      summary: "Kuru capital",
      description: "Seat of the Kuru kings.",
      primaryScripture: "Mahābhārata",
      atlas: {
        latitude: 29.16,
        longitude: 78.02,
        modernLocation: "Near Meerut, Uttar Pradesh",
        kingdom: "Kuru",
        atlasCategory: "city",
      },
      status: "published",
    });
    expect(entity.atlas?.modernLocation).toContain("Meerut");
  });
});

describe("formatCitation", () => {
  it("joins work section chapter", () => {
    expect(
      formatCitation({
        work: "Bhāgavata Purāṇa",
        section: "Skandha 10",
        chapter: "3",
      }),
    ).toBe("Bhāgavata Purāṇa · Skandha 10 · ch. 3");
  });
});
