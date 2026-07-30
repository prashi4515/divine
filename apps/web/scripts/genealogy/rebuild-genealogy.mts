/**
 * Rebuild content/genealogy/{people,modules}.json from curated TypeScript drafts.
 *
 * Usage: pnpm --filter @divine/web generate:genealogy
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { COSMIC, PRAJAPATIS, type PersonDraft } from "./people-cosmic.mts";
import {
  KASYAPA_LINE,
  DAITYAS,
  DANAVAS,
  DEVAS,
  NAGAS,
  RAKSHASAS,
  GANDHARVAS,
} from "./people-asura-deva.mts";
import {
  MANUS,
  SOLAR,
  RAMA_FAMILY,
  LUNAR,
  YADU_KRISHNA,
  KURU_LINE,
  PANDAVAS,
  KAURAVAS,
  MAJOR_RISHIS,
} from "./people-dynasties.mts";
import type { Cite } from "./cites.mts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../../content/genealogy");

function finalize(draft: PersonDraft) {
  return {
    id: draft.id,
    slug: draft.id,
    name: draft.name,
    englishName: draft.englishName,
    iastName: draft.iastName ?? draft.name,
    ...(draft.sanskritName ? { sanskritName: draft.sanskritName } : {}),
    aliases: draft.aliases ?? [],
    gender: draft.gender,
    category: draft.category,
    ...(draft.dynasty ? { dynasty: draft.dynasty } : {}),
    era: draft.era ?? "unspecified",
    ...(draft.epithet ? { epithet: draft.epithet } : {}),
    description: draft.description,
    primaryScripture: draft.primaryScripture,
    importance: draft.importance ?? 3,
    relationships: draft.relationships ?? [],
    variantTraditions: draft.variantTraditions ?? [],
    scriptureSources: draft.scriptureSources ?? [],
    relatedStories: [],
    relatedVerses: draft.relatedVerses ?? [],
    ...(draft.notes ? { notes: draft.notes } : {}),
    ...(draft.imagePlaceholder
      ? { imagePlaceholder: draft.imagePlaceholder }
      : {}),
  };
}

function dedupePeople(people: PersonDraft[]): PersonDraft[] {
  const map = new Map<string, PersonDraft>();
  for (const person of people) {
    const existing = map.get(person.id);
    if (!existing) {
      map.set(person.id, person);
      continue;
    }
    // Merge relationships / aliases when the same id appears in multiple draft lists.
    const aliases = [
      ...new Set([...(existing.aliases ?? []), ...(person.aliases ?? [])]),
    ];
    const relKey = (r: { type: string; personId: string }) =>
      `${r.type}:${r.personId}`;
    const rels = [...(existing.relationships ?? [])];
    const seen = new Set(rels.map(relKey));
    for (const r of person.relationships ?? []) {
      if (!seen.has(relKey(r))) {
        rels.push(r);
        seen.add(relKey(r));
      }
    }
    map.set(person.id, {
      ...existing,
      ...person,
      aliases,
      relationships: rels,
      importance: Math.max(existing.importance ?? 3, person.importance ?? 3),
      scriptureSources: [
        ...(existing.scriptureSources ?? []),
        ...(person.scriptureSources ?? []),
      ].filter(
        (s, i, arr) =>
          arr.findIndex(
            (x) =>
              x.work === s.work &&
              x.section === s.section &&
              x.chapter === s.chapter,
          ) === i,
      ),
    });
  }
  return [...map.values()];
}

type ModuleDraft = {
  slug: string;
  title: string;
  sanskritTitle?: string;
  eyebrow?: string;
  summary: string;
  description: string;
  personIds: string[];
  rootPersonId?: string;
  highlightPath?: string[];
  scriptureSources?: Cite[];
  relatedGitaChapters?: number[];
  faq?: Array<{ question: string; answer: string }>;
  color?: { accent: string; tint: string };
  order: number;
};

function mod(m: ModuleDraft) {
  return {
    ...m,
    status: "available" as const,
    scriptureSources: m.scriptureSources ?? [],
  };
}

async function main() {
  const allDrafts = dedupePeople([
    ...COSMIC,
    ...PRAJAPATIS,
    ...KASYAPA_LINE,
    ...DAITYAS,
    ...DANAVAS,
    ...DEVAS,
    ...NAGAS,
    ...RAKSHASAS,
    ...GANDHARVAS,
    ...MANUS,
    ...SOLAR,
    ...RAMA_FAMILY,
    ...LUNAR,
    ...YADU_KRISHNA,
    ...KURU_LINE,
    ...PANDAVAS,
    ...KAURAVAS,
    ...MAJOR_RISHIS,
  ]);

  const people = allDrafts.map(finalize).sort((a, b) => a.id.localeCompare(b.id));
  const ids = new Set(people.map((p) => p.id));

  const modules = [
    mod({
      slug: "cosmic-creation",
      title: "Cosmic Creation",
      sanskritTitle: "सृष्टि",
      eyebrow: "Origin",
      summary: "Viṣṇu, Brahmā, and the first mind-born progenitors.",
      description:
        "Purāṇic creation opens with Viṣṇu; Brahmā projects the Prajāpatis who seed later lineages. This module stays at the cosmic root — not a merged mega-tree.",
      personIds: [
        "vishnu",
        "brahma",
        "saraswati",
        "lakshmi",
        "shiva",
        "parvati",
        "marichi",
        "atri",
        "angiras",
        "pulastya",
        "pulaha",
        "kratu",
        "vasishtha",
        "daksha",
        "narada",
      ],
      rootPersonId: "vishnu",
      scriptureSources: [
        { work: "Bhāgavata Purāṇa", section: "Skandha 3", chapter: "8–12" },
        { work: "Viṣṇu Purāṇa", section: "Aṃśa 1" },
      ],
      order: 5,
      color: { accent: "#7f4a2b", tint: "#f6dfcd" },
    }),
    mod({
      slug: "trimurti",
      title: "Trimūrti",
      sanskritTitle: "त्रिमूर्ति",
      eyebrow: "Divinity",
      summary: "Brahmā, Viṣṇu, Śiva with consorts and children.",
      description:
        "Creation, sustenance and dissolution — with Sarasvatī, Lakṣmī, Pārvatī, Gaṇeśa and Kārttikeya. Variant birth narratives are marked, not flattened.",
      personIds: [
        "brahma",
        "vishnu",
        "shiva",
        "saraswati",
        "lakshmi",
        "parvati",
        "ganesha",
        "kartikeya",
      ],
      rootPersonId: "vishnu",
      scriptureSources: [
        { work: "Viṣṇu Purāṇa" },
        { work: "Śiva Purāṇa" },
        { work: "Bhāgavata Purāṇa" },
      ],
      relatedGitaChapters: [10, 11],
      order: 10,
      color: { accent: "#7f4a2b", tint: "#f6dfcd" },
    }),
    mod({
      slug: "major-devis",
      title: "Major Devīs",
      sanskritTitle: "देव्यः",
      eyebrow: "Śakti",
      summary: "Lakṣmī, Sarasvatī, Pārvatī, Gaṅgā and related forms.",
      description:
        "Principal goddesses attested in Purāṇa and epic, kept as a Devī module rather than mixed into male dynastic trees.",
      personIds: [
        "lakshmi",
        "saraswati",
        "parvati",
        "ganga",
        "sita",
        "draupadi",
        "vishnu",
        "brahma",
        "shiva",
        "shantanu",
        "rama",
        "yudhishthira",
      ],
      rootPersonId: "lakshmi",
      scriptureSources: [
        { work: "Viṣṇu Purāṇa" },
        { work: "Śiva Purāṇa" },
        { work: "Rāmāyaṇa" },
      ],
      order: 15,
      color: { accent: "#8c4573", tint: "#f4d3e2" },
    }),
    mod({
      slug: "prajapatis",
      title: "Prajāpatis",
      sanskritTitle: "प्रजापतयः",
      eyebrow: "Progenitors",
      summary: "Mind-born sons of Brahmā who seed later races.",
      description:
        "Bhāgavata Purāṇa 3.12 lists the mānasaputras. Counts vary across Manu Smṛti and epic redactions — recorded as variant tradition on Brahmā.",
      personIds: [
        "brahma",
        "marichi",
        "atri",
        "angiras",
        "pulastya",
        "pulaha",
        "kratu",
        "vasishtha",
        "daksha",
        "narada",
        "kashyapa",
      ],
      rootPersonId: "brahma",
      highlightPath: ["brahma", "marichi", "kashyapa"],
      scriptureSources: [
        { work: "Bhāgavata Purāṇa", section: "Skandha 3", chapter: "12" },
      ],
      order: 20,
      color: { accent: "#5b6b3c", tint: "#e8ecd0" },
    }),
    mod({
      slug: "manus",
      title: "Manus",
      sanskritTitle: "मनवः",
      eyebrow: "Manvantara",
      summary: "Vaivasvata Manu — Manu of the present age.",
      description:
        "Only the current Manu (Vaivasvata) is expanded here with verified links to Vivasvān and Ikṣvāku. Other Manus can be added when each citation is locked.",
      personIds: ["vivasvan", "vaivasvata-manu", "ikshvaku", "aditi", "kashyapa"],
      rootPersonId: "vivasvan",
      highlightPath: ["vivasvan", "vaivasvata-manu", "ikshvaku"],
      scriptureSources: [
        { work: "Bhāgavata Purāṇa", section: "Skandha 8–9" },
        { work: "Bhagavad Gītā", chapter: "4" },
      ],
      order: 25,
      color: { accent: "#6f5b2f", tint: "#efe4c2" },
    }),
    mod({
      slug: "saptarishis",
      title: "Saptarṣis",
      sanskritTitle: "सप्तर्षयः",
      eyebrow: "Seers",
      summary: "The seven seers associated with Brahmā's mind-born line.",
      description:
        "Lists of Saptarṣis shift by manvantara. Divine shows the Bhāgavata mānasaputra set used as the working Vaivasvata baseline.",
      personIds: [
        "brahma",
        "marichi",
        "atri",
        "angiras",
        "pulastya",
        "pulaha",
        "kratu",
        "vasishtha",
        "brihaspati",
        "anasuya",
        "dattatreya",
      ],
      rootPersonId: "brahma",
      scriptureSources: [
        { work: "Bhāgavata Purāṇa", section: "Skandha 3", chapter: "12" },
      ],
      order: 30,
      color: { accent: "#3e5a70", tint: "#d3e0ea" },
    }),
    mod({
      slug: "devas",
      title: "Devas",
      sanskritTitle: "देवाः",
      eyebrow: "Ādityas",
      summary: "Kaśyapa → Aditi → the Ādityas (Indra, Vivasvān, and kin).",
      description:
        "Devas are not Asuras. This module follows Kaśyapa and Aditi into the Āditya catalogue of Viṣṇu and Bhāgavata Purāṇas.",
      personIds: [
        "brahma",
        "marichi",
        "kashyapa",
        "daksha",
        "aditi",
        "indra",
        "vivasvan",
        "varuna",
        "mitra",
        "aryaman",
        "bhaga",
        "pushan",
        "savitr",
        "brihaspati",
        "angiras",
      ],
      rootPersonId: "kashyapa",
      highlightPath: ["brahma", "marichi", "kashyapa", "aditi", "indra"],
      scriptureSources: [
        { work: "Bhāgavata Purāṇa", section: "Skandha 6", chapter: "6" },
        { work: "Viṣṇu Purāṇa", section: "Aṃśa 1", chapter: "15" },
      ],
      order: 35,
      color: { accent: "#4d6a86", tint: "#d5e2ee" },
    }),
    mod({
      slug: "asuras",
      title: "Asuras",
      sanskritTitle: "असुराः",
      eyebrow: "Asura lineages",
      summary:
        "Daityas and Dānavas — the principal Asura houses. Open Daityas or Dānavas for the full separate trees.",
      description:
        "In Purāṇic taxonomy, Asura is an umbrella for the lineages of Diti (Daityas) and Danu (Dānavas). Rākṣasas are a separate race (Pulastya → Rāvaṇa) and are not merged here. This hub shows both Asura houses side by side; dive into Daityas or Dānavas for the dedicated spines.",
      personIds: [
        "brahma",
        "marichi",
        "kashyapa",
        "daksha",
        "diti",
        "danu",
        "hiranyakashipu",
        "hiranyaksha",
        "simhika",
        "prahlada",
        "virocana",
        "bali",
        "bana",
        "rahu",
        "vipracitti",
        "puloman",
        "namuci",
        "shambara",
        "maya-danava",
      ],
      rootPersonId: "kashyapa",
      highlightPath: [
        "kashyapa",
        "diti",
        "hiranyakashipu",
        "prahlada",
        "virocana",
        "bali",
      ],
      scriptureSources: [
        { work: "Bhāgavata Purāṇa", section: "Skandha 3", chapter: "14" },
        { work: "Bhāgavata Purāṇa", section: "Skandha 6–8" },
        { work: "Viṣṇu Purāṇa", section: "Aṃśa 1", chapter: "21" },
      ],
      relatedGitaChapters: [10],
      faq: [
        {
          question: "Are Daityas, Dānavas and Rākṣasas the same?",
          answer:
            "No. Daityas are children of Diti; Dānavas of Danu; Rākṣasas (e.g. Rāvaṇa) descend from Pulastya through Viśravas. Divine keeps three separate modules so the trees are never mixed.",
        },
        {
          question: "Where is Prahlāda / Bali / Rāvaṇa?",
          answer:
            "Prahlāda and Bali are under Daityas (and this Asuras hub). Rāvaṇa is under Rākṣasas — not Asuras.",
        },
      ],
      order: 38,
      color: { accent: "#6b3236", tint: "#e9c9cd" },
    }),
    mod({
      slug: "daityas",
      title: "Daityas",
      sanskritTitle: "दैत्याः",
      eyebrow: "Asura · Sons of Diti",
      summary: "Kaśyapa → Diti → Hiraṇyakaśipu line through Bali and Bāṇa.",
      description:
        "Daityas are the children of Diti — kept strictly separate from Dānavas and Rākṣasas. Includes Siṃhikā and Rāhu (Daitya mother; Dānava father).",
      personIds: [
        "brahma",
        "marichi",
        "kashyapa",
        "daksha",
        "diti",
        "hiranyakashipu",
        "hiranyaksha",
        "simhika",
        "prahlada",
        "virocana",
        "bali",
        "bana",
        "rahu",
        "vipracitti",
      ],
      rootPersonId: "diti",
      highlightPath: [
        "brahma",
        "marichi",
        "kashyapa",
        "diti",
        "hiranyakashipu",
        "prahlada",
        "virocana",
        "bali",
        "bana",
      ],
      scriptureSources: [
        { work: "Bhāgavata Purāṇa", section: "Skandha 3", chapter: "14" },
        { work: "Bhāgavata Purāṇa", section: "Skandha 7–8" },
      ],
      relatedGitaChapters: [10],
      order: 40,
      color: { accent: "#6b3236", tint: "#e9c9cd" },
    }),
    mod({
      slug: "danavas",
      title: "Dānavas",
      sanskritTitle: "दानवाः",
      eyebrow: "Asura · Sons of Danu",
      summary: "Kaśyapa → Danu → Vipracitti and listed Dānava sons.",
      description:
        "Dānavas descend from Danu. Only figures with Purāṇic or epic support are included — Vipracitti, Puloman, Namuci, Śambara, Maya.",
      personIds: [
        "brahma",
        "marichi",
        "kashyapa",
        "daksha",
        "danu",
        "vipracitti",
        "puloman",
        "namuci",
        "shambara",
        "maya-danava",
        "simhika",
        "rahu",
      ],
      rootPersonId: "danu",
      highlightPath: ["brahma", "marichi", "kashyapa", "danu", "vipracitti"],
      scriptureSources: [
        { work: "Bhāgavata Purāṇa", section: "Skandha 6", chapter: "6" },
        { work: "Viṣṇu Purāṇa", section: "Aṃśa 1", chapter: "21" },
      ],
      order: 45,
      color: { accent: "#5a3a4a", tint: "#e8d0da" },
    }),
    mod({
      slug: "rakshasas",
      title: "Rākṣasas",
      sanskritTitle: "राक्षसाः",
      eyebrow: "Not Asuras · Laṅkā line",
      summary: "Pulastya → Viśravas → Rāvaṇa and siblings (separate from Daitya/Dānava).",
      description:
        "Rākṣasa genealogy is independent: Pulastya's line through Viśravas and Kaikasī. Kubera (Yakṣa) appears as half-brother, not reclassified as Rākṣasa. Not merged into the Asuras module.",
      personIds: [
        "brahma",
        "pulastya",
        "visravas",
        "kaikasi",
        "kubera",
        "ravana",
        "kumbhakarna",
        "vibhishana",
        "surpanakha",
        "indrajit",
      ],
      rootPersonId: "pulastya",
      highlightPath: [
        "brahma",
        "pulastya",
        "visravas",
        "ravana",
        "indrajit",
      ],
      scriptureSources: [{ work: "Rāmāyaṇa", section: "Uttara Kāṇḍa", chapter: "2–9" }],
      order: 50,
      color: { accent: "#5c2a2e", tint: "#e6c4c8" },
    }),
    mod({
      slug: "nagas",
      title: "Nāgas",
      sanskritTitle: "नागाः",
      eyebrow: "Serpent race",
      summary: "Kaśyapa → Kadrū → Ananta, Vāsuki, Takṣaka and principal Nāgas.",
      description:
        "Nāgas are a separate Kaśyapa–Kadrū lineage. Lists of principal serpents follow Bhāgavata and Mahābhārata catalogues.",
      personIds: [
        "kashyapa",
        "daksha",
        "kadru",
        "ananta",
        "vasuki",
        "takshaka",
        "karkotaka",
        "padma-naga",
        "mahapadma-naga",
        "kulika-naga",
        "shankha-naga",
      ],
      rootPersonId: "kadru",
      highlightPath: ["kashyapa", "kadru", "ananta"],
      scriptureSources: [
        { work: "Bhāgavata Purāṇa", section: "Skandha 5–6" },
        { work: "Mahābhārata", section: "Ādi Parva", chapter: "16" },
      ],
      order: 55,
      color: { accent: "#3f6a6a", tint: "#cee3e3" },
    }),
    mod({
      slug: "yakshas",
      title: "Yakṣas",
      sanskritTitle: "यक्षाः",
      eyebrow: "Guardians",
      summary: "Kubera, lord of Yakṣas — linked but not merged into Rākṣasas.",
      description:
        "Sparse by design: Kubera is securely attested as Yakṣa sovereign and half-brother of Rāvaṇa. Further Yakṣa names await verified parentage before inclusion.",
      personIds: ["visravas", "kubera", "ravana"],
      rootPersonId: "kubera",
      scriptureSources: [
        { work: "Rāmāyaṇa", section: "Uttara Kāṇḍa" },
        { work: "Bhāgavata Purāṇa", section: "Skandha 4", chapter: "1" },
      ],
      order: 60,
      color: { accent: "#4b6c5f", tint: "#d4e5df" },
    }),
    mod({
      slug: "gandharvas",
      title: "Gandharvas",
      sanskritTitle: "गन्धर्वाः",
      eyebrow: "Celestial musicians",
      summary: "Named Gandharvas with epic/Gītā attestation — no invented pedigree.",
      description:
        "Citraratha is included from Mahābhārata and Bhagavad Gītā 10.26. Parentage is left unset where primary sources do not fix it.",
      personIds: ["chitraratha"],
      rootPersonId: "chitraratha",
      scriptureSources: [
        { work: "Mahābhārata", section: "Ādi Parva" },
        { work: "Bhagavad Gītā", chapter: "10" },
      ],
      relatedGitaChapters: [10],
      order: 65,
      color: { accent: "#7c6c39", tint: "#eee4c0" },
    }),
    mod({
      slug: "solar-dynasty",
      title: "Solar Dynasty",
      sanskritTitle: "सूर्यवंश",
      eyebrow: "Sūryavaṃśa",
      summary: "Vivasvān → Vaivasvata Manu → Ikṣvāku → Raghu → Daśaratha.",
      description:
        "A verified spine of the Ikṣvāku line. Intermediate kings are omitted until each link is individually cited — accuracy over a dense unverified ladder.",
      personIds: [
        "vivasvan",
        "vaivasvata-manu",
        "ikshvaku",
        "raghu",
        "aja",
        "dasharatha",
        "kausalya",
        "kaikeyi",
        "sumitra",
        "rama",
        "bharata",
        "lakshmana",
        "shatrughna",
      ],
      rootPersonId: "vivasvan",
      highlightPath: [
        "vivasvan",
        "vaivasvata-manu",
        "ikshvaku",
        "raghu",
        "aja",
        "dasharatha",
        "rama",
      ],
      scriptureSources: [
        { work: "Bhāgavata Purāṇa", section: "Skandha 9" },
        { work: "Rāmāyaṇa", section: "Bāla Kāṇḍa", chapter: "70" },
        { work: "Viṣṇu Purāṇa", section: "Aṃśa 4" },
      ],
      order: 70,
      color: { accent: "#6a4b1e", tint: "#f0e0bd" },
    }),
    mod({
      slug: "lunar-dynasty",
      title: "Lunar Dynasty",
      sanskritTitle: "चन्द्रवंश",
      eyebrow: "Candravaṃśa",
      summary: "Atri → Candra → Budha → Purūravas → Yayāti → Yadu / Puru.",
      description:
        "Origin of the Lunar line and the fork into Yādava and Paurava branches. Long intermediate reigns are marked as traditional descendant links, not invented father–son steps.",
      personIds: [
        "atri",
        "chandra",
        "budha",
        "pururavas",
        "yayati",
        "yadu",
        "puru",
      ],
      rootPersonId: "atri",
      highlightPath: ["atri", "chandra", "budha", "pururavas", "yayati"],
      scriptureSources: [
        { work: "Bhāgavata Purāṇa", section: "Skandha 9", chapter: "14–19" },
        { work: "Viṣṇu Purāṇa", section: "Aṃśa 4" },
      ],
      order: 75,
      color: { accent: "#5c6d80", tint: "#dce6ee" },
    }),
    mod({
      slug: "raghu-dynasty",
      title: "Raghu Dynasty",
      sanskritTitle: "रघुवंश",
      eyebrow: "Raghuvaṃśa",
      summary: "Raghu → Aja → Daśaratha → Rāma and brothers.",
      description:
        "Focused Raghuvaṃśa module overlapping the Solar spine from Raghu through Rāma's generation.",
      personIds: [
        "raghu",
        "aja",
        "dasharatha",
        "kausalya",
        "kaikeyi",
        "sumitra",
        "rama",
        "sita",
        "bharata",
        "lakshmana",
        "shatrughna",
        "lava",
        "kusha",
        "vasishtha",
      ],
      rootPersonId: "raghu",
      highlightPath: ["raghu", "aja", "dasharatha", "rama"],
      scriptureSources: [
        { work: "Rāmāyaṇa" },
        { work: "Bhāgavata Purāṇa", section: "Skandha 9", chapter: "10" },
      ],
      order: 80,
      color: { accent: "#6a4b1e", tint: "#f0e0bd" },
    }),
    mod({
      slug: "yadu-dynasty",
      title: "Yadu Dynasty",
      sanskritTitle: "यदुवंश",
      eyebrow: "Yādavas",
      summary: "Yayāti → Yadu → Vasudeva → Kṛṣṇa and Balarāma.",
      description:
        "Yādava line into the Vṛṣṇi house of Vasudeva. Intermediate names between Yadu and Vasudeva are not fabricated.",
      personIds: [
        "yayati",
        "yadu",
        "vasudeva",
        "devaki",
        "rohini",
        "kamsa",
        "krishna",
        "balarama",
        "subhadra",
        "nanda",
        "yashoda",
        "rukmini",
      ],
      rootPersonId: "yadu",
      highlightPath: ["yadu", "vasudeva", "krishna"],
      scriptureSources: [
        { work: "Bhāgavata Purāṇa", section: "Skandha 9–10" },
        { work: "Harivaṃśa" },
      ],
      order: 85,
      color: { accent: "#8a3b52", tint: "#f7d9dd" },
    }),
    mod({
      slug: "kuru-dynasty",
      title: "Kuru Dynasty",
      sanskritTitle: "कुरुवंश",
      eyebrow: "Kurus",
      summary: "Kuru → Śaṃtanu → Bhīṣma / Vicitravīrya → Dhṛtarāṣṭra & Pāṇḍu.",
      description:
        "Core Kuru house of the Mahābhārata Ādi Parva — including Vyāsa's niyoga and the split into Kaurava and Pāṇḍava houses.",
      personIds: [
        "puru",
        "kuru",
        "shantanu",
        "ganga",
        "satyavati",
        "bhishma",
        "vyasa",
        "parasara",
        "vichitravirya",
        "ambika",
        "ambalika",
        "dhritarashtra",
        "gandhari",
        "pandu",
        "vidura",
        "kunti",
        "madri",
      ],
      rootPersonId: "kuru",
      highlightPath: ["kuru", "shantanu", "bhishma"],
      scriptureSources: [{ work: "Mahābhārata", section: "Ādi Parva", chapter: "94–115" }],
      order: 90,
      color: { accent: "#7c3f28", tint: "#f2d5c8" },
    }),
    mod({
      slug: "pandavas",
      title: "Pāṇḍavas",
      sanskritTitle: "पाण्डवाः",
      eyebrow: "Sons of Pāṇḍu",
      summary: "The five brothers, Draupadī, Subhadrā, Abhimanyu and Karṇa.",
      description:
        "Pāṇḍu's sons by divine fathers, their common wife Draupadī, and close kin. Divine parentage is noted on relationships.",
      personIds: [
        "pandu",
        "kunti",
        "madri",
        "yudhishthira",
        "bhima",
        "arjuna",
        "nakula",
        "sahadeva",
        "draupadi",
        "subhadra",
        "abhimanyu",
        "karna",
        "krishna",
      ],
      rootPersonId: "pandu",
      highlightPath: ["pandu", "arjuna", "abhimanyu"],
      scriptureSources: [{ work: "Mahābhārata", section: "Ādi Parva" }],
      relatedGitaChapters: [1, 2],
      order: 95,
      color: { accent: "#5d6e37", tint: "#e9edcc" },
    }),
    mod({
      slug: "kauravas",
      title: "Kauravas",
      sanskritTitle: "कौरवाः",
      eyebrow: "Sons of Dhṛtarāṣṭra",
      summary: "Dhṛtarāṣṭra, Gāndhārī, Duryodhana, Duḥśāsana and Duḥśalā.",
      description:
        "The hundred sons are not enumerated one-by-one; the principal named siblings are included with Ādi Parva citations.",
      personIds: [
        "dhritarashtra",
        "gandhari",
        "duryodhana",
        "dushasana",
        "duhsala",
        "bhishma",
        "vidura",
        "shantanu",
        "vyasa",
      ],
      rootPersonId: "dhritarashtra",
      highlightPath: ["dhritarashtra", "duryodhana"],
      scriptureSources: [{ work: "Mahābhārata", section: "Ādi Parva", chapter: "109–115" }],
      order: 100,
      color: { accent: "#6b3236", tint: "#e9c9cd" },
    }),
    mod({
      slug: "krishna-family",
      title: "Kṛṣṇa's Family",
      sanskritTitle: "कृष्णपरिवार",
      eyebrow: "Vṛṣṇi house",
      summary: "Vasudeva, Devakī, Nanda–Yaśodā, Balarāma, Rukmiṇī and Subhadrā.",
      description:
        "Birth house and foster house of Kṛṣṇa, plus principal consort Rukmiṇī. Aliases (Govinda, Mādhava, Vāsudeva…) are searchable.",
      personIds: [
        "vasudeva",
        "devaki",
        "rohini",
        "kamsa",
        "krishna",
        "balarama",
        "nanda",
        "yashoda",
        "rukmini",
        "subhadra",
        "vishnu",
      ],
      rootPersonId: "vasudeva",
      highlightPath: ["vasudeva", "krishna"],
      scriptureSources: [
        { work: "Bhāgavata Purāṇa", section: "Skandha 10" },
        { work: "Harivaṃśa" },
      ],
      relatedGitaChapters: [4, 10, 11],
      order: 105,
      color: { accent: "#8a3b52", tint: "#f7d9dd" },
    }),
    mod({
      slug: "rama-family",
      title: "Rāma's Family",
      sanskritTitle: "रामपरिवार",
      eyebrow: "Ayodhyā",
      summary: "Daśaratha's queens, the four brothers, Sītā, Lava and Kuśa.",
      description:
        "Immediate family of Rāma from the Valmīki Rāmāyaṇa — including Janaka as adoptive father of Sītā.",
      personIds: [
        "dasharatha",
        "kausalya",
        "kaikeyi",
        "sumitra",
        "rama",
        "sita",
        "janaka",
        "bharata",
        "lakshmana",
        "shatrughna",
        "lava",
        "kusha",
        "vasishtha",
        "vishnu",
      ],
      rootPersonId: "dasharatha",
      highlightPath: ["dasharatha", "rama", "lava"],
      scriptureSources: [{ work: "Rāmāyaṇa" }],
      order: 110,
      color: { accent: "#6a4b1e", tint: "#f0e0bd" },
    }),
    mod({
      slug: "major-rishis",
      title: "Major Ṛṣis",
      sanskritTitle: "महर्षयः",
      eyebrow: "Sages",
      summary: "Vasiṣṭha, Vyāsa, Vālmīki, Nārada, Parāśara and kin.",
      description:
        "Seers who structure epic and Purāṇic transmission. Parentage is stated only where the primary narrative fixes it.",
      personIds: [
        "brahma",
        "vasishtha",
        "vyasa",
        "parasara",
        "valmiki",
        "narada",
        "atri",
        "anasuya",
        "dattatreya",
        "brihaspati",
        "angiras",
        "pulastya",
        "dasharatha",
        "rama",
        "satyavati",
      ],
      rootPersonId: "brahma",
      scriptureSources: [
        { work: "Mahābhārata" },
        { work: "Rāmāyaṇa" },
        { work: "Bhāgavata Purāṇa" },
      ],
      order: 115,
      color: { accent: "#5c6d80", tint: "#dce6ee" },
    }),
    mod({
      slug: "major-kings",
      title: "Major Kings",
      sanskritTitle: "राजानः",
      eyebrow: "Sovereigns",
      summary: "Cross-dynasty kings with the strongest scriptural footprints.",
      description:
        "A curated index of major kings already attested in dynasty modules — not a new invented genealogy.",
      personIds: [
        "ikshvaku",
        "raghu",
        "aja",
        "dasharatha",
        "rama",
        "janaka",
        "sita",
        "yayati",
        "yadu",
        "puru",
        "kuru",
        "shantanu",
        "dhritarashtra",
        "pandu",
        "yudhishthira",
        "bali",
        "virocana",
        "prahlada",
        "ravana",
        "visravas",
        "kubera",
        "kamsa",
        "devaki",
      ],
      rootPersonId: "yudhishthira",
      scriptureSources: [
        { work: "Mahābhārata" },
        { work: "Rāmāyaṇa" },
        { work: "Bhāgavata Purāṇa" },
      ],
      order: 120,
      color: { accent: "#6a4b1e", tint: "#f0e0bd" },
    }),
  ];

  // Validate module personIds before write.
  const errors: string[] = [];
  for (const m of modules) {
    for (const pid of m.personIds) {
      if (!ids.has(pid)) errors.push(`module ${m.slug}: unknown person ${pid}`);
    }
    if (m.rootPersonId && !ids.has(m.rootPersonId)) {
      errors.push(`module ${m.slug}: unknown root ${m.rootPersonId}`);
    }
  }
  for (const person of people) {
    for (const r of person.relationships) {
      if (!ids.has(r.personId)) {
        errors.push(`${person.id} → ${r.personId} (missing)`);
      }
      if (!r.confidence) errors.push(`${person.id}: rel missing confidence`);
      if (!r.sources?.length) errors.push(`${person.id}: rel missing sources`);
    }
  }
  if (errors.length) {
    console.error("Rebuild aborted:\n" + errors.join("\n"));
    process.exit(1);
  }

  const generatedAt = new Date().toISOString();
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(
    path.join(OUT_DIR, "people.json"),
    JSON.stringify({ generatedAt, schemaVersion: 2, people }, null, 2) + "\n",
  );
  await fs.writeFile(
    path.join(OUT_DIR, "modules.json"),
    JSON.stringify({ generatedAt, schemaVersion: 2, modules }, null, 2) + "\n",
  );

  console.log(
    `Wrote ${people.length} people, ${modules.length} modules → ${OUT_DIR}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
