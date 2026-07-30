/**
 * Curated Phase-1 places (citation-first, sparse).
 * Concepts live in seed-concepts.mts.
 */
import { makeRelationId } from "./helpers.mts";
export { CONCEPT_ENTITIES } from "./seed-concepts.mts";

type Cite = {
  work: string;
  section?: string;
  chapter?: string;
  verse?: string;
};

type Entity = {
  id: string;
  slug: string;
  kind: string;
  name: string;
  englishName: string;
  iastName: string;
  aliases: string[];
  summary: string;
  description: string;
  primaryScripture: string;
  scriptureSources: Cite[];
  tags: string[];
  categories: string[];
  importance: number;
  seo: { title?: string; description?: string };
  externalRefs?: { genealogyId?: string };
  status: "published";
  schemaVersion: number;
  era: string;
  variantTraditions: [];
};

type Rel = {
  id: string;
  fromId: string;
  toId: string;
  type: string;
  confidence: "verified" | "traditional" | "variant";
  sources: Cite[];
  note?: string;
};

const BP = (sk: string, ch?: string): Cite => ({
  work: "Bhāgavata Purāṇa",
  section: `Skandha ${sk}`,
  ...(ch ? { chapter: ch } : {}),
});
const MB = (parva: string, ch?: string): Cite => ({
  work: "Mahābhārata",
  section: parva,
  ...(ch ? { chapter: ch } : {}),
});
const RM = (kanda: string): Cite => ({ work: "Rāmāyaṇa", section: kanda });
const BG = (ch: string): Cite => ({ work: "Bhagavad Gītā", chapter: ch });

export const PLACE_ENTITIES: Entity[] = [
  {
    id: "city.hastinapura",
    slug: "hastinapura",
    kind: "city",
    name: "Hastināpura",
    englishName: "Hastinapura",
    iastName: "Hastināpura",
    aliases: ["Hastinapur", "City of the Elephants"],
    summary: "Capital of the Kuru kingdom in the Mahābhārata.",
    description:
      "Hastināpura is the seat of the Kuru kings — Śaṃtanu, Dhṛtarāṣṭra and the court of the epic war narrative.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Ādi Parva")],
    tags: ["kuru", "capital"],
    categories: ["city"],
    importance: 5,
    seo: { title: "Hastināpura", description: "Capital of the Kurus." },
    status: "published",
    schemaVersion: 1,
    era: "dvapara-yuga",
    variantTraditions: [],
  },
  {
    id: "place.kurukshetra",
    slug: "kurukshetra",
    kind: "pilgrimage",
    name: "Kurukṣetra",
    englishName: "Kurukshetra",
    iastName: "Kurukṣetra",
    aliases: ["Dharmakshetra", "Field of the Kurus"],
    summary: "The field of the Mahābhārata war and setting of the Bhagavad Gītā.",
    description:
      "Kurukṣetra is the sacred plain where the Kauravas and Pāṇḍavas fought; the Gītā opens with Arjuna's despondency on this field.",
    primaryScripture: "Bhagavad Gītā",
    scriptureSources: [BG("1"), MB("Bhīṣma Parva")],
    tags: ["battle", "gita"],
    categories: ["pilgrimage", "battlefield"],
    importance: 5,
    seo: { title: "Kurukṣetra" },
    status: "published",
    schemaVersion: 1,
    era: "dvapara-yuga",
    variantTraditions: [],
  },
  {
    id: "city.ayodhya",
    slug: "ayodhya",
    kind: "city",
    name: "Ayodhyā",
    englishName: "Ayodhya",
    iastName: "Ayodhyā",
    aliases: ["Saketa"],
    summary: "Capital of the Ikṣvāku / Raghu kings; city of Rāma.",
    description:
      "Ayodhyā is the royal city of Daśaratha and Rāma in the Valmīki Rāmāyaṇa.",
    primaryScripture: "Rāmāyaṇa",
    scriptureSources: [RM("Bāla Kāṇḍa")],
    tags: ["raghu", "rama"],
    categories: ["city"],
    importance: 5,
    seo: { title: "Ayodhyā" },
    status: "published",
    schemaVersion: 1,
    era: "treta-yuga",
    variantTraditions: [],
  },
  {
    id: "city.mathura",
    slug: "mathura",
    kind: "city",
    name: "Mathurā",
    englishName: "Mathura",
    iastName: "Mathurā",
    aliases: ["Madhura"],
    summary: "City of the Yadus; birthplace region of Kṛṣṇa.",
    description:
      "Mathurā is the Yadu stronghold associated with Kaṃsa and Kṛṣṇa's early life in the Bhāgavata.",
    primaryScripture: "Bhāgavata Purāṇa",
    scriptureSources: [BP("10", "1–44")],
    tags: ["yadu", "krishna"],
    categories: ["city"],
    importance: 5,
    seo: { title: "Mathurā" },
    status: "published",
    schemaVersion: 1,
    era: "dvapara-yuga",
    variantTraditions: [],
  },
  {
    id: "river.ganga",
    slug: "ganga",
    kind: "river",
    name: "Gaṅgā",
    englishName: "Ganga",
    iastName: "Gaṅgā",
    aliases: ["Ganges", "Jahnavi", "Jāhnavī"],
    summary: "Sacred river; mother of Bhīṣma in the Mahābhārata.",
    description:
      "Gaṅgā is both the holy river and the goddess who marries Śaṃtanu and bears Devavrata (Bhīṣma).",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Ādi Parva", "96–100")],
    tags: ["river", "kuru"],
    categories: ["river", "devi"],
    importance: 5,
    seo: { title: "Gaṅgā" },
    externalRefs: { genealogyId: "ganga" },
    status: "published",
    schemaVersion: 1,
    era: "eternal",
    variantTraditions: [],
  },
];

