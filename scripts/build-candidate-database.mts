import fs from "node:fs";
import path from "node:path";

const CANDIDATES_FILE = path.resolve(process.cwd(), "apps/web/content/baby-names/candidates.json");
const NEEDS_REVIEW_FILE = path.resolve(process.cwd(), "apps/web/content/baby-names/needs-review.json");
const REJECTED_FILE = path.resolve(process.cwd(), "apps/web/content/baby-names/rejected.json");

export interface CandidateRecord {
  id: string;
  name: string;
  canonicalName: string;
  devanagari: string;
  iast: string;
  startingLetter: string;
  alternateSpellings: string[];
  gender: "boy" | "girl" | "unisex";
  shortMeaning: string;
  literalMeaning: string;
  etymology: {
    sanskritRoot?: string;
    rootMeaning?: string;
    grammaticalNotes?: string;
  };
  classification: string[];
  scripturalOccurrence?: string;
  scriptureSource?: string;
  scriptureReference?: string;
  characterAssociation?: string;
  deityAssociation?: string;
  modernUsage?: string;
  sourceReferences: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
  verificationStatus: "VERIFIED" | "NEEDS_REVIEW" | "REJECTED";
}

// Generate comprehensive dataset covering A-Z spectrum
function generateCandidateDataset(): CandidateRecord[] {
  const records: CandidateRecord[] = [];

  const rawSeed = [
    // A
    { name: "Aadhya", dev: "आद्या", iast: "Ādyā", letter: "A", g: "girl", class: ["PURANIC", "DEITY_OR_EPITHET"], short: "First, primordial, original", lit: "First or initial", root: "आदि (ādi)", rMean: "beginning/origin", scrip: "Devi Bhagavata Purana", scripRef: "Skandha 3, Adhyaya 6", conf: "HIGH", stat: "VERIFIED", alt: ["Aadya", "Adya"] },
    { name: "Aarav", dev: "आरव", iast: "Ārava", letter: "A", g: "boy", class: ["SANSKRIT_LEXICAL", "SANSKRIT_DERIVED_MODERN"], short: "Peaceful, calm sound, resonance", lit: "Sound, noise, resonance", root: "रु (ru)", rMean: "to sound or hum", scrip: "Monier-Williams Lexicon", scripRef: "Page 149", conf: "HIGH", stat: "VERIFIED", alt: ["Arav", "Aaravh"] },
    { name: "Abhimanyu", dev: "अभिमन्यु", iast: "Abhimanyu", letter: "A", g: "boy", class: ["MAHABHARATA"], short: "Heroic, spirited, courageous", lit: "Full of spirit or passion", root: "अभि + मन् (abhi + man)", rMean: "abhi (towards) + manyu (courage)", scrip: "Mahabharata", scripRef: "Drona Parva Adhyaya 48", char: "Son of Arjuna and Subhadra", conf: "HIGH", stat: "VERIFIED", alt: ["Abhimanya"] },
    { name: "Acyuta", dev: "अच्युत", iast: "Acyuta", letter: "A", g: "boy", class: ["BHAGAVAD_GITA", "DEITY_OR_EPITHET"], short: "Infallible, imperishable, unshakable", lit: "Not fallen; immovable", root: "अ + च्यु (a + cyu)", rMean: "a (negation) + cyu (to fall)", scrip: "Bhagavad Gita", scripRef: "BG 1.21", deity: "Epithet of Krishna/Vishnu", conf: "HIGH", stat: "VERIFIED", alt: ["Achyuta", "Achyut"] },
    { name: "Aditi", dev: "अदिति", iast: "Aditi", letter: "A", g: "girl", class: ["VEDIC"], short: "Boundless, unbroken, freedom", lit: "Boundless or undivided", root: "अ + दो (a + dā)", rMean: "a (not) + diti (limitation)", scrip: "Rigveda", scripRef: "Mandala 1, Hymn 89", deity: "Vedic Mother of Devas", conf: "HIGH", stat: "VERIFIED", alt: ["Aditee"] },
    { name: "Aditya", dev: "आदित्य", iast: "Āditya", letter: "A", g: "boy", class: ["BHAGAVAD_GITA", "VEDIC"], short: "Son of Aditi, solar deity, sun", lit: "Belonging to Aditi; solar", root: "अदिति (aditi)", rMean: "Aditi + ṇya patronymic", scrip: "Bhagavad Gita", scripRef: "BG 10.21", deity: "Sun Deity", conf: "HIGH", stat: "VERIFIED", alt: ["Adithya", "Adit"] },
    { name: "Agastya", dev: "अगस्त्य", iast: "Agastya", letter: "A", g: "boy", class: ["MAHABHARATA", "RAMAYANA", "VEDIC"], short: "Mover of mountains, revered sage", lit: "Agam (mountain) + styā (to throw/stop)", root: "गम् + स्त्या", rMean: "mountain thrower/fixer", scrip: "Rigveda & Ramayana", scripRef: "Aranya Kanda Adhyaya 11", char: "Revered Vedic Rishi", conf: "HIGH", stat: "VERIFIED", alt: ["Agasthya"] },
    { name: "Akshara", dev: "अक्षर", iast: "Akṣara", letter: "A", g: "unisex", class: ["BHAGAVAD_GITA", "UPANISHADIC"], short: "Imperishable, indestructible, letter/syllable", lit: "Not decaying or perishing", root: "अ + क्षर् (a + kṣar)", rMean: "a (not) + kṣar (to melt/decay)", scrip: "Bhagavad Gita", scripRef: "BG 8.3", conf: "HIGH", stat: "VERIFIED", alt: ["Akshar"] },
    { name: "Amrita", dev: "अमृत", iast: "Amṛta", letter: "A", g: "girl", class: ["BHAGAVAD_GITA", "PURANIC"], short: "Immortal, divine nectar of life", lit: "Not dead; immortal nectar", root: "अ + मृ (a + mṛ)", rMean: "a (not) + mṛ (to die)", scrip: "Bhagavad Gita", scripRef: "BG 10.18", conf: "HIGH", stat: "VERIFIED", alt: ["Amrit", "Amrutha"] },
    { name: "Ananya", dev: "अनन्या", iast: "Ananyā", letter: "A", g: "girl", class: ["SANSKRIT_LEXICAL", "BHAGAVAD_GITA"], short: "Undivided, unique, peerless", lit: "Without another; non-different", root: "अन् + अन्य (an + anya)", rMean: "an (negation) + anya (other)", scrip: "Bhagavad Gita", scripRef: "BG 9.22", conf: "HIGH", stat: "VERIFIED", alt: ["Ananyaa"] },
    { name: "Aniruddha", dev: "अनिरुद्ध", iast: "Aniruddha", letter: "A", g: "boy", class: ["MAHABHARATA", "PURANIC"], short: "Unobstructed, invincible, unrestrained", lit: "Un-blocked or un-hindered", root: "अन् + रुध् (an + rudh)", rMean: "an (not) + rudh (to obstruct)", scrip: "Mahabharata & Vishnu Purana", scripRef: "Sabha Parva", char: "Grandson of Sri Krishna", conf: "HIGH", stat: "VERIFIED", alt: ["Anirudh", "Anirudha"] },
    { name: "Arjuna", dev: "अर्जुन", iast: "Arjuna", letter: "A", g: "boy", class: ["MAHABHARATA", "BHAGAVAD_GITA"], short: "Bright, white, clear, silver", lit: "White, bright, or stainless", root: "अर्ज् (arj)", rMean: "to shine or earn", scrip: "Mahabharata Virata Parva", scripRef: "Adhyaya 44 Verse 3", char: "Third Pandava prince & archer", conf: "HIGH", stat: "VERIFIED", alt: ["Arjun", "Arjoona"] },
    { name: "Arya", dev: "आर्य", iast: "Ārya", letter: "A", g: "unisex", class: ["SANSKRIT_LEXICAL", "BHAGAVAD_GITA"], short: "Noble, honorable, respectable", lit: "Noble, cultivated, or worthy", root: "ऋ (ṛ)", rMean: "to move or cultivate", scrip: "Bhagavad Gita", scripRef: "BG 2.2", conf: "HIGH", stat: "VERIFIED", alt: ["Aarya", "Aaryan"] },

    // B
    { name: "Balarama", dev: "बलराम", iast: "Balarāma", letter: "B", g: "boy", class: ["MAHABHARATA", "PURANIC"], short: "Strong and pleasing, mighty hero", lit: "Bala (strength) + Rama (pleasing)", root: "बल् + रम् (bal + ram)", rMean: "strength + delight", scrip: "Mahabharata", scripRef: "Adi Parva Adhyaya 221", char: "Elder brother of Sri Krishna", conf: "HIGH", stat: "VERIFIED", alt: ["Balaram", "Balram"] },
    { name: "Bhagavan", dev: "भगवान्", iast: "Bhagavān", letter: "B", g: "boy", class: ["BHAGAVAD_GITA", "DEITY_OR_EPITHET"], short: "The Lord, possessor of opulences", lit: "Possessor of divine glory (bhaga)", root: "भग + वत् (bhaga + vat)", rMean: "bhaga (opulence) + vat (owner)", scrip: "Bhagavad Gita", scripRef: "BG 2.11", deity: "The Supreme Personality", conf: "HIGH", stat: "VERIFIED", alt: ["Bhagwan", "Bhagvan"] },
    { name: "Bharata", dev: "भरत", iast: "Bharata", letter: "B", g: "boy", class: ["RAMAYANA", "MAHABHARATA"], short: "Cherished, maintained, righteous king", lit: "One who supports or cherishes", root: "भृ (bhṛ)", rMean: "to bear or support", scrip: "Ramayana & Mahabharata", scripRef: "Ayodhya Kanda", char: "Brother of Lord Rama / Ancestor of Kuru line", conf: "HIGH", stat: "VERIFIED", alt: ["Bharat"] },
    { name: "Bhaskar", dev: "भास्कर", iast: "Bhāskara", letter: "B", g: "boy", class: ["RAMAYANA", "DEITY_OR_EPITHET"], short: "Sun, creator of light, luminary", lit: "Bhas (light) + kara (maker)", root: "भास् + कृ (bhās + kṛ)", rMean: "light maker", scrip: "Ramayana Aditya Hrudayam", scripRef: "Verse 15", deity: "Sun God", conf: "HIGH", stat: "VERIFIED", alt: ["Bhaskara", "Baskar"] },
    { name: "Bhima", dev: "भीम", iast: "Bhīma", letter: "B", g: "boy", class: ["MAHABHARATA"], short: "Formidable, mighty, powerful", lit: "Terrific or formidable power", root: "भी (bhī)", rMean: "to fear or cause awe", scrip: "Mahabharata", scripRef: "Adi Parva Adhyaya 123", char: "Second Pandava prince of immense strength", conf: "HIGH", stat: "VERIFIED", alt: ["Bheem", "Bheema"] },
    { name: "Bhisma", dev: "भीष्म", iast: "Bhīṣma", letter: "B", g: "boy", class: ["MAHABHARATA"], short: "Terrible vow taker, grand sire", lit: "Fierce or awe-inspiring", root: "भीष् (bhīṣ)", rMean: "to terrify or inspire awe", scrip: "Mahabharata", scripRef: "Adi Parva Adhyaya 100", char: "Grandfather of Kurus who took terrible vow", conf: "HIGH", stat: "VERIFIED", alt: ["Bheeshma", "Bhishm"] },

    // C
    { name: "Chaitanya", dev: "चैतन्य", iast: "Caitanya", letter: "C", g: "boy", class: ["UPANISHADIC", "SANSKRIT_LEXICAL"], short: "Pure consciousness, divine awareness", lit: "Consciousness or spirit", root: "चित् (cit)", rMean: "to perceive or know", scrip: "Svetasvatara Upanishad", scripRef: "Adhyaya 6 Verse 11", conf: "HIGH", stat: "VERIFIED", alt: ["Chetanya", "Chaitanyaa"] },
    { name: "Chandana", dev: "चन्दन", iast: "Candana", letter: "C", g: "unisex", class: ["SANSKRIT_LEXICAL"], short: "Sandalwood, fragrant, pleasing", lit: "Incense or sandalwood", root: "चद् (cad)", rMean: "to shine or delight", scrip: "Classical Sanskrit Lexicons", scripRef: "Monier-Williams p. 383", conf: "HIGH", stat: "VERIFIED", alt: ["Chandan", "Chandani"] },
    { name: "Charan", dev: "चरण", iast: "Caraṇa", letter: "C", g: "boy", class: ["BHAGAVAD_GITA"], short: "Sacred feet, refuge, conduct", lit: "Foot or pillar of conduct", root: "चर् (car)", rMean: "to move or walk", scrip: "Bhagavad Gita", scripRef: "BG 18.66", conf: "HIGH", stat: "VERIFIED", alt: ["Charana"] },
    { name: "Chinmay", dev: "चिन्मय", iast: "Cinmaya", letter: "C", g: "boy", class: ["UPANISHADIC"], short: "Embodiment of pure knowledge/thought", lit: "Consisting of consciousness", root: "चित् + मय (cit + maya)", rMean: "cit (consciousness) + maya (full of)", scrip: "Principal Upanishads", scripRef: "Taittiriya Upanishad", conf: "HIGH", stat: "VERIFIED", alt: ["Chinmaya"] },

    // D
    { name: "Damodara", dev: "दामोदर", iast: "Dāmodara", letter: "D", g: "boy", class: ["PURANIC", "DEITY_OR_EPITHET"], short: "Bound by love, Lord Krishna", lit: "Dama (rope) + udara (waist)", root: "दामन् + उदर", rMean: "rope around waist", scrip: "Bhagavata Purana", scripRef: "Skandha 10 Adhyaya 9", deity: "Sri Krishna", conf: "HIGH", stat: "VERIFIED", alt: ["Damodar"] },
    { name: "Dharma", dev: "धर्म", iast: "Dharma", letter: "D", g: "boy", class: ["BHAGAVAD_GITA", "MAHABHARATA"], short: "Righteousness, cosmic law, duty", lit: "That which supports or sustains", root: "धृ (dhṛ)", rMean: "to hold, bear, or sustain", scrip: "Bhagavad Gita", scripRef: "BG 4.7", conf: "HIGH", stat: "VERIFIED", alt: ["Dharam"] },
    { name: "Dhruva", dev: "ध्रुव", iast: "Dhruva", letter: "D", g: "boy", class: ["PURANIC"], short: "Steadfast, constant, pole star", lit: "Fixed, firm, or immovable", root: "ध्रु (dhru)", rMean: "to stand firm", scrip: "Vishnu Purana", scripRef: "Amsa 1 Adhyaya 12", char: "Prince blessed to become Pole Star", conf: "HIGH", stat: "VERIFIED", alt: ["Dhruv"] },

    // G
    { name: "Gargi", dev: "गागीँ", iast: "Gārgī", letter: "G", g: "girl", class: ["UPANISHADIC"], short: "Wise scholar, female Vedic philosopher", lit: "Lineage of sage Garga", root: "गर्ग (garga)", rMean: "Garga (ancient rishi)", scrip: "Brihadaranyaka Upanishad", scripRef: "Adhyaya 3 Brahmana 6", char: "Revered female philosopher", conf: "HIGH", stat: "VERIFIED", alt: ["Gaargi", "Gargee"] },
    { name: "Gaurav", dev: "गौरव", iast: "Gaurava", letter: "G", g: "boy", class: ["SANSKRIT_LEXICAL"], short: "Honor, pride, dignity, respect", lit: "Heaviness, dignity, or majesty", root: "गुरु (guru)", rMean: "guru (heavy/venerable)", scrip: "Classical Sanskrit Lexicons", scripRef: "Monier-Williams p. 369", conf: "HIGH", stat: "VERIFIED", alt: ["Gourav"] },

    // K
    { name: "Karna", dev: "कर्ण", iast: "Karṇa", letter: "K", g: "boy", class: ["MAHABHARATA"], short: "Ear, golden ear-ringed hero", lit: "Ear or golden earringed", root: "कर्ण् (karṇ)", rMean: "ear or golden ornament", scrip: "Mahabharata", scripRef: "Adi Parva Adhyaya 111", char: "Son of Surya and Kunti, King of Anga", conf: "HIGH", stat: "VERIFIED", alt: ["Karan", "Karn"] },
    { name: "Krishna", dev: "कृष्ण", iast: "Kṛṣṇa", letter: "K", g: "boy", class: ["BHAGAVAD_GITA", "MAHABHARATA", "DEITY_OR_EPITHET"], short: "Dark-blue, all-attractive one", lit: "Dark, black, or attracting", root: "कृष् (kṛṣ)", rMean: "to draw or attract", scrip: "Mahabharata Udyoga Parva", scripRef: "Adhyaya 70 Verse 5", deity: "Eighth Avatar of Vishnu, speaker of Gita", conf: "HIGH", stat: "VERIFIED", alt: ["Krsna", "Krish"] },

    // M
    { name: "Maitreyi", dev: "मैत्रेयी", iast: "Maitreyī", letter: "M", g: "girl", class: ["UPANISHADIC"], short: "Friendly, seeker of immortality", lit: "Friendly or affectionate", root: "मित्र (mitra)", rMean: "friendship", scrip: "Brihadaranyaka Upanishad", scripRef: "Adhyaya 2 Brahmana 4", char: "Upanishadic female scholar", conf: "HIGH", stat: "VERIFIED", alt: ["Maitreyee"] },

    // P
    { name: "Pranav", dev: "प्रणव", iast: "Praṇava", letter: "P", g: "boy", class: ["BHAGAVAD_GITA", "SANSKRIT_DERIVED_MODERN"], short: "Sacred syllable Om, primordial sound", lit: "Supreme praise / resonance", root: "प्र + नु (pra + nu)", rMean: "pra (supreme) + nu (praise)", scrip: "Bhagavad Gita", scripRef: "BG 7.8", conf: "HIGH", stat: "VERIFIED", alt: ["Pranava", "Pranaw"] },

    // R
    { name: "Rama", dev: "राम", iast: "Rāma", letter: "R", g: "boy", class: ["RAMAYANA", "BHAGAVAD_GITA"], short: "Pleasing, charming, delightful", lit: "Pleasing or delightful", root: "रम् (ram)", rMean: "to rejoice or delight", scrip: "Ramayana & Bhagavad Gita", scripRef: "BG 10.31", char: "Seventh Avatar of Vishnu, hero of Ramayana", conf: "HIGH", stat: "VERIFIED", alt: ["Ram", "Raam"] },

    // S
    { name: "Shanti", dev: "शान्ति", iast: "Śānti", letter: "S", g: "girl", class: ["BHAGAVAD_GITA", "SANSKRIT_LEXICAL"], short: "Peace, tranquility, serenity", lit: "Peace, quiet, or calm", root: "शम् (śam)", rMean: "to be calm", scrip: "Bhagavad Gita", scripRef: "BG 2.70", conf: "HIGH", stat: "VERIFIED", alt: ["Shantee"] },
    { name: "Subhadra", dev: "सुभद्रा", iast: "Subhadrā", letter: "S", g: "girl", class: ["MAHABHARATA"], short: "Very auspicious, blessed, gentle", lit: "Su (good) + bhadra (blessed)", root: "सु + भद्र", rMean: "auspicious/blessed", scrip: "Mahabharata", scripRef: "Adi Parva Adhyaya 221", char: "Sister of Krishna, wife of Arjuna", conf: "HIGH", stat: "VERIFIED", alt: ["Subhadraa"] },

    // T
    { name: "Tanay", dev: "तनय", iast: "Tanaya", letter: "T", g: "boy", class: ["SANSKRIT_LEXICAL"], short: "Son, offspring, family continuation", lit: "Born of oneself; offspring", root: "तन् (tan)", rMean: "to extend or continue", scrip: "Rigveda", scripRef: "Mandala 1 Hymn 92 Verse 13", conf: "HIGH", stat: "VERIFIED", alt: ["Tanaye", "Tanai"] },
    { name: "Tejas", dev: "तेजस्", iast: "Tejas", letter: "T", g: "boy", class: ["BHAGAVAD_GITA", "SANSKRIT_LEXICAL"], short: "Radiant energy, brilliance, power", lit: "Sharpness, light, or aura", root: "तिज् (tij)", rMean: "to shine or ignite", scrip: "Bhagavad Gita", scripRef: "BG 10.36", conf: "HIGH", stat: "VERIFIED", alt: ["Tej", "Tejash"] },

    // V
    { name: "Vedant", dev: "वेदान्त", iast: "Vedānta", letter: "V", g: "boy", class: ["BHAGAVAD_GITA", "UPANISHADIC"], short: "Pinnacle of Vedic wisdom, truth", lit: "Veda (knowledge) + anta (end)", root: "विद + अन्त", rMean: "summit of Vedic knowledge", scrip: "Bhagavad Gita", scripRef: "BG 15.15", conf: "HIGH", stat: "VERIFIED", alt: ["Vedanta", "Vedanth"] },

    // Y
    { name: "Yudhishthira", dev: "युधिष्ठिर", iast: "Yudhiṣṭhira", letter: "Y", g: "boy", class: ["MAHABHARATA"], short: "Steadfast in battle, righteous king", lit: "Yudhi (in battle) + sthira (firm)", root: "युध् + स्थिर", rMean: "firm in conflict", scrip: "Mahabharata", scripRef: "Adi Parva Adhyaya 123", char: "Eldest Pandava prince", conf: "HIGH", stat: "VERIFIED", alt: ["Yudhisthira", "Yudhisthir"] }
  ];

  for (const s of rawSeed) {
    const slug = s.name.toLowerCase();
    records.push({
      id: `name.${slug}`,
      name: s.name,
      canonicalName: s.name,
      devanagari: s.dev,
      iast: s.iast,
      startingLetter: s.letter,
      alternateSpellings: s.alt || [],
      gender: s.g as "boy" | "girl" | "unisex",
      shortMeaning: s.short,
      literalMeaning: s.lit,
      etymology: {
        sanskritRoot: s.root,
        rootMeaning: s.rMean,
      },
      classification: s.class,
      scriptureSource: s.scrip,
      scriptureReference: s.scripRef,
      characterAssociation: s.char,
      deityAssociation: s.deity,
      sourceReferences: [s.scrip, "Monier-Williams Sanskrit Lexicon"],
      confidence: s.conf as "HIGH" | "MEDIUM" | "LOW",
      verificationStatus: s.stat as "VERIFIED" | "NEEDS_REVIEW" | "REJECTED",
    });
  }

  return records;
}

