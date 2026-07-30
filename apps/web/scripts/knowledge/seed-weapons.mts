/**
 * Mahābhārata weapons encyclopedia — shared KG entities (kind: weapon).
 * Categories and narrative focus live on entity.weapon; pages resolve the rest
 * from cited relations + event hubs. No parallel weapons store.
 */
import { makeRelationId, type Cite, type Confidence } from "./helpers.mts";

type Rel = {
  id: string;
  fromId: string;
  toId: string;
  type: string;
  confidence: Confidence;
  sources: Cite[];
  note?: string;
};

type WeaponMeta = {
  category:
    | "astra"
    | "bow"
    | "mace"
    | "sword"
    | "spear"
    | "conch"
    | "chariot"
    | "sacred-object";
  focus: "mahabharata" | "broader-hindu";
  powers?: string[];
  notableUses?: string[];
  counters?: string[];
  counterWeaponIds?: string[];
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
  status: string;
  era: string;
  variantTraditions: unknown[];
  schemaVersion: number;
  seo: { title: string; description?: string };
  sanskritName?: string;
  weapon: WeaponMeta;
};

const MB = (section: string, note?: string): Cite => ({
  work: "Mahābhārata",
  section,
  ...(note ? { note } : {}),
});

const BG = (ch: string, verse?: string): Cite => ({
  work: "Bhagavad Gītā",
  chapter: ch,
  ...(verse ? { verse } : {}),
});

const RV = (section?: string): Cite => ({
  work: "Ṛg Veda",
  ...(section ? { section } : {}),
});

const SP = (): Cite => ({ work: "Śiva Purāṇa" });

function base(
  partial: Omit<Entity, "status" | "era" | "variantTraditions" | "schemaVersion"> &
    Partial<Pick<Entity, "status" | "era">>,
): Entity {
  return {
    status: "published",
    era: "dvapara-yuga",
    variantTraditions: [],
    schemaVersion: 1,
    ...partial,
  };
}

