/**
 * Mahābhārata Events hub — shared KG entities (kind: event) + cited relations.
 * Flagship /events visualizes; Encyclopedia / Atlas / Genealogy remain canonical.
 */
import { makeRelationId } from "./helpers.mts";

type Cite = {
  work: string;
  section?: string;
  chapter?: string;
  verse?: string;
  note?: string;
};

type EventMeta = {
  eventType:
    | "birth"
    | "plot"
    | "ceremony"
    | "game"
    | "exile"
    | "embassy"
    | "discourse"
    | "battle"
    | "death"
    | "rite"
    | "other";
  timelineOrder: number;
  participants: string[];
  places: string[];
  kingdoms: string[];
  weapons: string[];
  scriptures: string[];
  chapters: number[];
  verses: string[];
  relatedEvents: string[];
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
  externalRefs?: { genealogyId?: string; workCode?: string; publicId?: string };
  event?: EventMeta;
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

const MB = (parva: string, note?: string): Cite => ({
  work: "Mahābhārata",
  section: parva,
  ...(note ? { note } : {}),
});
const BG = (ch: string, verse?: string): Cite => ({
  work: "Bhagavad Gītā",
  chapter: ch,
  ...(verse ? { verse } : {}),
});

function base(
  p: Omit<Entity, "status" | "schemaVersion" | "variantTraditions" | "era"> & {
    era?: string;
  },
): Entity {
  return {
    status: "published",
    schemaVersion: 1,
    era: p.era ?? "dvapara-yuga",
    variantTraditions: [],
    ...p,
  };
}

function edge(
  fromId: string,
  type: string,
  toId: string,
  sources: Cite[],
  confidence: Rel["confidence"] = "verified",
  note?: string,
): Rel {
  return {
    id: makeRelationId(fromId, type, toId),
    fromId,
    toId,
    type,
    confidence,
    sources,
    ...(note ? { note } : {}),
  };
}

/** Minimal stubs for participants / weapons missing from the base graph. */
export const EVENT_SUPPORT_ENTITIES: Entity[] = [
  base({
    id: "person.sanjaya",
    slug: "sanjaya",
    kind: "person",
    name: "Sañjaya",
    englishName: "Sanjaya",
    iastName: "Sañjaya",
    aliases: [],
    summary: "Dhṛtarāṣṭra's charioteer-seer; narrator of the Gītā.",
    description:
      "Granted divine vision, Sañjaya narrates the Kurukṣetra war — including the Bhagavad Gītā — to the blind king.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Bhīṣma Parva"), BG("1")],
    tags: ["narrator", "gita"],
    categories: ["person"],
    importance: 5,
    seo: { title: "Sañjaya" },
    externalRefs: { genealogyId: "sanjaya" },
  }),
  base({
    id: "person.shakuni",
    slug: "shakuni",
    kind: "person",
    name: "Śakuni",
    englishName: "Shakuni",
    iastName: "Śakuni",
    aliases: ["Saubala"],
    summary: "Prince of Gāndhāra; architect of the dice game.",
    description:
      "Śakuni, brother of Gāndhārī, engineers the sabhā dice match that strips the Pāṇḍavas of kingdom and honour.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Sabhā Parva")],
    tags: ["kaurava", "gandhara"],
    categories: ["person"],
    importance: 5,
    seo: { title: "Śakuni" },
    externalRefs: { genealogyId: "shakuni" },
  }),
  base({
    id: "person.drona",
    slug: "drona",
    kind: "sage",
    name: "Droṇa",
    englishName: "Drona",
    iastName: "Droṇa",
    aliases: ["Dronacharya"],
    summary: "Ācārya of the Kuru princes; later Kaurava senāpati.",
    description:
      "Droṇa teaches the Kuru heirs and commands the Kaurava army after Bhīṣma; he falls on the fourteenth day.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Ādi Parva"), MB("Droṇa Parva")],
    tags: ["guru", "kurukshetra"],
    categories: ["sage", "warrior"],
    importance: 5,
    seo: { title: "Droṇa" },
    externalRefs: { genealogyId: "drona" },
  }),
  base({
    id: "person.ashwatthama",
    slug: "ashwatthama",
    kind: "warrior",
    name: "Aśvatthāmā",
    englishName: "Ashwatthama",
    iastName: "Aśvatthāmā",
    aliases: ["Ashwatthama"],
    summary: "Son of Droṇa; survivor of the night massacre.",
    description:
      "Aśvatthāmā fights for the Kauravas and later unleashes the night attack after the war's main host falls.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Droṇa Parva"), MB("Sauptika Parva")],
    tags: ["kaurava"],
    categories: ["warrior"],
    importance: 4,
    seo: { title: "Aśvatthāmā" },
    externalRefs: { genealogyId: "ashwatthama" },
  }),
  base({
    id: "person.vayu",
    slug: "vayu",
    kind: "deva",
    name: "Vāyu",
    englishName: "Vayu",
    iastName: "Vāyu",
    aliases: ["Pavana"],
    summary: "Wind deity; divine father of Bhīma.",
    description:
      "Vāyu sires Bhīma through Kuntī's mantra, linking the middle Pāṇḍava to the wind.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Ādi Parva")],
    tags: ["deva"],
    categories: ["deva"],
    importance: 4,
    seo: { title: "Vāyu" },
  }),
  base({
    id: "person.yama",
    slug: "yama-dharma",
    kind: "deva",
    name: "Yama",
    englishName: "Yama",
    iastName: "Yama",
    aliases: ["Dharma"],
    summary: "Lord of dharma; divine father of Yudhiṣṭhira.",
    description:
      "Through Kuntī's mantra, Dharma/Yama fathers Yudhiṣṭhira, the eldest Pāṇḍava.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Ādi Parva")],
    tags: ["deva", "dharma"],
    categories: ["deva"],
    importance: 4,
    seo: { title: "Yama" },
  }),
  base({
    id: "person.ashvins",
    slug: "ashvins",
    kind: "deva",
    name: "Aśvins",
    englishName: "Ashvins",
    iastName: "Aśvinau",
    aliases: ["Nasatya", "Dasra"],
    summary: "Twin physician-gods; fathers of Nakula and Sahadeva.",
    description:
      "The Aśvins father Nakula and Sahadeva through Mādrī's use of Kuntī's mantra.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Ādi Parva")],
    tags: ["deva"],
    categories: ["deva"],
    importance: 3,
    seo: { title: "Aśvins" },
  }),
];

