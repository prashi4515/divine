import type { ReadingLanguageCode } from "@/lib/reading/languages";

/**
 * Curated “verse of the day” catalog — no API call so the home page stays
 * instant. Selection is deterministic by calendar day in Asia/Kolkata.
 */
export type DailyVerse = {
  publicId: string;
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  /** Short gloss per UI language; falls back to English. */
  meanings: Partial<Record<ReadingLanguageCode, string>>;
};

const DAILY_VERSES: readonly DailyVerse[] = [
  {
    publicId: "bg.2.47",
    chapter: 2,
    verse: 47,
    sanskrit:
      "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    transliteration:
      "karmaṇy-evādhikāras te mā phaleṣu kadācana\nmā karma-phala-hetur bhūr mā te saṅgo ’stv akarmaṇi",
    meanings: {
      en: "You have a right to your actions alone, never to their fruits.",
      hi: "तुम्हारा अधिकार केवल कर्म में है, उसके फलों में कभी नहीं।",
      te: "నీకు కర్మలో మాత్రమే అధికారం, వాటి ఫలాలపై ఎన్నడూ కాదు.",
      kn: "ನಿನಗೆ ಕರ್ಮದಲ್ಲಿ ಮಾತ್ರ ಅಧಿಕಾರ, ಅದರ ಫಲಗಳಲ್ಲಿ ಎಂದಿಗೂ ಇಲ್ಲ.",
      ta: "செயலில் மட்டுமே உனக்கு உரிமை, அதன் பலன்களில் ஒருபோதும் இல்லை.",
      ml: "പ്രവൃത്തിയിൽ മാത്രമേ നിനക്ക് അവകാശമുള്ളൂ, അതിന്റെ ഫലങ്ങളിൽ ഒരിക്കലുമില്ല.",
      or: "ତୁମର ଅଧିକାର କେବଳ କର୍ମରେ, ଏହାର ଫଳରେ କେବେ ନୁହେଁ।",
      sa: "कर्मणि एव अधिकारः ते, मा फलेषु कदाचन।",
    },
  },
  {
    publicId: "bg.2.14",
    chapter: 2,
    verse: 14,
    sanskrit:
      "मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः।\nआगमापायिनोऽनित्यास्तांस्तितिक्षस्व भारत॥",
    transliteration:
      "mātrā-sparśās tu kaunteya śītoṣṇa-sukha-duḥkha-dāḥ\nāgamāpāyino ’nityās tāṁs titikṣasva bhārata",
    meanings: {
      en: "Heat and cold, pleasure and pain come and go — endure them, O Arjuna.",
      hi: "शीत-उष्ण और सुख-दुःख आने-जाने वाले हैं — हे अर्जुन, उन्हें सहो।",
      te: "చలి-వేడి, సుఖ-దుఃఖాలు వచ్చి పోతాయి — ఓ అర్జునా, వాటిని సహించు.",
    },
  },
  {
    publicId: "bg.2.20",
    chapter: 2,
    verse: 20,
    sanskrit:
      "न जायते म्रियते वा कदाचिन्\nनायं भूत्वा भविता वा न भूयः।\nअजो नित्यः शाश्वतोऽयं पुराणो\nन हन्यते हन्यमाने शरीरे॥",
    transliteration:
      "na jāyate mriyate vā kadācin\nnāyaṁ bhūtvā bhavitā vā na bhūyaḥ\najo nityaḥ śāśvato ’yaṁ purāṇo\nna hanyate hanyamāne śarīre",
    meanings: {
      en: "The Self is never born and never dies; it is eternal, even when the body is slain.",
      hi: "आत्मा कभी जन्म नहीं लेती, मरती नहीं — शरीर नष्ट होने पर भी वह नित्य है।",
      te: "ఆత్మ ఎప్పుడూ పుట్టదు, చావదు — శరీరం నశించినా అది నిత్యం.",
    },
  },
  {
    publicId: "bg.2.48",
    chapter: 2,
    verse: 48,
    sanskrit:
      "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।\nसिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥",
    transliteration:
      "yoga-sthaḥ kuru karmāṇi saṅgaṁ tyaktvā dhanañjaya\nsiddhy-asiddhyoḥ samo bhūtvā samatvaṁ yoga ucyate",
    meanings: {
      en: "Perform action established in yoga, abandoning attachment — evenness of mind is yoga.",
      hi: "आसक्ति छोड़कर योग में स्थित होकर कर्म करो — समत्व ही योग है।",
      te: "ఆసక్తిని విడిచి యోగంలో నిలిచి కర్మ చేయి — సమత్వమే యోగం.",
    },
  },
  {
    publicId: "bg.2.50",
    chapter: 2,
    verse: 50,
    sanskrit:
      "बुद्धियुक्तो जहातीह उभे सुकृतदुष्कृते।\nतस्माद्योगाय युज्यस्व योगः कर्मसु कौशलम्॥",
    transliteration:
      "buddhi-yukto jahātīha ubhe sukṛta-duṣkṛte\ntasmād yogāya yujyasva yogaḥ karmasu kauśalam",
    meanings: {
      en: "Yoga is skill in action — the wise leave both good and bad karma behind.",
      hi: "योग कर्म में कुशलता है — बुद्धिमान दोनों शुभ-अशुभ कर्म छोड़ देते हैं।",
      te: "యోగం కర్మలో నైపుణ్యం — జ్ఞాని మంచి-చెడు రెండింటినీ విడుస్తాడు.",
    },
  },
  {
    publicId: "bg.2.56",
    chapter: 2,
    verse: 56,
    sanskrit:
      "दुःखेष्वनुद्विग्नमनाः सुखेषु विगतस्पृहः।\nवीतरागभयक्रोधः स्थितधीर्मुनिरुच्यते॥",
    transliteration:
      "duḥkheṣv anudvigna-manāḥ sukheṣu vigata-spṛhaḥ\nvīta-rāga-bhaya-krodhaḥ sthita-dhīr munir ucyate",
    meanings: {
      en: "Unshaken in sorrow, free of craving in joy — that sage is steady in wisdom.",
      hi: "दुःख में अविचल, सुख में निःस्पृह — वही स्थिरबुद्धि मुनि है।",
      te: "దుఃఖంలో కలవరపడని, సుఖంలో ఆశలేని — అతడే స్థిరబుద్ధి ముని.",
    },
  },
  {
    publicId: "bg.2.62",
    chapter: 2,
    verse: 62,
    sanskrit:
      "ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते।\nसङ्गात्सञ्जायते कामः कामात्क्रोधोऽभिजायते॥",
    transliteration:
      "dhyāyato viṣayān puṁsaḥ saṅgas teṣūpajāyate\nsaṅgāt sañjāyate kāmaḥ kāmāt krodho ’bhijāyate",
    meanings: {
      en: "Dwelling on sense objects breeds attachment; from attachment, desire; from desire, anger.",
      hi: "विषयों का चिन्तन आसक्ति जन्माता है, आसक्ति से काम, काम से क्रोध।",
      te: "విషయాలను తలచుకుంటే ఆసక్తి పుడుతుంది; ఆసక్తి నుండి కామం, కామం నుండి క్రోధం.",
    },
  },
  {
    publicId: "bg.2.70",
    chapter: 2,
    verse: 70,
    sanskrit:
      "आपूर्यमाणमचलप्रतिष्ठं\nसमुद्रमापः प्रविशन्ति यद्वत्।\nतद्वत्कामा यं प्रविशन्ति सर्वे\nस शान्तिमाप्नोति न कामकामी॥",
    transliteration:
      "āpūryamāṇam acala-pratiṣṭhaṁ\nsamudram āpaḥ praviśanti yadvat\ntadvat kāmā yaṁ praviśanti sarve\nsa śāntim āpnoti na kāma-kāmī",
    meanings: {
      en: "As rivers enter the full ocean unmoved, so desires enter one who finds peace.",
      hi: "जैसे नदियाँ पूर्ण समुद्र में समा जाती हैं — वैसे ही कामनाएँ शान्त पुरुष में।",
      te: "నదులు నిండిన సముద్రంలోకి ప్రవేశించినట్టు — కోరికలు శాంతునిలోకి ప్రవేశిస్తాయి.",
    },
  },
  {
    publicId: "bg.3.19",
    chapter: 3,
    verse: 19,
    sanskrit:
      "तस्मादसक्तः सततं कार्यं कर्म समाचर।\nअसक्तो ह्याचरन्कर्म परमाप्नोति पूरुषः॥",
    transliteration:
      "tasmād asaktaḥ satataṁ kāryaṁ karma samācara\nasakto hy ācaran karma param āpnoti pūruṣaḥ",
    meanings: {
      en: "Therefore always perform your duty without attachment — thus one attains the Supreme.",
      hi: "इसलिए निरन्तर निष्काम होकर कर्तव्य कर्म करो — इससे परम प्राप्त होता है।",
      te: "కాబట్టి ఎల్లప్పుడూ అనాసక్తంగా కర్తవ్యం చేయి — అందువల్ల పరమును పొందుతావు.",
    },
  },
  {
    publicId: "bg.4.7",
    chapter: 4,
    verse: 7,
    sanskrit:
      "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥",
    transliteration:
      "yadā yadā hi dharmasya glānir bhavati bhārata\nabhyutthānam adharmasya tadātmānaṁ sṛjāmy aham",
    meanings: {
      en: "Whenever dharma declines and adharma rises, I manifest Myself.",
      hi: "जब-जब धर्म की हानि और अधर्म की वृद्धि होती है, तब मैं प्रकट होता हूँ।",
      te: "ధర్మం క్షీణించి అధర్మం పెరిగినప్పుడల్లా నేను అవతరిస్తాను.",
    },
  },
  {
    publicId: "bg.4.8",
    chapter: 4,
    verse: 8,
    sanskrit:
      "परित्राणाय साधूनां विनाशाय च दुष्कृताम्।\nधर्मसंस्थापनार्थाय सम्भवामि युगे युगे॥",
    transliteration:
      "paritrāṇāya sādhūnāṁ vināśāya ca duṣkṛtām\ndharma-saṁsthāpanārthāya sambhavāmi yuge yuge",
    meanings: {
      en: "To protect the good, destroy the wicked, and establish dharma — I appear age after age.",
      hi: "सज्जनों की रक्षा, दुष्टों का नाश और धर्म की स्थापना के लिए मैं युग-युग में आता हूँ।",
      te: "సజ్జనుల రక్షణ, దుష్టుల నాశనం, ధర్మ స్థాపన కోసం యుగయుగాల్లో నేను అవతరిస్తాను.",
    },
  },
  {
    publicId: "bg.4.11",
    chapter: 4,
    verse: 11,
    sanskrit:
      "ये यथा मां प्रपद्यन्ते तांस्तथैव भजाम्यहम्।\nमम वर्त्मानुवर्तन्ते मनुष्याः पार्थ सर्वशः॥",
    transliteration:
      "ye yathā māṁ prapadyante tāṁs tathaiva bhajāmy aham\nmama vartmānuvartante manuṣyāḥ pārtha sarvaśaḥ",
    meanings: {
      en: "As people approach Me, so do I receive them — all paths lead to Me.",
      hi: "जो जैसे मेरी शरण लेते हैं, मैं वैसे ही उन्हें स्वीकार करता हूँ।",
      te: "నన్ను ఎలా శరణు వేడుకుంటారో, అలాగే నేను వారిని స్వీకరిస్తాను.",
    },
  },
  {
    publicId: "bg.5.10",
    chapter: 5,
    verse: 10,
    sanskrit:
      "ब्रह्मण्याधाय कर्माणि सङ्गं त्यक्त्वा करोति यः।\nलिप्यते न स पापेन पद्मपत्रमिवाम्भसा॥",
    transliteration:
      "brahmaṇy ādhāya karmāṇi saṅgaṁ tyaktvā karoti yaḥ\nlipyate na sa pāpena padma-patram ivāmbhasā",
    meanings: {
      en: "One who acts offering all to Brahman, free of attachment, is untouched by sin — like a lotus leaf by water.",
      hi: "ब्रह्म में कर्म अर्पित कर निष्काम कर्म करने वाला पाप से नहीं लिप्त होता — कमलपत्र की भाँति।",
      te: "బ్రహ్మంలో కర్మలను అర్పించి అనాసక్తంగా చేసేవాడు పాపంతో అంటుకోడు — పద్మపత్రంలా.",
    },
  },
  {
    publicId: "bg.6.5",
    chapter: 6,
    verse: 5,
    sanskrit:
      "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥",
    transliteration:
      "uddhared ātmanātmānaṁ nātmānam avasādayet\nātmaiva hy ātmano bandhur ātmaiva ripur ātmanaḥ",
    meanings: {
      en: "Lift yourself by yourself — do not degrade yourself; the mind is both friend and enemy.",
      hi: "अपने आप को ऊपर उठाओ, गिराओ मत — आत्मा ही अपना मित्र और शत्रु है।",
      te: "నిన్ను నువ్వే ఎత్తుకో, పడవేసుకోకు — మనసే మిత్రుడు, మనసే శత్రువు.",
    },
  },
  {
    publicId: "bg.6.26",
    chapter: 6,
    verse: 26,
    sanskrit:
      "यतो यतो निश्चरति मनश्चञ्चलमस्थिरम्।\nततस्ततो नियम्यैतदात्मन्येव वशं नयेत्॥",
    transliteration:
      "yato yato niścarati manaś cañcalam asthiram\ntatas tato niyamyaitad ātmany eva vaśaṁ nayet",
    meanings: {
      en: "Wherever the restless mind wanders, bring it back and rest it in the Self.",
      hi: "चंचल मन जहाँ-जहाँ जाता है, वहाँ से खींचकर आत्मा में स्थिर करो।",
      te: "చంచల మనసు ఎక్కడికి పోతే అక్కడి నుండి లాగి ఆత్మలో నిలపు.",
    },
  },
  {
    publicId: "bg.7.7",
    chapter: 7,
    verse: 7,
    sanskrit:
      "मत्तः परतरं नान्यत्किञ्चिदस्ति धनञ्जय।\nमयि सर्वमिदं प्रोतं सूत्रे मणिगणा इव॥",
    transliteration:
      "mattaḥ parataraṁ nānyat kiñcid asti dhanañjaya\nmayi sarvam idaṁ protaṁ sūtre maṇi-gaṇā iva",
    meanings: {
      en: "There is nothing higher than Me — all this is strung on Me like pearls on a thread.",
      hi: "मुझसे परे कुछ नहीं — यह सब मुझमें गुँथा है जैसे सूत्र में मणियाँ।",
      te: "నాకంటే పరమైనది ఏదీ లేదు — మణులు దారంలో గుచ్చినట్టు సర్వం నాలోనే.",
    },
  },
  {
    publicId: "bg.9.22",
    chapter: 9,
    verse: 22,
    sanskrit:
      "अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते।\nतेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्॥",
    transliteration:
      "ananyāś cintayanto māṁ ye janāḥ paryupāsate\nteṣāṁ nityābhiyuktānāṁ yoga-kṣemaṁ vahāmy aham",
    meanings: {
      en: "Those who worship Me with undivided mind — I carry what they lack and preserve what they have.",
      hi: "अनन्य भाव से मेरा चिन्तन करने वालों का योगक्षेम मैं स्वयं वहन करता हूँ।",
      te: "అనన్య భక్తితో నన్ను సేవించేవారి యోగక్షేమాన్ని నేనే నిర్వహిస్తాను.",
    },
  },
  {
    publicId: "bg.9.26",
    chapter: 9,
    verse: 26,
    sanskrit:
      "पत्रं पुष्पं फलं तोयं यो मे भक्त्या प्रयच्छति।\nतदहं भक्त्युपहृतमश्नामि प्रयतात्मनः॥",
    transliteration:
      "patraṁ puṣpaṁ phalaṁ toyaṁ yo me bhaktyā prayacchati\ntad ahaṁ bhakty-upahṛtam aśnāmi prayatātmanaḥ",
    meanings: {
      en: "A leaf, a flower, a fruit, or water — offered with devotion, I accept.",
      hi: "पत्र, पुष्प, फल या जल — भक्ति से अर्पित मैं स्वीकार करता हूँ।",
      te: "ఆకు, పువ్వు, ఫలం లేదా నీరు — భక్తితో అర్పిస్తే నేను స్వీకరిస్తాను.",
    },
  },
  {
    publicId: "bg.9.34",
    chapter: 9,
    verse: 34,
    sanskrit:
      "मन्मना भव मद्भक्तो मद्याजी मां नमस्कुरु।\nमामेवैष्यसि युक्त्वैवमात्मानं मत्परायणः॥",
    transliteration:
      "man-manā bhava mad-bhakto mad-yājī māṁ namaskuru\nmām evaiṣyasi yuktvaivam ātmānaṁ mat-parāyaṇaḥ",
    meanings: {
      en: "Fix your mind on Me, be My devotee, worship Me, bow to Me — you will come to Me.",
      hi: "मुझमें मन लगाओ, मेरे भक्त बनो, मेरी पूजा करो, मुझे नमस्कार करो — तुम मुझको ही प्राप्त होगे।",
      te: "నాపై మనసు ఉంచు, నా భక్తుడవు కా, నన్ను ఆరాధించు — నన్నే చేరుతావు.",
    },
  },
  {
    publicId: "bg.10.20",
    chapter: 10,
    verse: 20,
    sanskrit:
      "अहमात्मा गुडाकेश सर्वभूताशयस्थितः।\nअहमादिश्च मध्यं च भूतानामन्त एव च॥",
    transliteration:
      "aham ātmā guḍākeśa sarva-bhūtāśaya-sthitaḥ\naham ādiś ca madhyaṁ ca bhūtānām anta eva ca",
    meanings: {
      en: "I am the Self seated in the heart of all beings — their beginning, middle, and end.",
      hi: "मैं सब भूतों के हृदय में स्थित आत्मा हूँ — आदि, मध्य और अन्त।",
      te: "నేను సర్వభూతాల హృదయంలోని ఆత్మను — ఆది, మధ్య, అంతం.",
    },
  },
  {
    publicId: "bg.12.13",
    chapter: 12,
    verse: 13,
    sanskrit:
      "अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च।\nनिर्ममो निरहङ्कारः समदुःखसुखः क्षमी॥",
    transliteration:
      "adveṣṭā sarva-bhūtānāṁ maitraḥ karuṇa eva ca\nnirmamo nirahaṅkāraḥ sama-duḥkha-sukhaḥ kṣamī",
    meanings: {
      en: "Friendly and compassionate to all, free of ego, equal in joy and sorrow, forgiving.",
      hi: "सबके प्रति द्वेषरहित, मित्र और करुणामय — अहंकाररहित, सम और क्षमाशील।",
      te: "అందరిపట్ల ద్వేషం లేని, మైత్రి-కరుణ గలవాడు — అహంకారం లేని, సమత్వుడు, క్షమాశీలి.",
    },
  },
  {
    publicId: "bg.15.7",
    chapter: 15,
    verse: 7,
    sanskrit:
      "ममैवांशो जीवलोके जीवभूतः सनातनः।\nमनःषष्ठानीन्द्रियाणि प्रकृतिस्थानि कर्षति॥",
    transliteration:
      "mamaivāṁśo jīva-loke jīva-bhūtaḥ sanātanaḥ\nmanaḥ-ṣaṣṭhānīndriyāṇi prakṛti-sthāni karṣati",
    meanings: {
      en: "An eternal portion of Myself becomes the living being in this world.",
      hi: "इस जीव-लोक में मेरा ही सनातन अंश जीव रूप में है।",
      te: "ఈ జీవలోకంలో నా నిత్యాంశమే జీవరూపంలో ఉంది.",
    },
  },
  {
    publicId: "bg.16.21",
    chapter: 16,
    verse: 21,
    sanskrit:
      "त्रिविधं नरकस्येदं द्वारं नाशनमात्मनः।\nकामः क्रोधस्तथा लोभस्तस्मादेतत्त्रयं त्यजेत्॥",
    transliteration:
      "tri-vidhaṁ narakasyedaṁ dvāraṁ nāśanam ātmanaḥ\nkāmaḥ krodhas tathā lobhas tasmād etat trayaṁ tyajet",
    meanings: {
      en: "Desire, anger, and greed — three gates of hell that destroy the Self; abandon them.",
      hi: "काम, क्रोध और लोभ — नरक के तीन द्वार; इन्हें त्याग दो।",
      te: "కామం, క్రోధం, లోభం — నరకానికి మూడు ద్వారాలు; వీటిని విడువు.",
    },
  },
  {
    publicId: "bg.18.65",
    chapter: 18,
    verse: 65,
    sanskrit:
      "मन्मना भव मद्भक्तो मद्याजी मां नमस्कुरु।\nमामेवैष्यसि सत्यं ते प्रतिजाने प्रियोऽसि मे॥",
    transliteration:
      "man-manā bhava mad-bhakto mad-yājī māṁ namaskuru\nmām evaiṣyasi satyaṁ te pratijāne priyo ’si me",
    meanings: {
      en: "Fix your mind on Me, be My devotee — truly I promise, you are dear to Me.",
      hi: "मुझमें मन लगाओ, मेरे भक्त बनो — सत्य प्रतिज्ञा है, तुम मुझे प्रिय हो।",
      te: "నాపై మనసు ఉంచు, నా భక్తుడవు కా — నిజంగా ప్రతిజ్ఞ, నీవు నాకు ప్రియుడవు.",
    },
  },
  {
    publicId: "bg.18.66",
    chapter: 18,
    verse: 66,
    sanskrit:
      "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।\nअहं त्वा सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥",
    transliteration:
      "sarva-dharmān parityajya mām ekaṁ śaraṇaṁ vraja\nahaṁ tvā sarva-pāpebhyo mokṣayiṣyāmi mā śucaḥ",
    meanings: {
      en: "Abandon all duties and take refuge in Me alone — I will free you from all sin; do not grieve.",
      hi: "सब धर्मों को छोड़ मेरी एक शरण लो — मैं सब पापों से मुक्त करूँगा; शोक मत करो।",
      te: "సర్వధర్మాలను విడిచి నా ఏకశరణు పొందు — నిన్ను సర్వపాపాల నుండి విడిపిస్తాను; దుఃఖపడకు.",
    },
  },
];

/** Calendar day key in Asia/Kolkata (YYYY-MM-DD). */
function kolkataDayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Stable day-of-year index (0-based) in Asia/Kolkata. */
function kolkataDayIndex(date: Date): number {
  const key = kolkataDayKey(date);
  const [y, m, d] = key.split("-").map((n) => Number.parseInt(n, 10));
  const utc = Date.UTC(y!, m! - 1, d!);
  const start = Date.UTC(y!, 0, 1);
  return Math.floor((utc - start) / 86_400_000);
}

/**
 * Verse of the day for the given instant (defaults to now).
 * Rotates through the curated catalog once per calendar day (IST).
 */
export function getVerseOfTheDay(date: Date = new Date()): DailyVerse {
  const index = kolkataDayIndex(date) % DAILY_VERSES.length;
  return DAILY_VERSES[index]!;
}

export function dailyVerseMeaning(
  verse: DailyVerse,
  language: string,
): string {
  if (language in verse.meanings) {
    const text = verse.meanings[language as ReadingLanguageCode];
    if (text) return text;
  }
  return verse.meanings.en ?? "";
}