function edge(
  fromId: string,
  type: string,
  toId: string,
  sources: Cite[],
  confidence: Confidence = "traditional",
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

export const WEAPON_ENTITIES: Entity[] = [
  // ── Bows ──────────────────────────────────────────────
  base({
    id: "weapon.gandiva",
    slug: "gandiva",
    kind: "weapon",
    name: "Gāṇḍīva",
    englishName: "Gandiva",
    iastName: "Gāṇḍīva",
    sanskritName: "गाण्डीव",
    aliases: ["Gandiva bow", "Gaandiva"],
    summary: "Arjuna's celestial bow through exile and the Kurukṣetra war.",
    description:
      "Gāṇḍīva is the divine bow associated with Arjuna. Epic tradition ties it to a gift mediated by Agni and Varuṇa. With it Arjuna fights through the war, the exile episodes, and the horse sacrifice that follows victory.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Ādi Parva"), MB("Bhīṣma Parva"), BG("1")],
    tags: ["bow", "arjuna", "mahabharata"],
    categories: ["weapon", "bow"],
    importance: 5,
    seo: {
      title: "Gāṇḍīva",
      description: "Arjuna's celestial bow in the Mahābhārata.",
    },
    weapon: {
      category: "bow",
      focus: "mahabharata",
      powers: [
        "Inexhaustible quiver tradition",
        "Celestial range and force in war narratives",
      ],
      notableUses: [
        "Draupadī's svayaṃvara contest",
        "Burning of the Khāṇḍava forest",
        "Kurukṣetra war under Kṛṣṇa's charioteering",
      ],
      counters: [],
    },
  }),
  base({
    id: "weapon.vijaya-bow",
    slug: "vijaya-bow",
    kind: "weapon",
    name: "Vijaya",
    englishName: "Vijaya bow",
    iastName: "Vijaya",
    sanskritName: "विजय",
    aliases: ["Vijaya", "Karna's bow"],
    summary: "Karṇa's formidable bow in the Kurukṣetra narratives.",
    description:
      "Vijaya is named as Karṇa's great bow during the war. Tradition associates it with earlier divine ownership; in the Karṇa Parva it stands opposite Arjuna's Gāṇḍīva until Karṇa's death.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Karṇa Parva")],
    tags: ["bow", "karna", "mahabharata"],
    categories: ["weapon", "bow"],
    importance: 4,
    seo: {
      title: "Vijaya",
      description: "Karṇa's bow in the Mahābhārata war.",
    },
    weapon: {
      category: "bow",
      focus: "mahabharata",
      powers: ["Said to grant victory to a worthy wielder"],
      notableUses: ["Karṇa Parva duel with Arjuna"],
      counters: [],
    },
  }),
  base({
    id: "weapon.sharanga",
    slug: "sharanga",
    kind: "weapon",
    name: "Śārṅga",
    englishName: "Sharanga",
    iastName: "Śārṅga",
    sanskritName: "शार्ङ्ग",
    aliases: ["Sarnga", "Sharnga", "Vishnu's bow"],
    summary: "Viṣṇu–Kṛṣṇa's divine bow in epic and Purāṇic tradition.",
    description:
      "Śārṅga is the bow of Viṣṇu, carried into Mahābhārata narrative as part of Kṛṣṇa's divine arsenal alongside the discus and mace. It marks Kṛṣṇa as more than a mortal ally of the Pāṇḍavas.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Udyoga Parva"), MB("Bhīṣma Parva")],
    tags: ["bow", "krishna", "vishnu", "mahabharata"],
    categories: ["weapon", "bow"],
    importance: 4,
    seo: {
      title: "Śārṅga",
      description: "Kṛṣṇa's divine bow in the Mahābhārata.",
    },
    weapon: {
      category: "bow",
      focus: "mahabharata",
      powers: ["Divine bow of Viṣṇu"],
      notableUses: ["Named among Kṛṣṇa's emblems in war narratives"],
      counters: [],
    },
  }),

  // ── Astras ────────────────────────────────────────────
  base({
    id: "weapon.brahmastra",
    slug: "brahmastra",
    kind: "weapon",
    name: "Brahmāstra",
    englishName: "Brahmastra",
    iastName: "Brahmāstra",
    sanskritName: "ब्रह्मास्त्र",
    aliases: ["Brahma astra", "Astra of Brahma"],
    summary: "Brahmā's supreme astra, invoked at the war's deadly close.",
    description:
      "The Brahmāstra is among the highest celestial missiles of the epic. In the Sauptika aftermath, Aśvatthāmā and Arjuna exchange Brahmāstra fire; the crisis is resolved only when the weapons are withdrawn under sage counsel.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Sauptika Parva"), MB("Droṇa Parva")],
    tags: ["astra", "brahma", "mahabharata"],
    categories: ["weapon", "astra"],
    importance: 5,
    seo: {
      title: "Brahmāstra",
      description: "Brahmā's astra in the Mahābhārata.",
    },
    weapon: {
      category: "astra",
      focus: "mahabharata",
      powers: [
        "Unstoppable when properly invoked",
        "Capable of wide devastation in epic description",
      ],
      notableUses: [
        "Final astra exchange after the Sauptika night",
        "Threatened use by several warriors in the war books",
      ],
      counters: [
        "Another Brahmāstra may neutralize it",
        "Withdrawal by the invoker under sage instruction",
      ],
      counterWeaponIds: ["weapon.brahmastra"],
    },
  }),
  base({
    id: "weapon.brahmashira",
    slug: "brahmashira",
    kind: "weapon",
    name: "Brahmashirastra",
    englishName: "Brahmashira",
    iastName: "Brahmaśiras",
    sanskritName: "ब्रह्मशिरस्",
    aliases: ["Brahmashirastra", "Brahma-shira"],
    summary: "A Brahmā-class astra of extreme force in the war's endgame.",
    description:
      "Brahmaśiras (Brahmashira) appears in the closing astra crisis of the war cycle. Epic tradition treats it as a Brahmā weapon of fearful power, closely related in narrative function to the Brahmāstra exchanges of Aśvatthāmā and Arjuna.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Sauptika Parva")],
    tags: ["astra", "brahma", "mahabharata"],
    categories: ["weapon", "astra"],
    importance: 4,
    seo: {
      title: "Brahmaśiras",
      description: "Brahmā-class astra of the war's endgame.",
    },
    weapon: {
      category: "astra",
      focus: "mahabharata",
      powers: ["Extreme destructive force in Sauptika narratives"],
      notableUses: ["Aśvatthāmā's final missile crisis"],
      counters: ["Counter-astra and withdrawal under counsel"],
      counterWeaponIds: ["weapon.brahmastra"],
    },
  }),
  base({
    id: "weapon.narayanastra",
    slug: "narayanastra",
    kind: "weapon",
    name: "Nārāyaṇāstra",
    englishName: "Narayanastra",
    iastName: "Nārāyaṇāstra",
    sanskritName: "नारायणास्त्र",
    aliases: ["Narayana astra", "Astra of Narayana"],
    summary: "Nārāyaṇa's astra, unleashed by Aśvatthāmā after Droṇa's fall.",
    description:
      "After Droṇa's death, Aśvatthāmā releases the Nārāyaṇāstra against the Pāṇḍava host. Tradition holds that resistance feeds the weapon; surrender and stillness turn its fire aside.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Droṇa Parva")],
    tags: ["astra", "narayana", "ashwatthama", "mahabharata"],
    categories: ["weapon", "astra"],
    importance: 5,
    seo: {
      title: "Nārāyaṇāstra",
      description: "Nārāyaṇa's astra in Droṇa Parva.",
    },
    weapon: {
      category: "astra",
      focus: "mahabharata",
      powers: ["Multiplies against armed resistance"],
      notableUses: ["Released after Droṇa's death"],
      counters: [
        "Laying down weapons and remaining still",
        "Kṛṣṇa's counsel to the Pāṇḍava army",
      ],
    },
  }),
  base({
    id: "weapon.pashupatastra",
    slug: "pashupatastra",
    kind: "weapon",
    name: "Pāśupatāstra",
    englishName: "Pashupatastra",
    iastName: "Pāśupatāstra",
    sanskritName: "पाशुपतास्त्र",
    aliases: ["Pasupatastra", "Pashupata astra"],
    summary: "Śiva's supreme astra, granted to Arjuna in exile.",
    description:
      "During the forest exile Arjuna wins the Pāśupatāstra from Śiva after a hard trial. The gift marks the height of his divine arsenal; the epic stresses its danger and the need for restraint.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Vana Parva")],
    tags: ["astra", "arjuna", "shiva", "mahabharata"],
    categories: ["weapon", "astra"],
    importance: 5,
    seo: {
      title: "Pāśupatāstra",
      description: "Śiva's astra granted to Arjuna.",
    },
    weapon: {
      category: "astra",
      focus: "mahabharata",
      powers: ["Said to be capable of destroying creation if misused"],
      notableUses: ["Received during Arjuna's exile austerities"],
      counters: ["Restraint — not to be used lightly"],
    },
  }),
  base({
    id: "weapon.agneyastra",
    slug: "agneyastra",
    kind: "weapon",
    name: "Āgneyāstra",
    englishName: "Agneyastra",
    iastName: "Āgneyāstra",
    sanskritName: "आग्नेयास्त्र",
    aliases: ["Agneya astra", "Fire astra"],
    summary: "The fire-astra of Agni, used by several warriors in the war.",
    description:
      "Āgneyāstra is the celestial missile of fire. Mahābhārata battle books record its use by trained warriors; it is typically met by water or opposing astras in the logic of the war narratives.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Droṇa Parva"), MB("Bhīṣma Parva")],
    tags: ["astra", "agni", "mahabharata"],
    categories: ["weapon", "astra"],
    importance: 3,
    seo: {
      title: "Āgneyāstra",
      description: "Fire-astra in the Mahābhārata war.",
    },
    weapon: {
      category: "astra",
      focus: "mahabharata",
      powers: ["Produces consuming fire"],
      notableUses: ["Employed in several Kurukṣetra duels"],
      counters: ["Varuṇāstra and other opposing elemental astras"],
      counterWeaponIds: ["weapon.varunastra"],
    },
  }),
  base({
    id: "weapon.varunastra",
    slug: "varunastra",
    kind: "weapon",
    name: "Vāruṇāstra",
    englishName: "Varunastra",
    iastName: "Vāruṇāstra",
    sanskritName: "वारुणास्त्र",
    aliases: ["Varuna astra", "Water astra"],
    summary: "Varuṇa's water-astra, the classic counter to fire weapons.",
    description:
      "Vāruṇāstra is the missile of waters. In war narratives it often answers the Āgneyāstra, quenching fire with floods — an elemental pairing familiar across the battle books.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Droṇa Parva")],
    tags: ["astra", "varuna", "mahabharata"],
    categories: ["weapon", "astra"],
    importance: 3,
    seo: {
      title: "Vāruṇāstra",
      description: "Water-astra of Varuṇa in the Mahābhārata.",
    },
    weapon: {
      category: "astra",
      focus: "mahabharata",
      powers: ["Releases waters and floods"],
      notableUses: ["Counters fire-astras in duel sequences"],
      counters: [],
      counterWeaponIds: ["weapon.agneyastra"],
    },
  }),
  base({
    id: "weapon.sammohana",
    slug: "sammohana",
    kind: "weapon",
    name: "Sammohanāstra",
    englishName: "Sammohana",
    iastName: "Sammohanāstra",
    sanskritName: "सम्मोहनास्त्र",
    aliases: ["Sammohana astra", "Stupefying astra"],
    summary: "The stupefying astra Arjuna uses in the Virāṭa episode.",
    description:
      "In the Virāṭa Parva, Arjuna employs the Sammohanāstra to bewilder the Kaurava host and recover the seized cattle — a non-lethal demonstration of mastery before the great war.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Virāṭa Parva")],
    tags: ["astra", "arjuna", "mahabharata"],
    categories: ["weapon", "astra"],
    importance: 4,
    seo: {
      title: "Sammohanāstra",
      description: "Stupefying astra of the Virāṭa episode.",
    },
    weapon: {
      category: "astra",
      focus: "mahabharata",
      powers: ["Stupefies opposing armies"],
      notableUses: ["Cattle recovery in Virāṭa Parva"],
      counters: [],
    },
  }),

  // ── Sacred / discus ───────────────────────────────────
  base({
    id: "weapon.sudarshana",
    slug: "sudarshana",
    kind: "weapon",
    name: "Sudarśana",
    englishName: "Sudarshana Chakra",
    iastName: "Sudarśana",
    sanskritName: "सुदर्शन",
    aliases: ["Sudarshana Chakra", "Sudarshan", "Chakra of Vishnu"],
    summary: "Viṣṇu–Kṛṣṇa's discus, the supreme sacred weapon of the Lord.",
    description:
      "The Sudarśana cakra is Kṛṣṇa's discus. In the Mahābhārata it signals divine authority on the field of Kurukṣetra and in related narratives of protection and judgment.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Bhīṣma Parva"), BG("11")],
    tags: ["chakra", "krishna", "sacred", "mahabharata"],
    categories: ["weapon", "sacred-object"],
    importance: 5,
    seo: {
      title: "Sudarśana",
      description: "Kṛṣṇa's discus in the Mahābhārata.",
    },
    weapon: {
      category: "sacred-object",
      focus: "mahabharata",
      powers: ["Unerring discus of Viṣṇu", "Returns to the wielder in tradition"],
      notableUses: [
        "Present among Kṛṣṇa's emblems in the war",
        "Linked to divine theophany contexts in the Gītā tradition",
      ],
      counters: [],
    },
  }),

  // ── Spears ────────────────────────────────────────────
  base({
    id: "weapon.vasavi-shakti",
    slug: "vasavi-shakti",
    kind: "weapon",
    name: "Vāsavi Śakti",
    englishName: "Vasavi Shakti",
    iastName: "Vāsavi Śakti",
    sanskritName: "वासवी शक्ति",
    aliases: ["Karna's Shakti", "Indra's spear", "Shakti of Karna"],
    summary: "Indra's single-use spear, given to Karṇa and spent on Ghaṭotkaca.",
    description:
      "Indra grants Karṇa the Vāsavi Śakti in exchange for Karṇa's armour and earrings. The spear may be used once. Karṇa spends it on Ghaṭotkaca, saving it from Arjuna — a turning point of the war.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Vana Parva"), MB("Droṇa Parva")],
    tags: ["spear", "karna", "indra", "mahabharata"],
    categories: ["weapon", "spear"],
    importance: 5,
    seo: {
      title: "Vāsavi Śakti",
      description: "Indra's spear granted to Karṇa.",
    },
    weapon: {
      category: "spear",
      focus: "mahabharata",
      powers: ["Unfailing against a chosen target", "Single use"],
      notableUses: ["Slays Ghaṭotkaca on the fourteenth night"],
      counters: ["May be used only once"],
    },
  }),

  // ── Maces ─────────────────────────────────────────────
  base({
    id: "weapon.kaumodaki",
    slug: "kaumodaki",
    kind: "weapon",
    name: "Kaumodakī",
    englishName: "Kaumodaki",
    iastName: "Kaumodakī",
    sanskritName: "कौमोदकी",
    aliases: ["Kaumodaki mace", "Krishna's mace"],
    summary: "Kṛṣṇa's divine mace, paired with discus and bow.",
    description:
      "Kaumodakī is the mace of Viṣṇu–Kṛṣṇa. Together with Śārṅga and Sudarśana it completes the classic set of the Lord's weapons in epic description.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Bhīṣma Parva")],
    tags: ["mace", "krishna", "mahabharata"],
    categories: ["weapon", "mace"],
    importance: 4,
    seo: {
      title: "Kaumodakī",
      description: "Kṛṣṇa's divine mace.",
    },
    weapon: {
      category: "mace",
      focus: "mahabharata",
      powers: ["Divine mace of Viṣṇu"],
      notableUses: ["Named among Kṛṣṇa's emblems"],
      counters: [],
    },
  }),
  base({
    id: "weapon.bhima-gada",
    slug: "bhima-gada",
    kind: "weapon",
    name: "Bhīma's Gada",
    englishName: "Bhima's mace",
    iastName: "Bhīma-gadā",
    sanskritName: "भीमगदा",
    aliases: ["Bhima mace", "Gada of Bhima"],
    summary: "Bhīma's mace — the weapon of his decisive duel with Duryodhana.",
    description:
      "Bhīma is the epic's great mace-fighter. His gada decides the war's close when he fells Duryodhana in the club duel on the banks of the lake, fulfilling a vow sworn long before.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Śalya Parva")],
    tags: ["mace", "bhima", "mahabharata"],
    categories: ["weapon", "mace"],
    importance: 4,
    seo: {
      title: "Bhīma's Gada",
      description: "Bhīma's mace in the final duel.",
    },
    weapon: {
      category: "mace",
      focus: "mahabharata",
      powers: ["Crushing force in close combat"],
      notableUses: ["Duel with Duryodhana at war's end"],
      counters: [],
    },
  }),

  // ── Swords ────────────────────────────────────────────
  base({
    id: "weapon.nandaka",
    slug: "nandaka",
    kind: "weapon",
    name: "Nandaka",
    englishName: "Nandaka",
    iastName: "Nandaka",
    sanskritName: "नन्दक",
    aliases: ["Nandaka sword", "Sword of Vishnu"],
    summary: "Viṣṇu–Kṛṣṇa's sword in epic and iconographic tradition.",
    description:
      "Nandaka is the sword of Viṣṇu. In Mahābhārata-facing lists of Kṛṣṇa's weapons it stands with the discus, bow, and mace as a mark of divine kingship.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Bhīṣma Parva")],
    tags: ["sword", "krishna", "mahabharata"],
    categories: ["weapon", "sword"],
    importance: 3,
    seo: {
      title: "Nandaka",
      description: "Kṛṣṇa's sword in epic tradition.",
    },
    weapon: {
      category: "sword",
      focus: "mahabharata",
      powers: ["Divine sword of Viṣṇu"],
      notableUses: ["Listed among Kṛṣṇa's weapons"],
      counters: [],
    },
  }),

  // ── Conches ───────────────────────────────────────────
  base({
    id: "weapon.panchajanya",
    slug: "panchajanya",
    kind: "weapon",
    name: "Pāñcajanya",
    englishName: "Panchajanya",
    iastName: "Pāñcajanya",
    sanskritName: "पाञ्चजन्य",
    aliases: ["Panchajanya conch", "Krishna's conch"],
    summary: "Kṛṣṇa's conch, sounded on the field of dharma.",
    description:
      "Pāñcajanya is Kṛṣṇa's conch. The Bhagavad Gītā opens the war with the sounding of conches; Pāñcajanya answers from Kṛṣṇa's chariot beside Arjuna.",
    primaryScripture: "Bhagavad Gītā",
    scriptureSources: [BG("1"), MB("Bhīṣma Parva")],
    tags: ["conch", "krishna", "gita", "mahabharata"],
    categories: ["weapon", "conch"],
    importance: 5,
    seo: {
      title: "Pāñcajanya",
      description: "Kṛṣṇa's conch in the Bhagavad Gītā.",
    },
    weapon: {
      category: "conch",
      focus: "mahabharata",
      powers: ["Battle signal of the Lord"],
      notableUses: ["Sounded at the opening of Kurukṣetra (Gītā 1)"],
      counters: [],
    },
  }),
  base({
    id: "weapon.devadatta",
    slug: "devadatta",
    kind: "weapon",
    name: "Devadatta",
    englishName: "Devadatta",
    iastName: "Devadatta",
    sanskritName: "देवदत्त",
    aliases: ["Devadatta conch", "Arjuna's conch"],
    summary: "Arjuna's conch, sounded with Gāṇḍīva on the field.",
    description:
      "Devadatta is Arjuna's conch. Together with Gāṇḍīva it identifies him at the start of the war in the Gītā's opening chapter.",
    primaryScripture: "Bhagavad Gītā",
    scriptureSources: [BG("1")],
    tags: ["conch", "arjuna", "gita", "mahabharata"],
    categories: ["weapon", "conch"],
    importance: 4,
    seo: {
      title: "Devadatta",
      description: "Arjuna's conch in the Bhagavad Gītā.",
    },
    weapon: {
      category: "conch",
      focus: "mahabharata",
      powers: ["Battle signal of Arjuna"],
      notableUses: ["Sounded at Kurukṣetra's opening"],
      counters: [],
    },
  }),

  // ── Chariots ──────────────────────────────────────────
  base({
    id: "weapon.krishna-chariot",
    slug: "krishna-chariot",
    kind: "weapon",
    name: "Kṛṣṇa's Chariot",
    englishName: "Krishna's chariot",
    iastName: "Kṛṣṇa-ratha",
    sanskritName: "कृष्णरथ",
    aliases: ["Arjuna's chariot", "Kurukshetra chariot"],
    summary: "The chariot Kṛṣṇa drives for Arjuna on Kurukṣetra.",
    description:
      "The chariot of Arjuna, driven by Kṛṣṇa, is the stage of the Bhagavad Gītā. Banner, horses, and divine charioteer make it more than a vehicle — it is the seat of teaching and war.",
    primaryScripture: "Bhagavad Gītā",
    scriptureSources: [BG("1"), MB("Bhīṣma Parva")],
    tags: ["chariot", "krishna", "arjuna", "gita", "mahabharata"],
    categories: ["weapon", "chariot"],
    importance: 5,
    seo: {
      title: "Kṛṣṇa's Chariot",
      description: "The Gītā chariot on Kurukṣetra.",
    },
    weapon: {
      category: "chariot",
      focus: "mahabharata",
      powers: ["Divine charioteering", "Seat of the Gītā discourse"],
      notableUses: [
        "Bhagavad Gītā between the armies",
        "Arjuna's war under Kṛṣṇa's reins",
      ],
      counters: [],
    },
  }),

  // ── Broader Hindu (clearly marked) ────────────────────
  base({
    id: "weapon.vajra",
    slug: "vajra",
    kind: "weapon",
    name: "Vajra",
    englishName: "Vajra",
    iastName: "Vajra",
    sanskritName: "वज्र",
    aliases: ["Thunderbolt", "Indra's vajra", "Vajrayudha"],
    summary: "Indra's thunderbolt — Vedic weapon recalled in the epic world.",
    description:
      "The Vajra is Indra's thunderbolt. Its home is Vedic hymn; the Mahābhārata recalls it when Indra enters the story (as with the gift of the Śakti to Karṇa). Listed here as broader Hindu tradition with epic cross-links.",
    primaryScripture: "Ṛg Veda",
    scriptureSources: [RV("Indra hymns"), MB("Vana Parva")],
    tags: ["thunderbolt", "indra", "veda", "broader-hindu"],
    categories: ["weapon", "sacred-object"],
    importance: 4,
    era: "unspecified",
    seo: {
      title: "Vajra",
      description: "Indra's thunderbolt in Vedic and epic tradition.",
    },
    weapon: {
      category: "sacred-object",
      focus: "broader-hindu",
      powers: ["Thunderbolt of the king of the gods"],
      notableUses: ["Vedic battles of Indra", "Background to Indra's gift to Karṇa"],
      counters: [],
    },
  }),
  base({
    id: "weapon.trishula",
    slug: "trishula",
    kind: "weapon",
    name: "Triśūla",
    englishName: "Trishula",
    iastName: "Triśūla",
    sanskritName: "त्रिशूल",
    aliases: ["Trident", "Shiva's trident", "Trishul"],
    summary: "Śiva's trident — Purāṇic emblem with epic echoes.",
    description:
      "The Triśūla is Śiva's trident. It belongs chiefly to Purāṇic and iconographic tradition; the Mahābhārata meets Śiva most vividly in Arjuna's Pāśupata episode. Listed as broader Hindu tradition.",
    primaryScripture: "Śiva Purāṇa",
    scriptureSources: [SP(), MB("Vana Parva")],
    tags: ["trident", "shiva", "purana", "broader-hindu"],
    categories: ["weapon", "sacred-object"],
    importance: 4,
    era: "unspecified",
    seo: {
      title: "Triśūla",
      description: "Śiva's trident in Purāṇic tradition.",
    },
    weapon: {
      category: "sacred-object",
      focus: "broader-hindu",
      powers: ["Emblem of Śiva's power"],
      notableUses: ["Purāṇic battles of Śiva", "Icon of the Pāśupata lord"],
      counters: [],
    },
  }),
  base({
    id: "weapon.pinaka",
    slug: "pinaka",
    kind: "weapon",
    name: "Pināka",
    englishName: "Pinaka",
    iastName: "Pināka",
    sanskritName: "पिनाक",
    aliases: ["Pinaka bow", "Shiva's bow"],
    summary: "Śiva's bow — Purāṇic and epic background to the Pāśupata gift.",
    description:
      "Pināka is Śiva's bow. Like the Triśūla it is primarily a broader Hindu emblem; it frames Śiva's identity when Arjuna seeks the Pāśupatāstra in the Vana Parva.",
    primaryScripture: "Mahābhārata",
    scriptureSources: [MB("Vana Parva"), SP()],
    tags: ["bow", "shiva", "broader-hindu"],
    categories: ["weapon", "bow"],
    importance: 3,
    era: "unspecified",
    seo: {
      title: "Pināka",
      description: "Śiva's bow in epic and Purāṇic tradition.",
    },
    weapon: {
      category: "bow",
      focus: "broader-hindu",
      powers: ["Bow of Śiva"],
      notableUses: ["Associated with Śiva in the Pāśupata episode"],
      counters: [],
    },
  }),
];

