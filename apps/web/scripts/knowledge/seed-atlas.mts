/**
 * Mahābhārata-era Atlas places + travel routes (citation-first).
 * Enriches shared KG entities with `atlas` fields — no parallel place DB.
 * Ayodhyā / Rāmāyaṇa geography is intentionally excluded from the Atlas layer.
 */
import { makeRelationId } from "./helpers.mts";

type Cite = {
  work: string;
  section?: string;
  chapter?: string;
  verse?: string;
  note?: string;
};

type AtlasMeta = {
  latitude: number;
  longitude: number;
  modernLocation: string;
  kingdom?: string;
  scripturalSignificance?: string;
  atlasCategory?:
    | "kingdom"
    | "city"
    | "forest"
    | "battlefield"
    | "ashrama"
    | "river"
    | "mountain"
    | "pilgrimage"
    | "sacred";
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
  atlas: AtlasMeta;
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

type Route = {
  id: string;
  slug: string;
  title: string;
  iastTitle?: string;
  summary: string;
  description: string;
  placeIds: string[];
  confidence: "verified" | "traditional" | "variant";
  sources: Cite[];
  stroke?: string;
  order: number;
};

const MB = (parva: string, ch?: string, note?: string): Cite => ({
  work: "Mahābhārata",
  section: parva,
  ...(ch ? { chapter: ch } : {}),
  ...(note ? { note } : {}),
});
const BP = (sk: string, ch?: string): Cite => ({
  work: "Bhāgavata Purāṇa",
  section: `Skandha ${sk}`,
  ...(ch ? { chapter: ch } : {}),
});
const BG = (ch: string): Cite => ({ work: "Bhagavad Gītā", chapter: ch });
const HV = (note?: string): Cite => ({
  work: "Harivaṃśa",
  ...(note ? { note } : {}),
});

function place(
  partial: Omit<
    Entity,
    "status" | "schemaVersion" | "variantTraditions" | "era"
  > & { era?: string },
): Entity {
  return {
    status: "published",
    schemaVersion: 1,
    era: partial.era ?? "dvapara-yuga",
    variantTraditions: [],
    ...partial,
  };
}

/** Full Mahābhārata Atlas place set (merges over prior place stubs by id). */
export const ATLAS_PLACE_ENTITIES: Entity[] = [
  place({
    id: "city.hastinapura",
    slug: "hastinapura",
    kind: "city",
    name: "Hastināpura",
    englishName: "Hastinapura",
    iastName: "Hastināpura",
    aliases: ["Hastinapur", "City of the Elephants"],
    summary: "Capital of the Kuru kingdom in the Mahābhārata.",
    description:
      "Hastināpura is the seat of the Kuru kings — Śaṃtanu, Dhṛtarāṣṭra and the court from which the epic war narrative unfolds.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Ādi Parva")],
    tags: ["kuru", "capital"],
    categories: ["city"],
    importance: 5,
    seo: {
      title: "Hastināpura — Atlas",
      description: "Kuru capital on the Mahābhārata Atlas.",
    },
    atlas: {
      latitude: 29.16,
      longitude: 78.02,
      modernLocation: "Near Meerut, Uttar Pradesh",
      kingdom: "Kuru",
      scripturalSignificance:
        "Capital of the Kurus; court of Dhṛtarāṣṭra and seat of the epic's political drama.",
      atlasCategory: "city",
    },
  }),
  place({
    id: "city.indraprastha",
    slug: "indraprastha",
    kind: "city",
    name: "Indraprastha",
    englishName: "Indraprastha",
    iastName: "Indraprastha",
    aliases: ["Khandavaprastha", "City of Indra"],
    summary: "Capital raised by the Pāṇḍavas on the Khāṇḍava tract.",
    description:
      "Indraprastha is the splendid city the Pāṇḍavas build after receiving half the kingdom; Maya constructs its hall, and Yudhiṣṭhira's Rājasūya is celebrated here.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Ādi Parva"), MB("Sabhā Parva")],
    tags: ["pandava", "capital"],
    categories: ["city"],
    importance: 5,
    seo: { title: "Indraprastha" },
    atlas: {
      latitude: 28.61,
      longitude: 77.21,
      modernLocation: "Delhi",
      kingdom: "Kuru (Pāṇḍava)",
      scripturalSignificance:
        "Pāṇḍava capital; Maya's hall and the Rājasūya of Yudhiṣṭhira.",
      atlasCategory: "city",
    },
  }),
  place({
    id: "place.kurukshetra",
    slug: "kurukshetra",
    kind: "pilgrimage",
    name: "Kurukṣetra",
    englishName: "Kurukshetra",
    iastName: "Kurukṣetra",
    aliases: ["Dharmakshetra", "Field of the Kurus", "Samantapancaka"],
    summary:
      "Battlefield of the Mahābhārata war and setting of the Bhagavad Gītā.",
    description:
      "Kurukṣetra is the sacred plain where the Kauravas and Pāṇḍavas fought. The Bhagavad Gītā opens with Arjuna's despondency on this field — Dharmakṣetra, Kurukṣetra.",
    primaryScripture: "Bhagavad Gītā",
    scriptureSources: [BG("1"), MB("Bhīṣma Parva")],
    tags: ["battle", "gita"],
    categories: ["pilgrimage", "battlefield"],
    importance: 5,
    seo: { title: "Kurukṣetra" },
    atlas: {
      latitude: 29.97,
      longitude: 76.88,
      modernLocation: "Haryana",
      kingdom: "Kuru",
      scripturalSignificance:
        "Site of the eighteen-day war; the Gītā is spoken here between Kṛṣṇa and Arjuna.",
      atlasCategory: "battlefield",
    },
  }),
  place({
    id: "city.dvaraka",
    slug: "dwaraka",
    kind: "city",
    name: "Dvārakā",
    englishName: "Dwaraka",
    iastName: "Dvārakā",
    aliases: ["Dvaravati", "Dwaraka", "Kushasthali"],
    summary: "Ocean capital of Kṛṣṇa and the Yādavas.",
    description:
      "Dvārakā is the fortified island city Kṛṣṇa establishes after leaving Mathurā; it is the Yadu capital until its submergence at the close of the Dvāpara age.",
    primaryScripture: "Bhāgavata Purāṇa",
    scriptureSources: [BP("10"), MB("Mausala Parva"), HV()],
    tags: ["yadu", "krishna", "capital"],
    categories: ["city", "pilgrimage"],
    importance: 5,
    seo: { title: "Dvārakā" },
    atlas: {
      latitude: 22.24,
      longitude: 68.97,
      modernLocation: "Gujarat",
      kingdom: "Yadu",
      scripturalSignificance:
        "Kṛṣṇa's capital after Mathurā; later submerged in the Mausala narrative.",
      atlasCategory: "city",
    },
  }),
  place({
    id: "city.mathura",
    slug: "mathura",
    kind: "city",
    name: "Mathurā",
    englishName: "Mathura",
    iastName: "Mathurā",
    aliases: ["Madhura", "Mathura"],
    summary: "City of Kaṃsa and early seat of Kṛṣṇa's deeds.",
    description:
      "Mathurā on the Yamunā is where Vasudeva brings the infant Kṛṣṇa past Kaṃsa's prison, and where Kṛṣṇa later slays Kaṃsa before founding Dvārakā.",
    primaryScripture: "Bhāgavata Purāṇa",
    scriptureSources: [BP("10"), HV()],
    tags: ["yadu", "krishna"],
    categories: ["city", "pilgrimage"],
    importance: 5,
    seo: { title: "Mathurā" },
    atlas: {
      latitude: 27.49,
      longitude: 77.67,
      modernLocation: "Uttar Pradesh",
      kingdom: "Śūrasena / Yadu",
      scripturalSignificance:
        "Kaṃsa's capital; scene of Kṛṣṇa's childhood return and Kaṃsa-vadha.",
      atlasCategory: "city",
    },
  }),
  place({
    id: "place.vrindavana",
    slug: "vrindavana",
    kind: "pilgrimage",
    name: "Vṛndāvana",
    englishName: "Vrindavana",
    iastName: "Vṛndāvana",
    aliases: ["Vrindavan", "Brindaban"],
    summary: "Forest grove of Kṛṣṇa's childhood līlās.",
    description:
      "Vṛndāvana is the pastoral landscape of Kṛṣṇa's cowherd years — rāsa, lifting of Govardhana, and the affection of the gopīs — celebrated in the Bhāgavata's tenth skandha.",
    primaryScripture: "Bhāgavata Purāṇa",
    scriptureSources: [BP("10")],
    tags: ["krishna", "bhakti"],
    categories: ["pilgrimage", "forest", "sacred"],
    importance: 5,
    seo: { title: "Vṛndāvana" },
    atlas: {
      latitude: 27.58,
      longitude: 77.7,
      modernLocation: "Uttar Pradesh (near Mathurā)",
      kingdom: "Vraja",
      scripturalSignificance:
        "Setting of Kṛṣṇa's youthful līlās in the Bhāgavata Purāṇa.",
      atlasCategory: "pilgrimage",
    },
  }),
  place({
    id: "place.gokula",
    slug: "gokula",
    kind: "city",
    name: "Gokula",
    englishName: "Gokula",
    iastName: "Gokula",
    aliases: ["Mahavana", "Gokul"],
    summary: "Cowherd settlement where Kṛṣṇa is raised by Nanda and Yaśodā.",
    description:
      "Gokula (with nearby Mahāvana) is the pastoral home of Nanda's clan where the infant Kṛṣṇa is brought after birth in Mathurā.",
    primaryScripture: "Bhāgavata Purāṇa",
    scriptureSources: [BP("10")],
    tags: ["krishna", "vraja"],
    categories: ["city", "sacred"],
    importance: 4,
    seo: { title: "Gokula" },
    atlas: {
      latitude: 27.44,
      longitude: 77.72,
      modernLocation: "Uttar Pradesh (near Mathurā)",
      kingdom: "Vraja",
      scripturalSignificance: "Nanda-Gopa's settlement; Kṛṣṇa's infancy.",
      atlasCategory: "city",
    },
  }),
  place({
    id: "mountain.govardhana",
    slug: "govardhana",
    kind: "mountain",
    name: "Govardhana",
    englishName: "Govardhana",
    iastName: "Govardhana",
    aliases: ["Giriraja", "Govardhan Hill"],
    summary: "Hill lifted by Kṛṣṇa to shelter the cowherds from Indra's storm.",
    description:
      "Govardhana is the hill Kṛṣṇa raises on his little finger for seven days, ending Indra's pride and establishing Govardhana-pūjā among the Vraja folk.",
    primaryScripture: "Bhāgavata Purāṇa",
    scriptureSources: [BP("10", "25")],
    tags: ["krishna", "vraja"],
    categories: ["mountain", "sacred"],
    importance: 5,
    seo: { title: "Govardhana" },
    atlas: {
      latitude: 27.5,
      longitude: 77.47,
      modernLocation: "Uttar Pradesh (near Mathurā)",
      kingdom: "Vraja",
      scripturalSignificance: "Site of Govardhana-dhāraṇa in Bhāgavata 10.",
      atlasCategory: "mountain",
    },
  }),
  place({
    id: "kingdom.pancala",
    slug: "panchala",
    kind: "kingdom",
    name: "Pañcāla",
    englishName: "Panchala",
    iastName: "Pañcāla",
    aliases: ["Panchala", "Southern Panchala"],
    summary: "Kingdom of Drupada; home of Draupadī and Dhṛṣṭadyumna.",
    description:
      "Pañcāla is the realm of King Drupada. Its court hosts Draupadī's svayaṃvara, binding the Pāṇḍavas to the Pañcāla alliance that shapes the war.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Ādi Parva")],
    tags: ["drupada", "draupadi"],
    categories: ["kingdom"],
    importance: 4,
    seo: { title: "Pañcāla" },
    atlas: {
      latitude: 27.9,
      longitude: 79.0,
      modernLocation: "Western Uttar Pradesh",
      kingdom: "Pañcāla",
      scripturalSignificance:
        "Drupada's realm; Draupadī's svayaṃvara and Pāṇḍava marriage alliance.",
      atlasCategory: "kingdom",
    },
  }),
  place({
    id: "kingdom.gandhara",
    slug: "gandhara",
    kind: "kingdom",
    name: "Gāndhāra",
    englishName: "Gandhara",
    iastName: "Gāndhāra",
    aliases: ["Gandhara", "Takshashila region"],
    summary: "Northwestern kingdom of Gāndhārī and Śakuni.",
    description:
      "Gāndhāra is the homeland of Gāndhārī and her brother Śakuni, whose counsel shapes the dice game and the path to war.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Ādi Parva")],
    tags: ["gandhari", "shakuni"],
    categories: ["kingdom"],
    importance: 4,
    seo: { title: "Gāndhāra" },
    atlas: {
      latitude: 34.0,
      longitude: 71.5,
      modernLocation: "Northwest Pakistan / Eastern Afghanistan",
      kingdom: "Gāndhāra",
      scripturalSignificance: "Origin of Gāndhārī and Śakuni.",
      atlasCategory: "kingdom",
    },
  }),
  place({
    id: "kingdom.magadha",
    slug: "magadha",
    kind: "kingdom",
    name: "Magadha",
    englishName: "Magadha",
    iastName: "Magadha",
    aliases: ["Girivraja", "Rajagriha"],
    summary: "Eastern kingdom of Jarāsandha at Girivraja.",
    description:
      "Magadha under Jarāsandha is a major power opposing Kṛṣṇa and the Yadus; Bhīma later slays Jarāsandha so Yudhiṣṭhira's Rājasūya may proceed.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Sabhā Parva"), BP("10")],
    tags: ["jarasandha"],
    categories: ["kingdom"],
    importance: 4,
    seo: { title: "Magadha" },
    atlas: {
      latitude: 24.7,
      longitude: 85.0,
      modernLocation: "Bihar (around Rajgir / Patna region)",
      kingdom: "Magadha",
      scripturalSignificance:
        "Jarāsandha's capital; Bhīma's duel enables the Rājasūya.",
      atlasCategory: "kingdom",
    },
  }),
  place({
    id: "kingdom.kashi",
    slug: "kashi",
    kind: "kingdom",
    name: "Kāśī",
    englishName: "Kashi",
    iastName: "Kāśī",
    aliases: ["Varanasi", "Banaras", "Kasi"],
    summary: "Ancient kingdom and sacred city on the Gaṅgā.",
    description:
      "Kāśī appears in marriage alliances and pilgrim geography of the Mahābhārata; it remains one of the great sacred cities of Bhārata.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Ādi Parva", undefined, "marriage alliances")],
    tags: ["sacred", "ganga"],
    categories: ["kingdom", "pilgrimage", "city"],
    importance: 4,
    seo: { title: "Kāśī" },
    atlas: {
      latitude: 25.32,
      longitude: 83.01,
      modernLocation: "Varanasi, Uttar Pradesh",
      kingdom: "Kāśī",
      scripturalSignificance:
        "Sacred Gaṅgā city referenced in epic marriage and pilgrimage lore.",
      atlasCategory: "kingdom",
    },
  }),
  place({
    id: "kingdom.virata",
    slug: "virata",
    kind: "kingdom",
    name: "Virāṭa",
    englishName: "Virata",
    iastName: "Virāṭa",
    aliases: ["Matsya", "Virata's kingdom"],
    summary: "Matsya kingdom where the Pāṇḍavas spend their year in disguise.",
    description:
      "The kingdom of Virāṭa (Matsya) is the setting of the Virāṭa Parva — the Pāṇḍavas' thirteenth year of exile in disguise, ending with the recovery of the Kaurava cattle raid.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Virāṭa Parva")],
    tags: ["pandava", "exile"],
    categories: ["kingdom"],
    importance: 4,
    seo: { title: "Virāṭa" },
    atlas: {
      latitude: 26.9,
      longitude: 76.3,
      modernLocation:
        "Rajasthan / northeastern Rajasthan region (traditional)",
      kingdom: "Matsya (Virāṭa)",
      scripturalSignificance: "Setting of the Pāṇḍavas' year of ajñātavāsa.",
      atlasCategory: "kingdom",
    },
  }),
  place({
    id: "forest.kamyaka",
    slug: "kamyaka",
    kind: "forest",
    name: "Kāmyaka Forest",
    englishName: "Kamyaka Forest",
    iastName: "Kāmyaka-vana",
    aliases: ["Kamyaka"],
    summary: "Forest refuge of the Pāṇḍavas during exile.",
    description:
      "Kāmyaka is one of the principal forests of the Pāṇḍava exile, visited alongside Dvaita and other hermitage landscapes of the Vana Parva.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Vana Parva")],
    tags: ["exile", "pandava"],
    categories: ["forest"],
    importance: 3,
    seo: { title: "Kāmyaka Forest" },
    atlas: {
      latitude: 29.4,
      longitude: 75.5,
      modernLocation:
        "Northwestern Rajasthan / southern Haryana region (approximate)",
      kingdom: "Kuru marches",
      scripturalSignificance: "Pāṇḍava exile forest in the Vana Parva.",
      atlasCategory: "forest",
    },
  }),
  place({
    id: "forest.dvaita",
    slug: "dvaita",
    kind: "forest",
    name: "Dvaita Forest",
    englishName: "Dvaita Forest",
    iastName: "Dvaita-vana",
    aliases: ["Dvaitavana"],
    summary: "Exile forest associated with the Pāṇḍavas and lake episodes.",
    description:
      "Dvaita-vana is another major forest of the Pāṇḍava exile narrative, paired with Kāmyaka in the wanderings of the Vana Parva.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Vana Parva")],
    tags: ["exile", "pandava"],
    categories: ["forest"],
    importance: 3,
    seo: { title: "Dvaita Forest" },
    atlas: {
      latitude: 29.1,
      longitude: 74.8,
      modernLocation:
        "Northwestern India (approximate traditional placement)",
      scripturalSignificance: "Pāṇḍava exile forest of the Vana Parva.",
      atlasCategory: "forest",
    },
  }),
  place({
    id: "forest.naimisharanya",
    slug: "naimisharanya",
    kind: "forest",
    name: "Naimiṣāraṇya",
    englishName: "Naimisharanya",
    iastName: "Naimiṣāraṇya",
    aliases: ["Naimisha", "Naimisaranya"],
    summary: "Sacred forest where sages hear the telling of the Mahābhārata.",
    description:
      "Naimiṣāraṇya is the hermitage forest where the Sūta recounts the Mahābhārata to assembled ṛṣis — the frame setting of the epic's narration.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Ādi Parva")],
    tags: ["sages", "narration"],
    categories: ["forest", "ashrama", "sacred"],
    importance: 4,
    seo: { title: "Naimiṣāraṇya" },
    atlas: {
      latitude: 27.4,
      longitude: 80.5,
      modernLocation: "Sitapur region, Uttar Pradesh (traditional)",
      scripturalSignificance:
        "Frame setting where the epic is recited to the sages.",
      atlasCategory: "forest",
    },
  }),
  place({
    id: "place.badarikashrama",
    slug: "badarikashrama",
    kind: "pilgrimage",
    name: "Badarikāśrama",
    englishName: "Badarikashrama",
    iastName: "Badarikāśrama",
    aliases: ["Badrinath", "Badari", "Badarikashrama"],
    summary: "Himalayan āśrama of Nara-Nārāyaṇa; pilgrimage of the epic.",
    description:
      "Badarikāśrama in the high Himalaya is linked to Nara-Nārāyaṇa and appears among the great northern tīrthas visited in Mahābhārata pilgrimage lore.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Vana Parva"), MB("Śānti Parva")],
    tags: ["ashrama", "himalaya", "tirtha"],
    categories: ["ashrama", "pilgrimage", "sacred"],
    importance: 4,
    seo: { title: "Badarikāśrama" },
    atlas: {
      latitude: 30.74,
      longitude: 79.49,
      modernLocation: "Badrinath, Uttarakhand",
      scripturalSignificance: "Sacred Himalayan āśrama and northern tīrtha.",
      atlasCategory: "ashrama",
    },
  }),
  place({
    id: "river.ganga",
    slug: "ganga",
    kind: "river",
    name: "Gaṅgā",
    englishName: "Ganga",
    iastName: "Gaṅgā",
    aliases: ["Ganges", "Jahnavi", "Bhagirathi"],
    summary: "Sacred river; mother of Bhīṣma in the epic genealogy.",
    description:
      "Gaṅgā is both goddess and river — mother of Bhīṣma by Śaṃtanu, and the purifying stream that defines much of northern sacred geography.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Ādi Parva")],
    tags: ["river", "devi"],
    categories: ["river", "devi"],
    importance: 5,
    seo: { title: "Gaṅgā" },
    externalRefs: { genealogyId: "ganga" },
    era: "eternal",
    atlas: {
      latitude: 27.5,
      longitude: 80.5,
      modernLocation: "Ganges river system, North India",
      scripturalSignificance:
        "Mother of Bhīṣma; foremost sacred river of Bhārata.",
      atlasCategory: "river",
    },
  }),
  place({
    id: "river.yamuna",
    slug: "yamuna",
    kind: "river",
    name: "Yamunā",
    englishName: "Yamuna",
    iastName: "Yamunā",
    aliases: ["Jamuna", "Kalindi"],
    summary: "River of Mathurā–Vṛndāvana and Kṛṣṇa's childhood landscape.",
    description:
      "Yamunā flows past Mathurā and Vraja; Kṛṣṇa's childhood narratives — Kāliya, boat crossings, and gopa play — unfold along her banks.",
    primaryScripture: "Bhāgavata Purāṇa",
    scriptureSources: [BP("10"), MB("Ādi Parva")],
    tags: ["river", "vraja"],
    categories: ["river"],
    importance: 5,
    seo: { title: "Yamunā" },
    atlas: {
      latitude: 27.5,
      longitude: 77.6,
      modernLocation: "Yamuna river, North India",
      scripturalSignificance: "River of Vraja and Mathurā in Kṛṣṇa-līlā.",
      atlasCategory: "river",
    },
  }),
  place({
    id: "river.sarasvati",
    slug: "sarasvati",
    kind: "river",
    name: "Sarasvatī",
    englishName: "Sarasvati",
    iastName: "Sarasvatī",
    aliases: ["Saraswati"],
    summary: "Sacred river of Kurukṣetra lore and Vedic memory.",
    description:
      "Sarasvatī is praised in Vedic and epic geography; near Kurukṣetra she figures in tīrtha lore associated with the field of the Kurus.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Vana Parva"), MB("Śalya Parva")],
    tags: ["river", "tirtha"],
    categories: ["river", "sacred"],
    importance: 4,
    seo: { title: "Sarasvatī" },
    atlas: {
      latitude: 29.8,
      longitude: 76.5,
      modernLocation:
        "Ghaggar–Hakra / Kurukṣetra region (traditional identification)",
      scripturalSignificance:
        "Sacred river tied to Kurukṣetra tīrtha geography.",
      atlasCategory: "river",
    },
  }),
  place({
    id: "river.sindhu",
    slug: "sindhu",
    kind: "river",
    name: "Sindhu",
    englishName: "Sindhu",
    iastName: "Sindhu",
    aliases: ["Indus", "Sindh"],
    summary: "Great western river marking the edge of epic Bhārata.",
    description:
      "Sindhu is the mighty western river of Bhārata's geography, bounding northwestern kingdoms such as Gāndhāra in the epic world-map.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Bhīṣma Parva", undefined, "digvijaya / geography")],
    tags: ["river"],
    categories: ["river"],
    importance: 4,
    seo: { title: "Sindhu" },
    atlas: {
      latitude: 28.0,
      longitude: 69.0,
      modernLocation: "Indus river (Pakistan / northwest)",
      scripturalSignificance: "Western river of epic Bhārata geography.",
      atlasCategory: "river",
    },
  }),
  place({
    id: "mountain.meru",
    slug: "meru",
    kind: "mountain",
    name: "Meru",
    englishName: "Meru",
    iastName: "Meru",
    aliases: ["Sumeru", "Mount Meru"],
    summary: "Cosmic axis mountain of Purāṇic and epic cosmology.",
    description:
      "Meru is the golden mountain at the center of traditional cosmology — more cosmological than political, yet essential to the epic's sacred geography.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Bhīṣma Parva"), BP("5")],
    tags: ["cosmology", "mountain"],
    categories: ["mountain", "sacred"],
    importance: 5,
    seo: { title: "Meru" },
    era: "eternal",
    atlas: {
      latitude: 31.0,
      longitude: 80.0,
      modernLocation: "Himalayan / cosmological north (symbolic placement)",
      scripturalSignificance: "Axis mundi of traditional Hindu cosmology.",
      atlasCategory: "mountain",
    },
  }),
];

