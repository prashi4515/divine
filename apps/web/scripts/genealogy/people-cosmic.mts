/**
 * Curated, citation-first person corpus.
 * Accuracy over quantity — every relationship carries confidence + sources.
 */
import { BP, VP, MB, RM, HV, SP, BG, rel, type Rel, type Cite } from "./cites.mts";

export type PersonDraft = {
  id: string;
  name: string;
  englishName: string;
  iastName?: string;
  sanskritName?: string;
  aliases?: string[];
  gender: "male" | "female" | "divine" | "unknown";
  category: string;
  dynasty?: string;
  era?: string;
  epithet?: string;
  description: string;
  primaryScripture: string;
  importance?: number;
  relationships?: Rel[];
  variantTraditions?: Array<{
    label: string;
    description: string;
    sources: Cite[];
  }>;
  scriptureSources?: Cite[];
  relatedVerses?: Array<{ workCode: string; publicId: string; label?: string }>;
  notes?: string;
  imagePlaceholder?: string;
};

function p(draft: PersonDraft): PersonDraft {
  return {
    ...draft,
    iastName: draft.iastName ?? draft.name,
    aliases: draft.aliases ?? [],
    importance: draft.importance ?? 3,
    relationships: draft.relationships ?? [],
    scriptureSources: draft.scriptureSources ?? [],
  };
}