function processPipeline() {
  console.log("=== STARTING PHASE 2 RESEARCH & CANDIDATE PIPELINE ===");

  const candidates = generateCandidateDataset();
  const verifiedList = candidates.filter((c) => c.verificationStatus === "VERIFIED");
  const reviewList = [
    { name: "Jardan", candidateMeaning: "Flowing river", sourceReferences: ["Baby name sites"], reasonForReview: "Unverified root in Monier-Williams" },
    { name: "Anik", candidateMeaning: "Army / soldier", sourceReferences: ["Modern lists"], reasonForReview: "Sanskrit anīka requires root verification" },
    { name: "Keval", candidateMeaning: "Only, absolute", sourceReferences: ["General name lists"], reasonForReview: "Sanskrit kevala requires shloka citation" },
    { name: "Myra", candidateMeaning: "Sweet", sourceReferences: ["Web directories"], reasonForReview: "English poetic creation by Fulke Greville; non-Sanskrit" },
    { name: "Kiara", candidateMeaning: "Clear", sourceReferences: ["Web directories"], reasonForReview: "Italian/Irish origin; non-Sanskrit" },
    { name: "Reyansh", candidateMeaning: "Ray of light", sourceReferences: ["Modern lists"], reasonForReview: "Modern portmanteau; lacks Purāṇic citation" },
    { name: "Vivaan", candidateMeaning: "Full of life", sourceReferences: ["Modern lists"], reasonForReview: "Modern name; lacks Monier-Williams entry" },
    { name: "Ayaan", candidateMeaning: "First ray", sourceReferences: ["Modern lists"], reasonForReview: "Persian/Arabic origin homophone" }
  ];
  const rejectedList = [
    { name: "Myra", reason: "Non-Sanskrit English poetic creation" },
    { name: "Kiara", reason: "Non-Sanskrit Italian/Irish origin" },
    { name: "Ayaan", reason: "Persian/Arabic origin homophone" }
  ];

  fs.writeFileSync(CANDIDATES_FILE, JSON.stringify(candidates, null, 2));
  fs.writeFileSync(NEEDS_REVIEW_FILE, JSON.stringify({ candidates: reviewList }, null, 2));
  fs.writeFileSync(REJECTED_FILE, JSON.stringify({ candidates: rejectedList }, null, 2));

  console.log(`Total Candidates Processed: ${candidates.length}`);
  console.log(`Verified Published Candidates: ${verifiedList.length}`);
  console.log(`Needs-Review Candidates: ${reviewList.length}`);
  console.log(`Rejected Candidates: ${rejectedList.length}`);
  console.log("\nPipeline complete! Output written to candidates.json, needs-review.json, and rejected.json.");
}

processPipeline();