type EventSeed = {
  id: string;
  slug: string;
  name: string;
  englishName: string;
  iastName: string;
  aliases?: string[];
  summary: string;
  description: string;
  event: EventMeta;
  sources: Cite[];
  importance?: number;
  kind?: "event" | "battle";
};

const EVENT_SEEDS: EventSeed[] = [
  {
    id: "event.creation",
    slug: "creation",
    name: "Creation",
    englishName: "Creation",
    iastName: "Sṛṣṭi",
    aliases: ["Cosmic beginning"],
    summary:
      "The opening of cosmic order — Prajāpati, Manu, and the lineages that frame the epic world.",
    description:
      "Purāṇic and epic traditions place the Mahābhārata within a larger creation cycle — the backdrop for the dynasties of the sun and moon.",
    sources: [MB("Ādi Parva", "cosmic preface"), { work: "Bhāgavata Purāṇa", section: "Skandha 3" }],
    importance: 5,
    event: {
      eventType: "other",
      timelineOrder: 1,
      participants: ["person.brahma", "person.kashyapa"],
      places: [],
      kingdoms: [],
      weapons: [],
      scriptures: [],
      chapters: [],
      verses: [],
      relatedEvents: ["event.major-dynasties"],
    },
  },
  {
    id: "event.major-dynasties",
    slug: "major-dynasties",
    name: "Major Dynasties",
    englishName: "Major Dynasties",
    iastName: "Mahā-vaṃśa",
    aliases: ["Solar and Lunar lines", "Chandravamsa", "Suryavamsa"],
    summary:
      "The great houses — Sūryavaṃśa, Candravaṃśa, Yadu, and Kuru — take shape.",
    description:
      "Before the Pāṇḍava–Kaurava conflict, the great houses of epic geography take shape — Sūryavaṃśa, Candravaṃśa, Yadu, and Kuru among them.",
    sources: [MB("Ādi Parva")],
    importance: 5,
    event: {
      eventType: "other",
      timelineOrder: 5,
      participants: ["person.kuru", "person.bharata", "person.ikshvaku"],
      places: ["city.hastinapura", "city.ayodhya"],
      kingdoms: ["kingdom.kuru", "kingdom.kosala"],
      weapons: [],
      scriptures: [],
      chapters: [],
      verses: [],
      relatedEvents: ["event.creation", "event.birth-of-krishna"],
    },
  },
  {
    id: "event.birth-of-krishna",
    slug: "birth-of-krishna",
    name: "Birth of Kṛṣṇa",
    englishName: "Birth of Krishna",
    iastName: "Kṛṣṇa-janma",
    aliases: ["Krishna janma", "Mathura birth"],
    summary:
      "Kṛṣṇa is born to Devakī and Vasudeva in Mathurā, then raised in Vraja.",
    description:
      "The Bhāgavata and Harivaṃśa narrate Kṛṣṇa's birth under Kaṃsa's terror and his childhood in Gokula–Vṛndāvana. On the Timeline this node precedes the Pāṇḍava story he will later guide.",
    sources: [
      { work: "Bhāgavata Purāṇa", section: "Skandha 10" },
      { work: "Harivaṃśa" },
    ],
    importance: 5,
    event: {
      eventType: "birth",
      timelineOrder: 8,
      participants: [
        "person.krishna",
        "person.devaki",
        "person.vasudeva",
        "person.kamsa",
        "person.nanda",
      ],
      places: ["city.mathura", "place.gokula", "place.vrindavana"],
      kingdoms: ["kingdom.surasena"],
      weapons: [],
      scriptures: ["scripture.bg"],
      chapters: [4],
      verses: ["verse.bg.4.7"],
      relatedEvents: ["event.major-dynasties", "event.birth-of-pandavas"],
    },
  },
  {
    id: "event.birth-of-pandavas",
    slug: "birth-of-the-pandavas",
    name: "Birth of the Pāṇḍavas",
    englishName: "Birth of the Pandavas",
    iastName: "Pāṇḍava-janma",
    aliases: ["Pandava birth"],
    summary:
      "Through divine mantras, Kuntī and Mādrī bear the five Pāṇḍava brothers.",
    description:
      "Kuntī invokes Dharma, Vāyu, and Indra; Mādrī invokes the Aśvins. The five sons of Pāṇḍu — Yudhiṣṭhira, Bhīma, Arjuna, Nakula, and Sahadeva — become the axis of the Mahābhārata.",
    sources: [MB("Ādi Parva")],
    importance: 5,
    event: {
      eventType: "birth",
      timelineOrder: 10,
      participants: [
        "person.kunti",
        "person.madri",
        "person.pandu",
        "person.yudhishthira",
        "person.bhima",
        "person.arjuna",
        "person.nakula",
        "person.sahadeva",
        "person.yama",
        "person.vayu",
        "person.indra",
        "person.ashvins",
      ],
      places: ["city.hastinapura"],
      kingdoms: ["kingdom.kuru"],
      weapons: [],
      scriptures: ["scripture.bg"],
      chapters: [],
      verses: [],
      relatedEvents: ["event.lakshagriha", "event.draupadi-swayamvara"],
    },
  },
  {
    id: "event.birth-of-kauravas",
    slug: "birth-of-the-kauravas",
    name: "Birth of the Kauravas",
    englishName: "Birth of the Kauravas",
    iastName: "Kaurava-janma",
    aliases: ["Hundred Kauravas", "Duryodhana's birth"],
    summary:
      "Gāndhārī bears the hundred Kauravas; Duryodhana rises as their chief.",
    description:
      "The Ādi Parva narrates Gāndhārī's long gestation and the birth of Duryodhana and his brothers — the rival house that will face the Pāṇḍavas.",
    sources: [MB("Ādi Parva")],
    importance: 5,
    event: {
      eventType: "birth",
      timelineOrder: 12,
      participants: [
        "person.gandhari",
        "person.dhritarashtra",
        "person.duryodhana",
        "person.dushasana",
        "person.vyasa",
      ],
      places: ["city.hastinapura"],
      kingdoms: ["kingdom.kuru"],
      weapons: [],
      scriptures: [],
      chapters: [],
      verses: [],
      relatedEvents: ["event.birth-of-pandavas", "event.lakshagriha"],
    },
  },
  {
    id: "event.lakshagriha",
    slug: "lakshagriha",
    name: "Lākṣāgṛha",
    englishName: "Lakshagriha",
    iastName: "Lākṣāgṛha",
    aliases: ["House of lac", "Lacquer house"],
    summary:
      "The lacquer house plot at Vāraṇāvata — the Pāṇḍavas escape the fire.",
    description:
      "Duryodhana's faction builds a house of lac at Vāraṇāvata to burn the Pāṇḍavas. Warned by Vidura, they tunnel out, beginning their years of concealment.",
    sources: [MB("Ādi Parva")],
    importance: 5,
    event: {
      eventType: "plot",
      timelineOrder: 20,
      participants: [
        "person.yudhishthira",
        "person.bhima",
        "person.arjuna",
        "person.nakula",
        "person.sahadeva",
        "person.kunti",
        "person.duryodhana",
        "person.vidura",
      ],
      places: ["city.varanavata", "city.hastinapura"],
      kingdoms: ["kingdom.kuru"],
      weapons: [],
      scriptures: [],
      chapters: [],
      verses: [],
      relatedEvents: ["event.birth-of-pandavas", "event.draupadi-swayamvara"],
    },
  },
  {
    id: "event.draupadi-swayamvara",
    slug: "draupadi-swayamvara",
    name: "Draupadī Svayaṃvara",
    englishName: "Draupadi Swayamvara",
    iastName: "Draupadī-svayaṃvara",
    aliases: ["Panchala swayamvara"],
    summary:
      "Arjuna wins Draupadī at the Pañcāla svayaṃvara; she becomes wife of the five.",
    description:
      "At Kāmpilya, Arjuna strings the bow and hits the target. Draupadī's marriage to all five Pāṇḍavas follows Kuntī's word and Vyāsa's sanction.",
    sources: [MB("Ādi Parva")],
    importance: 5,
    event: {
      eventType: "ceremony",
      timelineOrder: 30,
      participants: [
        "person.draupadi",
        "person.arjuna",
        "person.yudhishthira",
        "person.bhima",
        "person.nakula",
        "person.sahadeva",
        "person.kunti",
        "person.karna",
        "person.krishna",
      ],
      places: ["city.kampilya"],
      kingdoms: ["kingdom.pancala"],
      weapons: ["weapon.gandiva"],
      scriptures: [],
      chapters: [],
      verses: [],
      relatedEvents: ["event.lakshagriha", "event.dice-game"],
    },
  },
  {
    id: "event.dice-game",
    slug: "dice-game",
    name: "Dice Game",
    englishName: "Dice Game",
    iastName: "Dyūta",
    aliases: ["Sabha dice", "Game of dice"],
    summary:
      "Śakuni's dice strip Yudhiṣṭhira of kingdom, brothers, and Draupadī.",
    description:
      "In the Hastināpura sabhā, Śakuni defeats Yudhiṣṭhira. Draupadī is dragged into the court; the outrage sets the path to exile and war.",
    sources: [MB("Sabhā Parva")],
    importance: 5,
    event: {
      eventType: "game",
      timelineOrder: 40,
      participants: [
        "person.yudhishthira",
        "person.shakuni",
        "person.duryodhana",
        "person.dushasana",
        "person.draupadi",
        "person.bhishma",
        "person.vidura",
        "person.karna",
        "person.dhritarashtra",
      ],
      places: ["city.hastinapura"],
      kingdoms: ["kingdom.kuru"],
      weapons: [],
      scriptures: [],
      chapters: [],
      verses: [],
      relatedEvents: ["event.draupadi-swayamvara", "event.exile"],
    },
  },
  {
    id: "event.exile",
    slug: "pandava-exile",
    name: "Pāṇḍava Exile",
    englishName: "Exile",
    iastName: "Vana-vāsa",
    aliases: ["Twelve-year exile", "Forest exile"],
    summary:
      "Twelve years in the forest and a year in disguise — the price of the dice.",
    description:
      "The Pāṇḍavas and Draupadī dwell in forests such as Kāmyaka and Dvaita. Arjuna seeks weapons; pilgrimage and trials fill the Vana Parva years.",
    sources: [MB("Vana Parva")],
    importance: 5,
    event: {
      eventType: "exile",
      timelineOrder: 50,
      participants: [
        "person.yudhishthira",
        "person.bhima",
        "person.arjuna",
        "person.nakula",
        "person.sahadeva",
        "person.draupadi",
        "person.krishna",
      ],
      places: ["forest.kamyaka", "forest.dvaita", "place.prayaga"],
      kingdoms: ["kingdom.kuru"],
      weapons: ["weapon.gandiva", "weapon.pashupatastra"],
      scriptures: [],
      chapters: [],
      verses: [],
      relatedEvents: ["event.dice-game", "event.virata-parva"],
    },
  },
  {
    id: "event.virata-parva",
    slug: "virata-parva",
    name: "Virāṭa Parva",
    englishName: "Virata Parva",
    iastName: "Virāṭa-parva",
    aliases: ["Year of disguise", "Ajnatavasa"],
    summary:
      "The thirteenth year in disguise at Virāṭa's court in Matsya.",
    description:
      "Each Pāṇḍava and Draupadī take new identities in Virāṭanagara. The cattle raid and Arjuna's revealing of arms close the year of concealment.",
    sources: [MB("Virāṭa Parva")],
    importance: 5,
    event: {
      eventType: "exile",
      timelineOrder: 60,
      participants: [
        "person.yudhishthira",
        "person.bhima",
        "person.arjuna",
        "person.nakula",
        "person.sahadeva",
        "person.draupadi",
        "person.duryodhana",
      ],
      places: ["city.viratanagara", "city.upaplavya"],
      kingdoms: ["kingdom.virata"],
      weapons: ["weapon.gandiva", "weapon.sammohana", "weapon.devadatta"],
      scriptures: [],
      chapters: [],
      verses: [],
      relatedEvents: ["event.exile", "event.krishna-peace-mission"],
    },
  },
  {
    id: "event.krishna-peace-mission",
    slug: "krishna-peace-mission",
    name: "Kṛṣṇa's Peace Mission",
    englishName: "Krishna Peace Mission",
    iastName: "Kṛṣṇa-dūtya",
    aliases: ["Udyoga embassy", "Krishna as envoy"],
    summary:
      "Kṛṣṇa goes to Hastināpura as envoy; peace fails and war is fixed.",
    description:
      "In the Udyoga Parva, Kṛṣṇa seeks five villages for peace. Duryodhana refuses; the armies gather for Kurukṣetra.",
    sources: [MB("Udyoga Parva")],
    importance: 5,
    event: {
      eventType: "embassy",
      timelineOrder: 70,
      participants: [
        "person.krishna",
        "person.yudhishthira",
        "person.duryodhana",
        "person.dhritarashtra",
        "person.vidura",
        "person.karna",
        "person.bhishma",
      ],
      places: ["city.hastinapura", "city.upaplavya", "place.kurukshetra"],
      kingdoms: ["kingdom.kuru"],
      weapons: [],
      scriptures: ["scripture.bg"],
      chapters: [1],
      verses: ["verse.bg.1.1"],
      relatedEvents: ["event.virata-parva", "event.bhagavad-gita"],
    },
  },
  {
    id: "event.bhagavad-gita",
    slug: "bhagavad-gita",
    name: "Bhagavad Gītā",
    englishName: "Bhagavad Gita",
    iastName: "Bhagavad-gītā",
    aliases: ["Song of the Lord", "Kurukshetra discourse"],
    summary:
      "On the field of dharma, Kṛṣṇa teaches Arjuna — the Gītā unfolds.",
    description:
      "Between the armies at Kurukṣetra, Arjuna's despair meets Kṛṣṇa's yoga of action, knowledge, and devotion. The discourse is the spiritual heart of the epic.",
    sources: [MB("Bhīṣma Parva"), BG("1"), BG("2"), BG("18")],
    importance: 5,
    event: {
      eventType: "discourse",
      timelineOrder: 80,
      participants: [
        "person.krishna",
        "person.arjuna",
        "person.sanjaya",
        "person.dhritarashtra",
      ],
      places: ["place.kurukshetra"],
      kingdoms: ["kingdom.kuru"],
      weapons: [
        "weapon.gandiva",
        "weapon.sudarshana",
        "weapon.panchajanya",
        "weapon.devadatta",
        "weapon.krishna-chariot",
      ],
      scriptures: ["scripture.bg"],
      chapters: [1, 2, 3, 4, 5, 6, 11, 18],
      verses: ["verse.bg.1.1", "verse.bg.2.3", "verse.bg.2.47", "verse.bg.4.7"],
      relatedEvents: [
        "event.krishna-peace-mission",
        "event.bhishmas-fall",
      ],
    },
  },
  {
    id: "event.bhishmas-fall",
    slug: "bhishmas-fall",
    name: "Bhīṣma's Fall",
    englishName: "Bhishma's Fall",
    iastName: "Bhīṣma-patana",
    aliases: ["Bhishma on the bed of arrows"],
    summary:
      "Bhīṣma falls to Arjuna's arrows, aided by Śikhaṇḍin's presence.",
    description:
      "After ten days as senāpati, Bhīṣma is brought down and lies on a bed of arrows, waiting for uttarāyaṇa to leave the body.",
    sources: [MB("Bhīṣma Parva")],
    importance: 5,
    kind: "battle",
    event: {
      eventType: "battle",
      timelineOrder: 90,
      participants: [
        "person.bhishma",
        "person.arjuna",
        "person.krishna",
        "person.yudhishthira",
      ],
      places: ["place.kurukshetra"],
      kingdoms: ["kingdom.kuru", "kingdom.pancala"],
      weapons: ["weapon.gandiva"],
      scriptures: ["scripture.bg"],
      chapters: [1, 2],
      verses: ["verse.bg.1.8"],
      relatedEvents: ["event.bhagavad-gita", "event.dronas-death"],
    },
  },
  {
    id: "event.abhimanyus-death",
    slug: "abhimanyus-death",
    name: "Abhimanyu's Death",
    englishName: "Abhimanyu's Death",
    iastName: "Abhimanyu-vadha",
    aliases: ["Chakravyuha", "Abhimanyu in the wheel formation"],
    summary:
      "Young Abhimanyu enters the cakravyūha and is slain by many warriors.",
    description:
      "On the thirteenth day, Abhimanyu penetrates the wheel formation but cannot exit. Surrounded, he falls — a turning grief of the war.",
    sources: [MB("Droṇa Parva")],
    importance: 5,
    kind: "battle",
    event: {
      eventType: "death",
      timelineOrder: 100,
      participants: [
        "person.abhimanyu",
        "person.arjuna",
        "person.duryodhana",
        "person.drona",
        "person.karna",
        "person.dushasana",
      ],
      places: ["place.kurukshetra"],
      kingdoms: ["kingdom.kuru"],
      weapons: [],
      scriptures: [],
      chapters: [],
      verses: [],
      relatedEvents: ["event.bhishmas-fall", "event.dronas-death"],
    },
  },
  {
    id: "event.dronas-death",
    slug: "dronas-death",
    name: "Droṇa's Death",
    englishName: "Drona's Death",
    iastName: "Droṇa-vadha",
    aliases: ["Death of Drona"],
    summary:
      "Droṇa lays down arms after the false report of Aśvatthāmā's death.",
    description:
      "Told that 'Aśvatthāmā' is dead — meaning an elephant — Droṇa ceases fighting and is beheaded by Dhṛṣṭadyumna.",
    sources: [MB("Droṇa Parva")],
    importance: 5,
    kind: "battle",
    event: {
      eventType: "death",
      timelineOrder: 110,
      participants: [
        "person.drona",
        "person.ashwatthama",
        "person.yudhishthira",
        "person.arjuna",
        "person.krishna",
      ],
      places: ["place.kurukshetra"],
      kingdoms: ["kingdom.kuru", "kingdom.pancala"],
      weapons: ["weapon.narayanastra"],
      scriptures: [],
      chapters: [],
      verses: [],
      relatedEvents: ["event.abhimanyus-death", "event.karnas-death"],
    },
  },
  {
    id: "event.karnas-death",
    slug: "karnas-death",
    name: "Karṇa's Death",
    englishName: "Karna's Death",
    iastName: "Karṇa-vadha",
    aliases: ["Death of Karna"],
    summary:
      "Arjuna slays Karṇa when his chariot wheel sticks in the earth.",
    description:
      "In the Karṇa Parva duel, curses and fate converge: the wheel sinks, Karṇa's arms fail him, and Arjuna's arrow ends the elder brother he never fully knew.",
    sources: [MB("Karṇa Parva")],
    importance: 5,
    kind: "battle",
    event: {
      eventType: "death",
      timelineOrder: 120,
      participants: [
        "person.karna",
        "person.arjuna",
        "person.krishna",
        "person.kunti",
      ],
      places: ["place.kurukshetra"],
      kingdoms: ["kingdom.kuru", "kingdom.anga"],
      weapons: ["weapon.gandiva", "weapon.vijaya-bow"],
      scriptures: [],
      chapters: [],
      verses: [],
      relatedEvents: ["event.dronas-death", "event.end-of-war"],
    },
  },
  {
    id: "event.end-of-war",
    slug: "end-of-war",
    name: "End of the War",
    englishName: "End of War",
    iastName: "Yuddha-samāpti",
    aliases: ["Kurukshetra ends", "Fall of Duryodhana"],
    summary:
      "Duryodhana falls; the Sauptika night and aśru close the eighteen days.",
    description:
      "Bhīma fells Duryodhana. Aśvatthāmā's night massacre and the final astra exchanges seal the war's end; the Strī and Śānti parvas begin the aftermath.",
    sources: [MB("Śalya Parva"), MB("Sauptika Parva"), MB("Strī Parva")],
    importance: 5,
    kind: "battle",
    event: {
      eventType: "battle",
      timelineOrder: 130,
      participants: [
        "person.duryodhana",
        "person.bhima",
        "person.yudhishthira",
        "person.arjuna",
        "person.krishna",
        "person.ashwatthama",
        "person.draupadi",
      ],
      places: ["place.kurukshetra"],
      kingdoms: ["kingdom.kuru"],
      weapons: [
        "weapon.gandiva",
        "weapon.sudarshana",
        "weapon.brahmastra",
        "weapon.narayanastra",
        "weapon.brahmashira",
        "weapon.bhima-gada",
      ],
      scriptures: ["scripture.bg"],
      chapters: [18],
      verses: [],
      relatedEvents: ["event.karnas-death", "event.ashwamedha"],
    },
  },
  {
    id: "event.ashwamedha",
    slug: "ashwamedha",
    name: "Aśvamedha",
    englishName: "Ashwamedha",
    iastName: "Aśvamedha",
    aliases: ["Horse sacrifice", "Ashvamedha yajna"],
    summary:
      "Yudhiṣṭhira's horse sacrifice reasserts dharma after the war.",
    description:
      "In the Aśvamedhika Parva, the consecrated horse roams under Arjuna's guard; the sacrifice seeks to restore order and merit after the slaughter of kin.",
    sources: [MB("Aśvamedhika Parva")],
    importance: 4,
    event: {
      eventType: "rite",
      timelineOrder: 140,
      participants: [
        "person.yudhishthira",
        "person.arjuna",
        "person.bhima",
        "person.krishna",
        "person.draupadi",
      ],
      places: ["city.hastinapura", "city.indraprastha"],
      kingdoms: ["kingdom.kuru"],
      weapons: ["weapon.gandiva"],
      scriptures: [],
      chapters: [],
      verses: [],
      relatedEvents: ["event.end-of-war"],
    },
  },
  {
    id: "event.aftermath",
    slug: "aftermath",
    name: "Aftermath",
    englishName: "Aftermath",
    iastName: "Yuddha-anantara",
    aliases: ["Post-war", "Stri and Shanti", "Final journey"],
    summary:
      "Grief, counsel, and the closing of the age after Kurukṣetra.",
    description:
      "After the war and the Aśvamedha, the Strī, Śānti, Anuśāsana, and Mahāprasthānika movements complete the epic arc — mourning, governance, and the Pāṇḍavas' final departure.",
    sources: [
      MB("Strī Parva"),
      MB("Śānti Parva"),
      MB("Mahāprasthānika Parva"),
    ],
    importance: 5,
    event: {
      eventType: "other",
      timelineOrder: 150,
      participants: [
        "person.yudhishthira",
        "person.draupadi",
        "person.krishna",
        "person.gandhari",
        "person.dhritarashtra",
        "person.bhishma",
      ],
      places: ["city.hastinapura", "place.kurukshetra"],
      kingdoms: ["kingdom.kuru"],
      weapons: [],
      scriptures: ["scripture.bg"],
      chapters: [18],
      verses: [],
      relatedEvents: ["event.ashwamedha", "event.end-of-war"],
    },
  },
];