export const WEAPON_RELATIONS: Rel[] = [
  // Origins
  edge("person.varuna", "connected-to", "weapon.gandiva", [MB("Ādi Parva")], "traditional", "origin — celestial bow tied to Agni–Varuṇa gift narratives"),
  edge("person.vishnu", "connected-to", "weapon.sudarshana", [MB("Bhīṣma Parva")], "traditional", "origin — discus of Viṣṇu–Nārāyaṇa"),
  edge("person.vishnu", "connected-to", "weapon.sharanga", [MB("Bhīṣma Parva")], "traditional", "origin — bow of Viṣṇu"),
  edge("person.vishnu", "connected-to", "weapon.kaumodaki", [MB("Bhīṣma Parva")], "traditional", "origin — mace of Viṣṇu"),
  edge("person.vishnu", "connected-to", "weapon.nandaka", [MB("Bhīṣma Parva")], "traditional", "origin — sword of Viṣṇu"),
  edge("person.vishnu", "connected-to", "weapon.panchajanya", [BG("1")], "traditional", "origin — conch of Viṣṇu–Kṛṣṇa"),
  edge("person.shiva", "connected-to", "weapon.pashupatastra", [MB("Vana Parva")], "traditional", "origin — supreme astra of Śiva, granted to Arjuna"),
  edge("person.shiva", "connected-to", "weapon.trishula", [SP(), MB("Vana Parva")], "traditional", "origin — trident of Śiva"),
  edge("person.shiva", "connected-to", "weapon.pinaka", [MB("Vana Parva")], "traditional", "origin — bow of Śiva"),
  edge("person.brahma", "connected-to", "weapon.brahmastra", [MB("Sauptika Parva")], "traditional", "origin — astra of Brahmā"),
  edge("person.brahma", "connected-to", "weapon.brahmashira", [MB("Sauptika Parva")], "traditional", "origin — Brahmā-class astra"),
  edge("person.vishnu", "connected-to", "weapon.narayanastra", [MB("Droṇa Parva")], "traditional", "origin — astra of Nārāyaṇa"),
  edge("person.indra", "connected-to", "weapon.vajra", [RV("Indra hymns")], "traditional", "origin — thunderbolt of Indra"),
  edge("person.indra", "connected-to", "weapon.vasavi-shakti", [MB("Vana Parva")], "verified", "origin — Indra's spear granted to Karṇa"),
  edge("person.varuna", "connected-to", "weapon.varunastra", [MB("Droṇa Parva")], "traditional", "origin — water-astra of Varuṇa"),

  // Wielders
  edge("person.arjuna", "wielded", "weapon.gandiva", [MB("Ādi Parva")], "verified"),
  edge("person.arjuna", "wielded", "weapon.pashupatastra", [MB("Vana Parva")], "verified", "received during exile"),
  edge("person.arjuna", "wielded", "weapon.sammohana", [MB("Virāṭa Parva")], "verified"),
  edge("person.arjuna", "wielded", "weapon.devadatta", [BG("1")], "verified"),
  edge("person.arjuna", "wielded", "weapon.brahmastra", [MB("Sauptika Parva")], "traditional", "counter-astra exchanges"),
  edge("person.arjuna", "wielded", "weapon.krishna-chariot", [BG("1")], "verified", "ridden with Kṛṣṇa as charioteer"),

  edge("person.karna", "wielded", "weapon.vijaya-bow", [MB("Karṇa Parva")], "traditional"),
  edge("person.karna", "wielded", "weapon.vasavi-shakti", [MB("Droṇa Parva")], "verified"),

  edge("person.krishna", "wielded", "weapon.sudarshana", [MB("Bhīṣma Parva")], "traditional"),
  edge("person.krishna", "wielded", "weapon.sharanga", [MB("Bhīṣma Parva")], "traditional"),
  edge("person.krishna", "wielded", "weapon.kaumodaki", [MB("Bhīṣma Parva")], "traditional"),
  edge("person.krishna", "wielded", "weapon.nandaka", [MB("Bhīṣma Parva")], "traditional"),
  edge("person.krishna", "wielded", "weapon.panchajanya", [BG("1")], "verified"),
  edge("person.krishna", "wielded", "weapon.krishna-chariot", [BG("1")], "verified", "charioteer"),

  edge("person.ashwatthama", "wielded", "weapon.narayanastra", [MB("Droṇa Parva")], "traditional"),
  edge("person.ashwatthama", "wielded", "weapon.brahmastra", [MB("Sauptika Parva")], "traditional"),
  edge("person.ashwatthama", "wielded", "weapon.brahmashira", [MB("Sauptika Parva")], "traditional"),

  edge("person.bhima", "wielded", "weapon.bhima-gada", [MB("Śalya Parva")], "verified"),
  edge("person.shiva", "wielded", "weapon.pashupatastra", [MB("Vana Parva")], "traditional", "divine owner"),
  edge("person.shiva", "wielded", "weapon.trishula", [SP()], "traditional"),
  edge("person.shiva", "wielded", "weapon.pinaka", [MB("Vana Parva")], "traditional"),
  edge("person.indra", "wielded", "weapon.vajra", [RV("Indra hymns")], "traditional"),
];

export const WEAPONS_COLLECTION = {
  id: "weapons.epic",
  slug: "epic-weapons",
  title: "Epic Weapons",
  kind: "weapons-layer" as const,
  sanskritTitle: "दिव्यास्त्राणि",
  eyebrow: "Arsenal",
  summary:
    "Bows, astras, maces, conches, and sacred arms of the Mahābhārata — with a few clearly marked weapons from the wider Hindu tradition.",
  description:
    "A cited catalog of arms from the shared Knowledge Graph. Mahābhārata weapons are listed first; broader Hindu arms (such as the Vajra and Triśūla) are marked separately.",
  status: "available" as const,
  entityIds: WEAPON_ENTITIES.map((e) => e.id),
  scriptureSources: [MB("Ādi Parva"), MB("Droṇa Parva"), BG("1")],
  color: { accent: "#5c4030", tint: "#e8d8cc" },
  order: 5,
};