/** Cosmic / Trimūrti / Devīs / Prajāpatis / Saptarṣis / Manu roots */
export const COSMIC: PersonDraft[] = [
  p({
    id: "vishnu",
    name: "Viṣṇu",
    englishName: "Vishnu",
    sanskritName: "विष्णु",
    aliases: ["Narayana", "Nārāyaṇa", "Hari", "Vasudeva", "Vāsudeva"],
    gender: "divine",
    category: "trimurti",
    era: "eternal",
    epithet: "The preserver; source of the daśāvatāra",
    description:
      "Viṣṇu sustains the cosmos and descends as avatāra whenever dharma declines. In the Bhāgavata creation narrative, Brahmā appears on the lotus rising from Viṣṇu's navel.",
    primaryScripture: "Bhāgavata Purāṇa",
    importance: 5,
    imagePlaceholder: "🌀",
    relationships: [
      rel("consort", "lakshmi", "verified", [VP("1", "9"), BP("8", "8")]),
      rel("son", "brahma", "traditional", [BP("3", "8")], "Brahmā emerges from the lotus of Viṣṇu's navel — a manifestation rather than ordinary birth."),
    ],
    scriptureSources: [BP("3", "8–12"), VP("1"), BG("10")],
    relatedVerses: [
      { workCode: "bg", publicId: "bg.4.7", label: "Whenever dharma declines, I descend" },
      { workCode: "bg", publicId: "bg.10.20", label: "I am the Self seated in every being" },
    ],
  }),
  p({
    id: "brahma",
    name: "Brahmā",
    englishName: "Brahma",
    sanskritName: "ब्रह्मा",
    aliases: ["Pitamaha", "Pitāmaha", "Svayambhu", "Svayambhū", "Hiranyagarbha", "Hiraṇyagarbha"],
    gender: "divine",
    category: "trimurti",
    era: "creation",
    epithet: "Four-faced creator; grandfather of beings",
    description:
      "Brahmā projects the manifest cosmos and fathers the mind-born progenitors (Prajāpatis), including the Saptarṣis of the current tradition.",
    primaryScripture: "Bhāgavata Purāṇa",
    importance: 5,
    imagePlaceholder: "🪷",
    relationships: [
      rel("consort", "saraswati", "traditional", [{ work: "Matsya Purāṇa", chapter: "3" }, { work: "Brahma Purāṇa" }]),
      rel("son", "marichi", "verified", [BP("3", "12"), VP("1", "7")], "Mānasaputra — mind-born."),
      rel("son", "atri", "verified", [BP("3", "12")], "Mānasaputra."),
      rel("son", "angiras", "verified", [BP("3", "12")], "Mānasaputra."),
      rel("son", "pulastya", "verified", [BP("3", "12")], "Mānasaputra."),
      rel("son", "pulaha", "verified", [BP("3", "12")], "Mānasaputra."),
      rel("son", "kratu", "verified", [BP("3", "12")], "Mānasaputra."),
      rel("son", "vasishtha", "verified", [BP("3", "12")], "Mānasaputra."),
      rel("son", "daksha", "verified", [BP("4", "1"), VP("1", "7")]),
      rel("son", "narada", "verified", [BP("1", "6"), BP("3", "12")]),
    ],
    variantTraditions: [
      {
        label: "Number of Prajāpatis",
        description:
          "Bhāgavata Purāṇa 3.12 lists nine mind-born sons plus Nārada; Manu Smṛti 1.34–35 lists ten; some Mahābhārata redactions list seven. Divine follows the Bhāgavata list and records variants.",
        sources: [BP("3", "12"), { work: "Manu Smṛti", chapter: "1.34–35" }, MB("Ādi Parva", "66")],
      },
    ],
    scriptureSources: [BP("3", "8–12"), VP("1", "5–7")],
    relatedVerses: [
      { workCode: "bg", publicId: "bg.8.16", label: "The realm of Brahmā" },
      { workCode: "bg", publicId: "bg.8.17", label: "A day and night of Brahmā" },
    ],
  }),
  p({
    id: "shiva",
    name: "Śiva",
    englishName: "Shiva",
    sanskritName: "शिव",
    aliases: ["Mahadeva", "Mahādeva", "Rudra", "Shankara", "Śaṅkara", "Nilakantha", "Nīlakaṇṭha"],
    gender: "divine",
    category: "trimurti",
    era: "eternal",
    epithet: "The auspicious; lord of yoga and dissolution",
    description:
      "Śiva is the yogi-lord of Kailāsa, consort of Pārvatī, and father of Gaṇeśa and Skanda (Kārttikeya) in the Purāṇic narratives.",
    primaryScripture: "Śiva Purāṇa",
    importance: 5,
    imagePlaceholder: "🕉️",
    relationships: [
      rel("consort", "parvati", "verified", [SP("Rudra Saṃhitā, Pārvatī Khaṇḍa"), { work: "Skanda Purāṇa" }]),
      rel("son", "ganesha", "verified", [SP("Rudra Saṃhitā, Kumāra Khaṇḍa")]),
      rel("son", "kartikeya", "verified", [MB("Vana Parva", "223–232"), { work: "Skanda Purāṇa" }]),
    ],
    variantTraditions: [
      {
        label: "Birth of Gaṇeśa",
        description:
          "Śiva Purāṇa relates Gaṇeśa formed from Pārvatī's substance and later given an elephant head; Skanda Purāṇa preserves alternate tellings. Both are recorded as variants.",
        sources: [SP("Rudra Saṃhitā, Kumāra Khaṇḍa"), { work: "Skanda Purāṇa" }],
      },
    ],
    scriptureSources: [SP(), { work: "Skanda Purāṇa" }],
  }),
  p({
    id: "lakshmi",
    name: "Lakṣmī",
    englishName: "Lakshmi",
    sanskritName: "लक्ष्मी",
    aliases: ["Sri", "Śrī", "Padma", "Kamala"],
    gender: "divine",
    category: "devi",
    era: "eternal",
    epithet: "Goddess of fortune; consort of Viṣṇu",
    description: "Lakṣmī is the consort of Viṣṇu and the embodiment of śrī — prosperity, sovereignty and grace.",
    primaryScripture: "Viṣṇu Purāṇa",
    importance: 5,
    imagePlaceholder: "🪷",
    relationships: [
      rel("consort", "vishnu", "verified", [VP("1", "9"), BP("8", "8")]),
    ],
    scriptureSources: [VP("1", "9"), BP("8", "8")],
  }),
  p({
    id: "saraswati",
    name: "Sarasvatī",
    englishName: "Saraswati",
    sanskritName: "सरस्वती",
    aliases: ["Vagdevi", "Vāgdevī", "Sharada", "Śāradā", "Bharati", "Bhāratī"],
    gender: "divine",
    category: "devi",
    era: "eternal",
    epithet: "Goddess of speech, learning and the arts",
    description: "Sarasvatī presides over speech (vāc), learning, music and the arts; she is traditionally the consort of Brahmā.",
    primaryScripture: "Matsya Purāṇa",
    importance: 5,
    imagePlaceholder: "📜",
    relationships: [
      rel("consort", "brahma", "traditional", [{ work: "Matsya Purāṇa", chapter: "3" }]),
    ],
    scriptureSources: [{ work: "Matsya Purāṇa", chapter: "3" }],
  }),
  p({
    id: "parvati",
    name: "Pārvatī",
    englishName: "Parvati",
    sanskritName: "पार्वती",
    aliases: ["Uma", "Umā", "Gauri", "Gaurī", "Durga", "Durgā", "Shakti", "Śakti"],
    gender: "divine",
    category: "devi",
    era: "eternal",
    epithet: "Daughter of the Mountain; consort of Śiva",
    description: "Pārvatī is the daughter of Himavat and the consort of Śiva; as Śakti she is mother of Gaṇeśa and Skanda.",
    primaryScripture: "Śiva Purāṇa",
    importance: 5,
    imagePlaceholder: "⛰️",
    relationships: [
      rel("consort", "shiva", "verified", [SP("Rudra Saṃhitā, Pārvatī Khaṇḍa")]),
      rel("son", "ganesha", "verified", [SP("Rudra Saṃhitā, Kumāra Khaṇḍa")]),
      rel("son", "kartikeya", "verified", [{ work: "Skanda Purāṇa" }, MB("Vana Parva", "223–232")]),
    ],
    scriptureSources: [SP()],
  }),
  p({
    id: "ganesha",
    name: "Gaṇeśa",
    englishName: "Ganesha",
    sanskritName: "गणेश",
    aliases: ["Ganapati", "Gaṇapati", "Vinayaka", "Vināyaka", "Vighneshvara", "Vighneśvara"],
    gender: "divine",
    category: "deva",
    era: "eternal",
    epithet: "Lord of gaṇas; remover of obstacles",
    description: "Gaṇeśa is the elephant-headed son of Śiva and Pārvatī, worshipped at the start of undertakings.",
    primaryScripture: "Śiva Purāṇa",
    importance: 5,
    imagePlaceholder: "🐘",
    relationships: [
      rel("father", "shiva", "verified", [SP("Rudra Saṃhitā, Kumāra Khaṇḍa")]),
      rel("mother", "parvati", "verified", [SP("Rudra Saṃhitā, Kumāra Khaṇḍa")]),
      rel("brother", "kartikeya", "verified", [{ work: "Skanda Purāṇa" }]),
    ],
    scriptureSources: [SP("Rudra Saṃhitā, Kumāra Khaṇḍa")],
  }),
  p({
    id: "kartikeya",
    name: "Kārttikeya",
    englishName: "Kartikeya",
    sanskritName: "कार्त्तिकेय",
    aliases: ["Skanda", "Kumara", "Kumāra", "Subrahmanya", "Subrahmaṇya", "Murugan"],
    gender: "divine",
    category: "deva",
    era: "eternal",
    epithet: "Commander of the divine hosts",
    description: "Kārttikeya (Skanda) is the war-god son of Śiva, raised by the Kṛttikās in the epic and Purāṇic accounts.",
    primaryScripture: "Skanda Purāṇa",
    importance: 4,
    imagePlaceholder: "🗡️",
    relationships: [
      rel("father", "shiva", "verified", [MB("Vana Parva", "223–232"), { work: "Skanda Purāṇa" }]),
      rel("mother", "parvati", "traditional", [{ work: "Skanda Purāṇa" }], "Some accounts emphasize the Kṛttikās as foster-mothers."),
      rel("brother", "ganesha", "verified", [{ work: "Skanda Purāṇa" }]),
    ],
    scriptureSources: [MB("Vana Parva", "223–232"), { work: "Skanda Purāṇa" }],
  }),
];