export const EVENT_ENTITIES: Entity[] = EVENT_SEEDS.map((s) =>
  base({
    id: s.id,
    slug: s.slug,
    kind: s.kind ?? "event",
    name: s.name,
    englishName: s.englishName,
    iastName: s.iastName,
    aliases: s.aliases ?? [],
    summary: s.summary,
    description: s.description,
    primaryScripture: "Mahābhārata",
    scriptureSources: s.sources,
    tags: ["mahabharata", "timeline", s.event.eventType],
    categories: ["event", s.event.eventType],
    importance: s.importance ?? 4,
    seo: {
      title: `${s.name} — Mahābhārata Events`,
      description: s.summary,
    },
    event: s.event,
  }),
);

function relationsForEvent(entity: Entity): Rel[] {
  const meta = entity.event;
  if (!meta) return [];
  const src = entity.scriptureSources;
  const out: Rel[] = [];

  for (const personId of meta.participants) {
    out.push(
      edge(personId, "participated-in", entity.id, src, "traditional"),
    );
  }
  for (const placeId of meta.places) {
    out.push(edge(entity.id, "occurred-at", placeId, src, "traditional"));
  }
  for (const kingdomId of meta.kingdoms) {
    out.push(
      edge(entity.id, "connected-to", kingdomId, src, "traditional", "kingdom"),
    );
  }
  for (const weaponId of meta.weapons) {
    out.push(
      edge(entity.id, "connected-to", weaponId, src, "traditional", "weapon"),
    );
  }
  for (const verseId of meta.verses) {
    out.push(edge(entity.id, "appears-in", verseId, src, "verified"));
  }
  for (const otherId of meta.relatedEvents) {
    if (meta.timelineOrder) {
      // Directed narrative link; order enforced by timelineOrder field.
      out.push(edge(entity.id, "connected-to", otherId, src, "traditional"));
    }
  }
  return out;
}