export const PLACE_CONCEPT_RELATIONS: Rel[] = [
  {
    id: makeRelationId("person.bhishma", "mother", "river.ganga"),
    fromId: "person.bhishma",
    toId: "river.ganga",
    type: "mother",
    confidence: "verified",
    sources: [MB("Ādi Parva", "96–100")],
    note: "Gaṅgā is mother of Bhīṣma.",
  },
  {
    id: makeRelationId("person.shantanu", "spouse", "river.ganga"),
    fromId: "person.shantanu",
    toId: "river.ganga",
    type: "spouse",
    confidence: "verified",
    sources: [MB("Ādi Parva", "96–100")],
  },
  {
    id: makeRelationId("person.dhritarashtra", "king-of", "city.hastinapura"),
    fromId: "person.dhritarashtra",
    toId: "city.hastinapura",
    type: "king-of",
    confidence: "traditional",
    sources: [MB("Ādi Parva")],
  },
  {
    id: makeRelationId("person.rama", "king-of", "city.ayodhya"),
    fromId: "person.rama",
    toId: "city.ayodhya",
    type: "king-of",
    confidence: "verified",
    sources: [RM("Yuddha Kāṇḍa")],
  },
  {
    id: makeRelationId("person.kamsa", "king-of", "city.mathura"),
    fromId: "person.kamsa",
    toId: "city.mathura",
    type: "king-of",
    confidence: "verified",
    sources: [BP("10", "1")],
  },
  {
    id: makeRelationId("person.arjuna", "fought-in", "place.kurukshetra"),
    fromId: "person.arjuna",
    toId: "place.kurukshetra",
    type: "fought-in",
    confidence: "verified",
    sources: [BG("1"), MB("Bhīṣma Parva")],
  },
  {
    id: makeRelationId("person.krishna", "appears-in", "place.kurukshetra"),
    fromId: "person.krishna",
    toId: "place.kurukshetra",
    type: "appears-in",
    confidence: "verified",
    sources: [BG("1")],
  },
];

export const ENCYCLOPEDIA_SECTIONS = [
  {
    id: "encyclopedia.persons",
    slug: "persons-and-deities",
    title: "Persons & Deities",
    kind: "encyclopedia-section",
    summary: "Gods, sages, kings, asuras and epic heroes.",
    description:
      "Figures of Hindu tradition — deities, avatars, ṛṣis, kings and asura lineages — as first-class encyclopedia entities.",
    status: "available",
    entityIds: [] as string[],
    order: 10,
    eyebrow: "Encyclopedia",
  },
  {
    id: "encyclopedia.places",
    slug: "places",
    title: "Places",
    kind: "encyclopedia-section",
    summary: "Cities, rivers and sacred fields.",
    description: "Geographic and sacred places linked to dynasties and events.",
    status: "available",
    entityIds: [] as string[],
    order: 20,
    eyebrow: "Encyclopedia",
  },
  {
    id: "encyclopedia.concepts",
    slug: "concepts",
    title: "Concepts",
    kind: "encyclopedia-section",
    summary: "Dharma, karma, bhakti, jñāna, yoga, ātman, and related ideas.",
    description:
      "Philosophical and religious concepts cited to scripture — also available as the dedicated Concepts module.",
    status: "available",
    entityIds: [] as string[],
    order: 30,
    eyebrow: "Encyclopedia",
  },
  {
    id: "encyclopedia.dynasties",
    slug: "dynasties",
    title: "Dynasties",
    kind: "encyclopedia-section",
    summary: "Royal and celestial lineages.",
    description: "Dynasty entities linking persons across modules.",
    status: "available",
    entityIds: [] as string[],
    order: 40,
    eyebrow: "Encyclopedia",
  },
  {
    id: "encyclopedia.scriptures",
    slug: "scriptures",
    title: "Scriptures & Verses",
    kind: "encyclopedia-section",
    summary: "Scripture and verse stubs linked into the graph.",
    description:
      "Thin scripture/verse entities that point at the Gita reader without duplicating text.",
    status: "available",
    entityIds: [] as string[],
    order: 50,
    eyebrow: "Encyclopedia",
  },
];