export const ATLAS_ENTITY_IDS = ATLAS_PLACE_ENTITIES.map((e) => e.id);

export const ATLAS_COLLECTION = {
  id: "atlas.mahabharata",
  slug: "mahabharata",
  title: "Mahābhārata Atlas",
  kind: "atlas-layer" as const,
  sanskritTitle: "महाभारतकालीन भारत",
  eyebrow: "Ancient Bhārata",
  summary:
    "Interactive map of kingdoms, cities, forests, rivers and sacred places of the Mahābhārata world.",
  description:
    "Phase 1 Atlas layer — Mahābhārata-era geography only. Places are shared Knowledge Graph entities; Atlas visualizes, Encyclopedia explains. Approximate modern locations are educational context, not survey precision.",
  status: "available" as const,
  entityIds: ATLAS_ENTITY_IDS,
  scriptureSources: [MB("Bhīṣma Parva"), MB("Vana Parva")],
  relatedGitaChapters: [1, 2],
  color: { accent: "#6a4b1e", tint: "#f0e0bd" },
  order: 5,
};

/** Sparse person↔place links for Atlas drawers (citation-backed). */
export const ATLAS_RELATIONS: Rel[] = [
  {
    id: makeRelationId("person.yudhishthira", "king-of", "city.indraprastha"),
    fromId: "person.yudhishthira",
    toId: "city.indraprastha",
    type: "king-of",
    confidence: "verified",
    sources: [MB("Sabhā Parva")],
  },
  {
    id: makeRelationId("person.krishna", "king-of", "city.dvaraka"),
    fromId: "person.krishna",
    toId: "city.dvaraka",
    type: "king-of",
    confidence: "traditional",
    sources: [BP("10"), HV()],
    note: "Yadu lord of Dvārakā after leaving Mathurā.",
  },
  {
    id: makeRelationId("person.krishna", "resident-of", "place.vrindavana"),
    fromId: "person.krishna",
    toId: "place.vrindavana",
    type: "resident-of",
    confidence: "verified",
    sources: [BP("10")],
  },
  {
    id: makeRelationId("person.krishna", "resident-of", "place.gokula"),
    fromId: "person.krishna",
    toId: "place.gokula",
    type: "resident-of",
    confidence: "verified",
    sources: [BP("10")],
  },
  {
    id: makeRelationId("person.draupadi", "resident-of", "kingdom.pancala"),
    fromId: "person.draupadi",
    toId: "kingdom.pancala",
    type: "resident-of",
    confidence: "verified",
    sources: [MB("Ādi Parva")],
  },
  {
    id: makeRelationId("person.gandhari", "resident-of", "kingdom.gandhara"),
    fromId: "person.gandhari",
    toId: "kingdom.gandhara",
    type: "resident-of",
    confidence: "verified",
    sources: [MB("Ādi Parva")],
  },
  {
    id: makeRelationId("person.bhima", "fought", "kingdom.magadha"),
    fromId: "person.bhima",
    toId: "kingdom.magadha",
    type: "fought",
    confidence: "verified",
    sources: [MB("Sabhā Parva")],
    note: "Slays Jarāsandha at Girivraja.",
  },
  {
    id: makeRelationId("person.arjuna", "visited", "kingdom.virata"),
    fromId: "person.arjuna",
    toId: "kingdom.virata",
    type: "visited",
    confidence: "verified",
    sources: [MB("Virāṭa Parva")],
  },
  {
    id: makeRelationId("person.yudhishthira", "visited", "forest.kamyaka"),
    fromId: "person.yudhishthira",
    toId: "forest.kamyaka",
    type: "visited",
    confidence: "verified",
    sources: [MB("Vana Parva")],
  },
  {
    id: makeRelationId("person.yudhishthira", "visited", "forest.dvaita"),
    fromId: "person.yudhishthira",
    toId: "forest.dvaita",
    type: "visited",
    confidence: "verified",
    sources: [MB("Vana Parva")],
  },
  {
    id: makeRelationId("place.kurukshetra", "mentioned-in", "verse.bg.1.1"),
    fromId: "place.kurukshetra",
    toId: "verse.bg.1.1",
    type: "mentioned-in",
    confidence: "verified",
    sources: [BG("1")],
  },
];