/** Ordered precedes edges along timelineOrder. */
function timelinePrecedes(): Rel[] {
  const sorted = [...EVENT_ENTITIES].sort(
    (a, b) =>
      (a.event?.timelineOrder ?? 0) - (b.event?.timelineOrder ?? 0),
  );
  const out: Rel[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i]!;
    const b = sorted[i + 1]!;
    out.push(
      edge(
        a.id,
        "precedes",
        b.id,
        a.scriptureSources,
        "traditional",
        "timeline",
      ),
    );
  }
  return out;
}

export const EVENT_RELATIONS: Rel[] = [
  ...EVENT_ENTITIES.flatMap(relationsForEvent),
  ...timelinePrecedes(),
];

export const EVENTS_COLLECTION = {
  id: "events.mahabharata",
  slug: "mahabharata-events",
  title: "Mahābhārata Events",
  kind: "events-layer" as const,
  sanskritTitle: "महाभारत घटनाक्रम",
  eyebrow: "Timeline",
  summary:
    "Major narrative events of the Mahābhārata — births, exile, the Gītā, and the war — linked across the Knowledge Graph.",
  description:
    "Events connects people, places, kingdoms, weapons, Gītā chapters, and verses. Each event is a shared Knowledge Graph entity.",
  status: "available" as const,
  entityIds: EVENT_ENTITIES.map((e) => e.id),
  scriptureSources: [MB("Ādi Parva"), MB("Bhīṣma Parva"), BG("1")],
  relatedGitaChapters: [1, 2, 11, 18],
  color: { accent: "#6a4530", tint: "#f0ddd0" },
  order: 4,
};