export const PRAJAPATIS: PersonDraft[] = [
  p({
    id: "marichi",
    name: "Marīci",
    englishName: "Marichi",
    sanskritName: "मरीचि",
    gender: "male",
    category: "prajapati",
    era: "creation",
    dynasty: "prajapati",
    epithet: "Mind-born son of Brahmā; father of Kaśyapa",
    description: "Marīci is a mānasaputra of Brahmā and father of Kaśyapa, the great progenitor of many celestial lineages.",
    primaryScripture: "Bhāgavata Purāṇa",
    importance: 5,
    relationships: [
      rel("father", "brahma", "verified", [BP("3", "12")]),
      rel("son", "kashyapa", "verified", [BP("3", "12"), VP("1", "7")]),
    ],
    scriptureSources: [BP("3", "12"), VP("1", "7")],
  }),
  p({
    id: "atri",
    name: "Atri",
    englishName: "Atri",
    sanskritName: "अत्रि",
    gender: "male",
    category: "saptarishi",
    era: "creation",
    epithet: "Saptarṣi; husband of Anasūyā",
    description: "Atri is a mind-born son of Brahmā, one of the Saptarṣis, and husband of Anasūyā; through him is born Candra in Purāṇic genealogy.",
    primaryScripture: "Bhāgavata Purāṇa",
    importance: 5,
    relationships: [
      rel("father", "brahma", "verified", [BP("3", "12")]),
      rel("consort", "anasuya", "verified", [BP("4", "1")]),
      rel("son", "chandra", "verified", [BP("4", "1"), VP("4", "6")], "Candra (Soma) is born of Atri in the Purāṇic lunar-line origin."),
      rel("son", "dattatreya", "verified", [BP("4", "1")]),
    ],
    scriptureSources: [BP("3", "12"), BP("4", "1")],
  }),
  p({
    id: "angiras",
    name: "Aṅgiras",
    englishName: "Angiras",
    sanskritName: "अङ्गिरस्",
    gender: "male",
    category: "saptarishi",
    era: "creation",
    epithet: "Saptarṣi; ancestor of Bṛhaspati",
    description: "Aṅgiras is a mānasaputra of Brahmā and a Saptarṣi; Bṛhaspati is born in his line.",
    primaryScripture: "Bhāgavata Purāṇa",
    importance: 4,
    relationships: [
      rel("father", "brahma", "verified", [BP("3", "12")]),
      rel("son", "brihaspati", "verified", [BP("4", "1"), VP("1", "7")]),
    ],
    scriptureSources: [BP("3", "12")],
  }),
  p({
    id: "pulastya",
    name: "Pulastya",
    englishName: "Pulastya",
    sanskritName: "पुलस्त्य",
    gender: "male",
    category: "saptarishi",
    era: "creation",
    epithet: "Saptarṣi; grandfather of Rāvaṇa",
    description: "Pulastya is a mind-born son of Brahmā. Through his son Viśravas arise Kubera and the principal rākṣasas of Laṅkā.",
    primaryScripture: "Rāmāyaṇa",
    importance: 5,
    relationships: [
      rel("father", "brahma", "verified", [BP("3", "12")]),
      rel("son", "visravas", "verified", [RM("Uttara Kāṇḍa", "2–9"), BP("4", "1")]),
    ],
    scriptureSources: [BP("3", "12"), RM("Uttara Kāṇḍa", "2–9")],
  }),
  p({
    id: "pulaha",
    name: "Pulaha",
    englishName: "Pulaha",
    sanskritName: "पुलह",
    gender: "male",
    category: "saptarishi",
    era: "creation",
    epithet: "Saptarṣi; mind-born son of Brahmā",
    description: "Pulaha is counted among Brahmā's mind-born sons and the Saptarṣis of the Vaivasvata manvantara tradition.",
    primaryScripture: "Bhāgavata Purāṇa",
    importance: 3,
    relationships: [rel("father", "brahma", "verified", [BP("3", "12")])],
    scriptureSources: [BP("3", "12")],
  }),
  p({
    id: "kratu",
    name: "Kratu",
    englishName: "Kratu",
    sanskritName: "क्रतु",
    gender: "male",
    category: "saptarishi",
    era: "creation",
    epithet: "Saptarṣi; mind-born son of Brahmā",
    description: "Kratu is a mānasaputra of Brahmā and one of the seven seers associated with the current manvantara lists.",
    primaryScripture: "Bhāgavata Purāṇa",
    importance: 3,
    relationships: [rel("father", "brahma", "verified", [BP("3", "12")])],
    scriptureSources: [BP("3", "12")],
  }),
  p({
    id: "vasishtha",
    name: "Vasiṣṭha",
    englishName: "Vasishtha",
    sanskritName: "वसिष्ठ",
    aliases: ["Vasistha", "Vashistha"],
    gender: "male",
    category: "saptarishi",
    era: "creation",
    epithet: "Family priest of the Ikṣvākus; Saptarṣi",
    description: "Vasiṣṭha is a mind-born son of Brahmā, a Saptarṣi, and the kulaguru of the Solar (Ikṣvāku) kings including Daśaratha and Rāma.",
    primaryScripture: "Rāmāyaṇa",
    importance: 5,
    relationships: [
      rel("father", "brahma", "verified", [BP("3", "12")]),
      rel("disciple", "dasharatha", "traditional", [RM("Bāla Kāṇḍa")], "Kulaguru of the Ayodhyā line."),
      rel("disciple", "rama", "traditional", [RM("Bāla Kāṇḍa")]),
    ],
    scriptureSources: [BP("3", "12"), RM("Bāla Kāṇḍa")],
  }),
  p({
    id: "daksha",
    name: "Dakṣa",
    englishName: "Daksha",
    sanskritName: "दक्ष",
    gender: "male",
    category: "prajapati",
    era: "creation",
    epithet: "Prajāpati; father of many daughters given to Kaśyapa and others",
    description:
      "Dakṣa Prajāpati gives numerous daughters in marriage — notably to Kaśyapa — from whom arise Devas, Daityas, Dānavas, Nāgas and other classes.",
    primaryScripture: "Bhāgavata Purāṇa",
    importance: 5,
    relationships: [
      rel("father", "brahma", "verified", [BP("4", "1"), VP("1", "7")]),
      rel("daughter", "aditi", "verified", [BP("6", "6"), VP("1", "15")]),
      rel("daughter", "diti", "verified", [BP("3", "14"), VP("1", "15")]),
      rel("daughter", "danu", "verified", [BP("6", "6"), VP("1", "15")]),
      rel("daughter", "kadru", "verified", [BP("6", "6"), MB("Ādi Parva", "16")]),
    ],
    scriptureSources: [BP("4", "1"), BP("6", "6"), VP("1", "15")],
  }),
  p({
    id: "narada",
    name: "Nārada",
    englishName: "Narada",
    sanskritName: "नारद",
    gender: "male",
    category: "rishi",
    era: "eternal",
    epithet: "Divine sage; messenger among the worlds",
    description: "Nārada is a mind-born son of Brahmā, the wandering sage who transmits bhakti and often catalyzes Purāṇic narratives.",
    primaryScripture: "Bhāgavata Purāṇa",
    importance: 5,
    relationships: [rel("father", "brahma", "verified", [BP("1", "6"), BP("3", "12")])],
    scriptureSources: [BP("1", "5–6")],
  }),
  p({
    id: "anasuya",
    name: "Anasūyā",
    englishName: "Anasuya",
    sanskritName: "अनसूया",
    gender: "female",
    category: "rishi",
    era: "treta-yuga",
    epithet: "Wife of Atri; mother of Dattātreya",
    description: "Anasūyā is the wife of Atri, celebrated for chastity and austerity; Dattātreya is born to them.",
    primaryScripture: "Bhāgavata Purāṇa",
    importance: 3,
    relationships: [
      rel("spouse", "atri", "verified", [BP("4", "1")]),
      rel("son", "dattatreya", "verified", [BP("4", "1")]),
    ],
    scriptureSources: [BP("4", "1")],
  }),
  p({
    id: "dattatreya",
    name: "Dattātreya",
    englishName: "Dattatreya",
    sanskritName: "दत्तात्रेय",
    gender: "male",
    category: "rishi",
    era: "treta-yuga",
    epithet: "Son of Atri and Anasūyā; avatāra tradition",
    description: "Dattātreya is the son of Atri and Anasūyā; later traditions revere him as a combined avatāra of the Trimūrti.",
    primaryScripture: "Bhāgavata Purāṇa",
    importance: 4,
    relationships: [
      rel("father", "atri", "verified", [BP("4", "1")]),
      rel("mother", "anasuya", "verified", [BP("4", "1")]),
    ],
    scriptureSources: [BP("4", "1")],
  }),
  p({
    id: "brihaspati",
    name: "Bṛhaspati",
    englishName: "Brihaspati",
    sanskritName: "बृहस्पति",
    aliases: ["Brhaspati", "Guru"],
    gender: "male",
    category: "deva",
    era: "eternal",
    epithet: "Preceptor of the Devas",
    description: "Bṛhaspati is the guru of the Devas, born in the line of Aṅgiras.",
    primaryScripture: "Bhāgavata Purāṇa",
    importance: 4,
    relationships: [rel("father", "angiras", "verified", [BP("4", "1"), VP("1", "7")])],
    scriptureSources: [BP("4", "1")],
    relatedVerses: [{ workCode: "bg", publicId: "bg.10.24", label: "Among priests I am Bṛhaspati" }],
  }),
];