export const ATLAS_VERSE_STUB_ENTITIES = [
  {
    id: "verse.bg.1.1",
    slug: "bg-1-1",
    kind: "verse",
    name: "Dhṛtarāṣṭra said — on the field of Dharma",
    englishName: "bg.1.1",
    iastName: "dharmakṣetre kurukṣetre",
    aliases: ["bg.1.1"],
    summary: "Opening verse of the Bhagavad Gītā naming Kurukṣetra.",
    description:
      "Stub linking Atlas Kurukṣetra to Bhagavad Gītā 1.1. Full text lives in the reader corpus.",
    primaryScripture: "Bhagavad Gītā",
    scriptureSources: [BG("1")],
    tags: ["gita", "verse"],
    categories: ["verse"],
    importance: 5,
    seo: { title: "BG 1.1" },
    externalRefs: { workCode: "bg", publicId: "bg.1.1" },
    status: "published" as const,
    schemaVersion: 1,
    era: "dvapara-yuga",
    variantTraditions: [] as [],
  },
];

export const ATLAS_ROUTES: Route[] = [
  {
    id: "route.pandava-exile",
    slug: "pandava-exile",
    title: "Pāṇḍava Exile",
    iastTitle: "Pāṇḍava-vanavāsa",
    summary: "Forest wanderings of the Pāṇḍavas during the twelve-year exile.",
    description:
      "A simplified path through principal exile landscapes named in the Vana Parva — Kāmyaka and Dvaita — toward the year in disguise at Virāṭa.",
    placeIds: [
      "city.indraprastha",
      "forest.kamyaka",
      "forest.dvaita",
      "kingdom.virata",
    ],
    confidence: "traditional",
    sources: [MB("Vana Parva"), MB("Virāṭa Parva")],
    stroke: "#8a5a2b",
    order: 10,
  },
  {
    id: "route.krishna-journey",
    slug: "krishna-journey",
    title: "Kṛṣṇa's Journey",
    iastTitle: "Kṛṣṇa-yātrā",
    summary: "From Vraja and Mathurā to the ocean capital Dvārakā.",
    description:
      "Educational path linking Gokula–Vṛndāvana–Mathurā with Dvārakā after Kaṃsa's fall — a traditional narrative arc, not a surveyed itinerary.",
    placeIds: [
      "place.gokula",
      "place.vrindavana",
      "city.mathura",
      "city.dvaraka",
    ],
    confidence: "traditional",
    sources: [BP("10"), HV()],
    stroke: "#6b3a5a",
    order: 20,
  },
  {
    id: "route.arjuna-digvijaya",
    slug: "arjuna-digvijaya",
    title: "Arjuna's Digvijaya",
    iastTitle: "Arjuna-digvijaya",
    summary: "Indicative northern–eastern arc of Arjuna's conquest circuit.",
    description:
      "A schematic digvijaya spine for Atlas visualization — Indraprastha outward toward Magadha and the Gaṅgā lands — not a complete itinerary of every campaign.",
    placeIds: [
      "city.indraprastha",
      "kingdom.pancala",
      "kingdom.kashi",
      "kingdom.magadha",
    ],
    confidence: "traditional",
    sources: [MB("Sabhā Parva")],
    stroke: "#3d5c3a",
    order: 30,
  },
  {
    id: "route.balarama-pilgrimage",
    slug: "balarama-pilgrimage",
    title: "Balarāma's Pilgrimage",
    iastTitle: "Balarāma-tīrthayātrā",
    summary: "Pilgrim path associated with Balarāma during the war.",
    description:
      "Traditional accounts have Balarāma leave the Kurukṣetra war for a tīrtha-yātrā along sacred rivers. This Atlas path is a respectful simplification for exploration.",
    placeIds: [
      "place.kurukshetra",
      "river.sarasvati",
      "river.yamuna",
      "river.ganga",
      "forest.naimisharanya",
    ],
    confidence: "traditional",
    sources: [MB("Śalya Parva")],
    stroke: "#4d6a86",
    order: 40,
  },
];