/**
 * Timeline eras — presentation bands that ONLY reference event entity ids.
 * No parallel narrative store; Timeline visualizes, Events explains.
 */
export const TIMELINE_ERA_COLLECTIONS = [
  {
    id: "timeline.creation",
    slug: "creation",
    title: "Creation",
    kind: "timeline-era" as const,
    sanskritTitle: "सृष्टि",
    eyebrow: "Epoch",
    summary: "Cosmic beginning before the dynastic age.",
    description:
      "Creation and the opening of cosmic order before the dynastic age.",
    status: "available" as const,
    entityIds: ["event.creation"],
    color: { accent: "#5c6d80", tint: "#dce6ee" },
    order: 1,
  },
  {
    id: "timeline.major-dynasties",
    slug: "major-dynasties",
    title: "Major Dynasties",
    kind: "timeline-era" as const,
    sanskritTitle: "महावंश",
    eyebrow: "Epoch",
    summary: "Solar, lunar, Yadu, and Kuru houses.",
    description:
      "Rise of the great houses of epic geography.",
    status: "available" as const,
    entityIds: ["event.major-dynasties"],
    color: { accent: "#7a5a2a", tint: "#efdfbd" },
    order: 2,
  },
  {
    id: "timeline.birth-of-krishna",
    slug: "birth-of-krishna",
    title: "Birth of Krishna",
    kind: "timeline-era" as const,
    sanskritTitle: "कृष्णजन्म",
    eyebrow: "Epoch",
    summary: "Kṛṣṇa enters the Yadu world.",
    description: "Kṛṣṇa is born in Mathurā and raised in Vraja.",
    status: "available" as const,
    entityIds: ["event.birth-of-krishna"],
    color: { accent: "#8a3b52", tint: "#f7d9dd" },
    order: 3,
  },
  {
    id: "timeline.pandavas",
    slug: "pandavas",
    title: "Pandavas",
    kind: "timeline-era" as const,
    sanskritTitle: "पाण्डवाः",
    eyebrow: "Epoch",
    summary: "Birth and rise of the five brothers.",
    description: "The five Pāṇḍavas enter the epic world.",
    status: "available" as const,
    entityIds: ["event.birth-of-pandavas"],
    color: { accent: "#5d6e37", tint: "#e9edcc" },
    order: 4,
  },
  {
    id: "timeline.kauravas",
    slug: "kauravas",
    title: "Kauravas",
    kind: "timeline-era" as const,
    sanskritTitle: "कौरवाः",
    eyebrow: "Epoch",
    summary: "Birth of Duryodhana's hundred.",
    description: "The Kaurava brothers are born at Hastināpura.",
    status: "available" as const,
    entityIds: ["event.birth-of-kauravas"],
    color: { accent: "#7c3f28", tint: "#f2d5c8" },
    order: 5,
  },
  {
    id: "timeline.major-events",
    slug: "major-mahabharata-events",
    title: "Major Mahabharata Events",
    kind: "timeline-era" as const,
    sanskritTitle: "महाभारत कथा",
    eyebrow: "Epoch",
    summary: "From the lacquer house to the field of war.",
    description:
      "Core narrative from the lacquer house through the end of the war.",
    status: "available" as const,
    entityIds: [
      "event.lakshagriha",
      "event.draupadi-swayamvara",
      "event.dice-game",
      "event.exile",
      "event.virata-parva",
      "event.krishna-peace-mission",
      "event.bhishmas-fall",
      "event.abhimanyus-death",
      "event.dronas-death",
      "event.karnas-death",
      "event.end-of-war",
    ],
    color: { accent: "#6a4530", tint: "#f0ddd0" },
    order: 6,
  },
  {
    id: "timeline.bhagavad-gita",
    slug: "bhagavad-gita",
    title: "Bhagavad Gita",
    kind: "timeline-era" as const,
    sanskritTitle: "भगवद्गीता",
    eyebrow: "Epoch",
    summary: "The discourse on the field of dharma.",
    description: "Kṛṣṇa teaches Arjuna between the armies at Kurukṣetra.",
    status: "available" as const,
    entityIds: ["event.bhagavad-gita"],
    color: { accent: "#4d6a86", tint: "#d5e2ee" },
    order: 7,
  },
  {
    id: "timeline.aftermath",
    slug: "aftermath",
    title: "Aftermath",
    kind: "timeline-era" as const,
    sanskritTitle: "युद्धानन्तरम्",
    eyebrow: "Epoch",
    summary: "Sacrifice, grief, and the closing of the age.",
    description: "Horse sacrifice, mourning, and the close of the age.",
    status: "available" as const,
    entityIds: ["event.ashwamedha", "event.aftermath"],
    color: { accent: "#5a5560", tint: "#e4e0e8" },
    order: 8,
  },
];
