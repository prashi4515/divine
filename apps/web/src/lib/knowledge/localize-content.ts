import type { ReadingLanguageCode } from "@/lib/reading/languages";
import { localizeEntityTitle } from "@/lib/reading/shloka-script";

export type ContentLocale = ReadingLanguageCode;

export interface LocalizedCustomSection {
  id: string;
  title: string;
  body: string | string[];
}

export interface LocalizedEntityContent {
  name?: string;
  summary?: string;
  description?: string;
  overview?: string;
  powers?: string[];
  notableUses?: string[];
  counters?: string[];
  originNotes?: string[];
  sections?: LocalizedCustomSection[];
}

export type EntityWithTranslations = {
  id?: string;
  name?: string;
  summary?: string;
  description?: string;
  translations?: Partial<Record<ContentLocale, LocalizedEntityContent>>;
};

export const KNOWLEDGE_SECTION_LABELS: Record<string, Record<string, string>> = {
  description: {
    en: "Description",
    sa: "विवरणम्",
    hi: "विवरण",
    te: "వివరాలు",
    kn: "ವಿವರಣೆ",
    ta: "விளக்கம்",
    ml: "വിവരണം",
    or: "ବିବରଣୀ",
  },
  overview: {
    en: "Overview",
    sa: "अवलोकनम्",
    hi: "अवलोकन",
    te: "అవలోకనం",
    kn: "ಅವಲೋಕನ",
    ta: "மேலோட்டப்பార్వై",
    ml: "അവലോകനം",
    or: "ସମୀକ୍ଷା",
  },
  owners: {
    en: "Owners",
    sa: "स्वामिनः",
    hi: "स्वामी",
    te: "యజమానులు / ధరించినవారు",
    kn: "ಮಾಲೀಕరు",
    ta: "உரிமையாளர்கள்",
    ml: "ഉടമകൾ",
    or: "ମାଲିକମାନେ",
  },
  origin: {
    en: "Origin",
    sa: "उत्पत्तिः",
    hi: "उत्पत्ति",
    te: "ఉత్పత్తి / మూలం",
    kn: "ಮೂಲ",
    ta: "தோற்றம்",
    ml: "ഉത്ഭവം",
    or: "ଉତ୍ପତ୍ତି",
  },
  powers: {
    en: "Powers",
    sa: "शक्तयः",
    hi: "शक्तियाँ",
    te: "శక్తులు & గుణాలు",
    kn: "ಶಕ್ತಿಗಳು",
    ta: "சக்திகள்",
    ml: "ശక్తిകൾ",
    or: "ଶକ୍ତିଗୁଡ଼ିକ",
  },
  scripturalReferences: {
    en: "Scriptural references",
    sa: "शास्त्रीयोल्लेखाः",
    hi: "शास्त्रीय संदर्भ",
    te: "శాస్త్రీయ ఆధారాలు / మూలాలు",
    kn: "ಶಾಸ್ತ್ರೀಯ ಉಲ್ಲೇಖಗಳು",
    ta: "சாஸ்திரக் குறிப்புகள்",
    ml: "ശാസ്ത്രീയ പരാമർശങ്ങൾ",
    or: "ଶାସ୍ତ୍ରୀୟ ପ୍ରସଙ୍ଗ",
  },
  notableUses: {
    en: "Notable uses",
    sa: "प्रमुखाः उपयोगाः",
    hi: "प्रमुख उपयोग",
    te: "ప్రధాన ఉపయోగాలు",
    kn: "ಪ್ರಮುಖ ಬಳಕೆಗಳು",
    ta: "முக்கிய பயன்பாடுகள்",
    ml: "ప్రధాన ഉപയോഗങ്ങൾ",
    or: "ପ୍ରମୁଖ ବ୍ୟବହାର",
  },
  counters: {
    en: "Counters",
    sa: "प्रतिरोधाः",
    hi: "प्रतिरोध",
    te: "ప్రతిఘటన / నివారణలు",
    kn: "ప్రతిరోధಗಳು",
    ta: "எதிர் நடவடிக்கைகள்",
    ml: "പ്രതിരോധങ്ങൾ",
    or: "ପ୍ରତିରୋଧ",
  },
  battles: {
    en: "Related battles",
    sa: "सम्बद्धाः सङ्ग्रामाः",
    hi: "संबंधित युद्ध",
    te: "సంబంధిత యుద్ధాలు",
    kn: "ಸಂಬಂಧಿತ ಯುದ್ಧಗಳು",
    ta: "தொடர்புடைய போர்கள்",
    ml: "ബന്ധപ്പെട്ട യുദ്ധങ്ങൾ",
    or: "ସମ୍ପର୍କିତ ଯୁଦ୍ଧ",
  },
  relatedCharacters: {
    en: "Related characters",
    sa: "सम्बद्धानि पात्राणि",
    hi: "संबंधित पात्र",
    te: "సంబంధిత పాత్రలు",
    kn: "ಸಂಬಂಧಿತ ಪಾತ್ರಗಳು",
    ta: "தொடர்புடைய கதாபாத்திரங்கள்",
    ml: "ബന്ധപ്പെട്ട കഥാപാത്രങ്ങൾ",
    or: "ସମ୍ପର୍କିତ ପାତ୍ର",
  },
  relatedEvents: {
    en: "Related events",
    sa: "सम्बद्धाः घटनाः",
    hi: "संबंधित घटनाएँ",
    te: "సంబంధిత సంఘటనలు",
    kn: "ಸಂಬಂಧಿತ ಘಟನೆಗಳು",
    ta: "தொடர்புடைய நிகழ்வுகள்",
    ml: "ബന്ധപ്പെട്ട സംഭവങ്ങൾ",
    or: "ସମ୍ପର୍କିତ ଘଟଣାବଳୀ",
  },
  knowledgeGraph: {
    en: "Knowledge graph",
    sa: "ज्ञानचित्रम्",
    hi: "ज्ञान ग्राफ",
    te: "జ్ఞాన గ్రాఫ్ (Knowledge Graph)",
    kn: "ಜ್ಞಾನ ನಕ್ಷೆ",
    ta: "அறிவு வரைபடம்",
    ml: "ജ്ഞാന ഗ്രാഫ്",
    or: "ଜ୍ଞାନ ଗ୍ରାଫ୍",
  },
  relatedVerses: {
    en: "Related verses",
    sa: "सम्बद्धाः श्लोकाः",
    hi: "संबंधित श्लोक",
    te: "సంబంధిత శ్లోకాలు",
    kn: "ಸಂಬಂಧಿತ ಶ್ಲೋಕಗಳು",
    ta: "தொடர்புடைய ஸ்லோகங்கள்",
    ml: "ബന്ധപ്പെട്ട ശ്ലോകങ്ങൾ",
    or: "ସମ୍ପର୍କିତ ଶ୍ଲୋକ",
  },
};

export function getKnowledgeSectionLabel(
  key: keyof typeof KNOWLEDGE_SECTION_LABELS,
  locale: string,
): string {
  const lang = locale || "en";
  return KNOWLEDGE_SECTION_LABELS[key]?.[lang] ?? KNOWLEDGE_SECTION_LABELS[key]?.en ?? String(key);
}

/**
 * Built-in translation registry for entity knowledge content across supported locales.
 * Supports en, sa, hi, te, kn, ta, ml, or.
 */
const KNOWLEDGE_TRANSLATION_REGISTRY: Record<
  string,
  Partial<Record<ContentLocale, LocalizedEntityContent>>
> = {
  "weapon.panchajanya": {
    te: {
      name: "పాంచజన్యం (Pāñcajanya)",
      summary: "శ్రీకృష్ణుడి పవిత్ర శంఖం (పాంచజన్య శంఖము). ధర్మజయం మరియు దివ్యధ్వనికి ప్రతీక.",
      description:
        "పాంచజన్యం శ్రీకృష్ణుడి (హృషీకేశుడి) దివ్య శంఖం. భగవద్గీత ప్రథమాధ్యాయంలో (1.15) కురుక్షేత్ర యుద్ధ ప్రారంభంలో శ్రీకృష్ణుడు ఈ శంఖాన్ని పూరించాడు.",
      sections: [
        {
          id: "what-is-panchajanya",
          title: "పాంచజన్యం అంటే ఏమిటి?",
          body: "పాంచజన్యం శ్రీకృష్ణుడి పవిత్రమైన శంఖం. ప్రాచీన కావ్య సాంప్రదాయంలో మరియు వేద వాఙ్మయంలో శంఖ ధ్వని దివ్య నాదానికి (నాదబ్రహ్మం), అధర్మ వినాశనానికి మరియు ధర్మ స్థాపనకు సంకేతం. భగవద్గీత మరియు మహాభారతంలో పాంచజన్యం అత్యంత పవిత్రమైన దివ్య వస్తువుగా పరిగణించబడుతుంది.",
        },
        {
          id: "panchajanya-gita-1-15",
          title: "భగవద్గీత 1.15లో పాంచజన్యం",
          body: [
            "భగవద్గీత మొదటి అధ్యాయం 15వ శ్లోకంలో పాంచజన్య శంఖ ప్రస్తావన వస్తుంది. తెల్లని గుర్రాలు పూన్చిన దివ్య రథంపై నిలబడి శ్రీకృష్ణుడు మరియు అర్జునుడు తమ శంఖాలను పూరించారు:",
            "“పాంచజన్యం హృషీకేశో దేవదత్తం ధనంజయః | పౌండ్రం దధ్మౌ మహాశంఖం భీమకర్మా వృకోదరః ||”",
            "శ్రీకృష్ణుడి పాంచజన్య శంఖ ధ్వని పాండవ వీరుల శంఖారావంతో కలిసి ఆకాశాన్ని, భూమిని నింపి ధృతరాష్ట్రుని కుమారుల హృదయాలను కలచివేసింది.",
          ],
        },
        {
          id: "meaning-of-panchajanya",
          title: "పాంచజన్యం యొక్క అర్థం",
          body: "పాంచజన్యం (ప్రాచీన సంస్కృతం: पाञ्चजन्य) అనే నామానికి రెండు ప్రధాన అర్థాలు ఉన్నాయి. మొదటిది, ప్రభాస క్షేత్రంలో శంఖరూపంలో నివసించిన 'పంచజనుడు' అనే అసురుడి నుండి ఉద్భవించినది. రెండవది, పంచజనులు (దేవతలు, పితృదేవతలు, గంధర్వులు, నాగులు, మానవులు) అనే ఐదు జీవరాశుల లోకాలలో ప్రతిధ్వనించే దివ్య ధ్వని.",
        },
        {
          id: "origin-story",
          title: "పాంచజన్య శంఖ ఉద్భవ వృత్తాంతం",
          body: "శ్రీమద్భాగవత పురాణం (దశమ స్కంధం) ప్రకారం, కృష్ణ బలరాములు అవంతి నగరంలో సాందీపని మహర్షి ఆశ్రమంలో విద్యాభ్యాసం పూర్తి చేసి గురుదక్షిణ చెల్లించాలనుకున్నారు. సాందీపని మహర్షి ప్రభాస సముద్రంలో మునిగిపోయిన తన కుమారుడిని పునరుజ్జీవింపజేయమని కోరారు. శ్రీకృష్ణుడు సముద్రంలోకి దిగి శంఖరూపియైన పంచజనుడిని సంహరించి గురుపుత్రుడిని రక్షించాడు. ఆ అసురుడి శంఖాన్ని తన దివ్య శంఖంగా స్వీకరించి దానికి 'పాంచజన్యం' అని నామకరణం చేశాడు.",
        },
        {
          id: "significance",
          title: "పాంచజన్యం యొక్క ప్రాముఖ్యత",
          body: "వైష్ణవ సాంప్రదాయంలో, శ్రీమహావిష్ణువు చతుర్భుజాలలో ధరించే నాలుగు ప్రధాన ఆయుధాలలో శంఖం (పాంచజన్యం) ఒకటి. ఇది దివ్య సార్వభౌమత్వానికి, బ్రహ్మనాదానికి మరియు సత్య జాగరణకు ప్రతీక.",
        },
      ],
    },
    hi: {
      name: "पाञ्चजन्य (Pāñcajanya)",
      summary: "भगवान श्रीकृष्ण का पवित्र शंख। धर्म विजय और दिव्य ध्वनि का प्रतीक।",
      description:
        "पाञ्चजन्य भगवान श्रीकृष्ण का दिव्य शंख है। श्रीमद्भगवद्गीता के प्रथम अध्याय (1.15) में कुरुक्षेत्र युद्ध के आरंभ में श्रीकृष्ण ने इस शंख का नाद किया था।",
      sections: [
        {
          id: "what-is-panchajanya",
          title: "पाञ्चजन्य क्या है?",
          body: "पाञ्चजन्य भगवान श्रीकृष्ण का पवित्र शंख है। प्राचीन भारतीय महाकाव्य परंपरा एवं वैदिक साहित्य में शंख ध्वनि नाद-ब्रह्म, धर्म की विजय और अधर्म के भय का प्रतीक है। भगवद्गीता और महाभारत में पाञ्चजन्य को अत्यंत पूज्य माना गया है।",
        },
        {
          id: "panchajanya-gita-1-15",
          title: "भगवद्गीता 1.15 में पाञ्चजन्य",
          body: [
            "भगवद्गीता के अध्याय 1, श्लोक 15 में पाञ्चजन्य का प्रमुख वर्णन आता है। श्वेत घोड़ों से युक्त भव्य रथ पर विराजमान होकर श्रीकृष्ण और अर्जुन ने अपने शंखों का नाद किया:",
            "“पाञ्चजन्यं हृषीकेशो देवदत्तं धनञ्जयः | पौण्ड्रं दध्मौ महाशङ्खं भीमकर्मा वृकोदरः ||”",
            "श्रीकृष्ण के पाञ्चजन्य और पाण्डवों के शंखनाद से गूँजती ध्वनि ने धृतराष्ट्र के पुत्रों का हृदय विदीर्ण कर दिया।",
          ],
        },
        {
          id: "meaning-of-panchajanya",
          title: "पाञ्चजन्य का अर्थ",
          body: "पाञ्चजन्य (पाञ्चजन्य) शब्द का अर्थ दो रूपों में प्रसिद्ध है। पहला, पंचजन नामक शंखासुर से उत्पन्न अथवा उससे संबंधित। दूसरा, पञ्च-जन (देव, पितर, गंधर्व, नाग और मनुष्य) अर्थात् समस्त पाँचों लोकों में गूँजने वाली दिव्य ध्वनि।",
        },
        {
          id: "origin-story",
          title: "पाञ्चजन्य की उत्पत्ति और कथा",
          body: "श्रीमद्भागवत पुराण के अनुसार, श्रीकृष्ण और बलराम ने अवंती में गुरु सान्दीपनि के आश्रम में शिक्षा पूर्ण करने के पश्चात् गुरुदक्षिणा अर्पित की। सान्दीपनि मुनि ने प्रभास तीर्थ के समुद्र में डूबे अपने पुत्र को लौटाने का आग्रह किया। श्रीकृष्ण ने समुद्र में प्रवेश कर शंख रूपी असुर पंचजन का वध किया, गुरुपुत्र को पुनर्जीवित किया और असुर के शंख को अपना व्यक्तिगत शंख 'पाञ्चजन्य' बनाकर धारण किया।",
        },
        {
          id: "significance",
          title: "पाञ्चजन्य का महत्त्व",
          body: "सनातन परंपरा में, भगवान विष्णु की चतुर्भुज आकृति के चार प्रमुख आयुधों (शंख, चक्र, गदा, पद्म) में पाञ्चजन्य प्रथम स्थान रखता है। यह दिव्य संप्रभुता, ब्रह्मांडीय व्यवस्था और जागृति का प्रतीक है।",
        },
      ],
    },
    sa: {
      name: "पाञ्चजन्यम् (Pāñcajanya)",
      summary: "भगवान् श्रीकृष्णस्य दिव्यः शङ्खः।",
      description:
        "पाञ्चजन्यम् इति श्रीकृष्णस्य पावनः शङ्खः। श्रीमद्भगवद्गीतायाः प्रथमोध्याये (१.१५) कुरुक्षेत्रयुद्धस्य प्रारम्भे श्रीकृष्णः एनं शङ्खं दध्मौ।",
      sections: [
        {
          id: "what-is-panchajanya",
          title: "किम् इदम् पाञ्चजन्यम्?",
          body: "पाञ्चजन्यम् इति भगवान् श्रीकृष्णस्य परमपावनः शङ्खः। सनातनसंस्कृतौ शङ्खध्वनिः नादब्रह्मणः, धर्मविजयस्य च प्रतीकः अस्ति।",
        },
        {
          id: "panchajanya-gita-1-15",
          title: "भगवद्गीतायाम् १.१५ पाञ्चजन्यम्",
          body: [
            "भगवद्गीतायाः प्रथमोध्याये १५ तमे श्लोके पाञ्चजन्यस्य वर्णनम् अस्ति:",
            "“पाञ्चजन्यं हृषीकेशो देवदत्तं धनञ्जयः | पौण्ड्रं दध्मौ महाशङ्खं भीमकर्मा वृकोदरः ||”",
          ],
        },
      ],
    },
  },
};

/**
 * Resolves localized entity content fields with clean fallback to English ('en').
 */
export function getLocalizedEntityContent<T extends EntityWithTranslations>(
  entity: T,
  locale: string,
): {
  name: string;
  summary: string;
  description: string;
  powers?: string[];
  notableUses?: string[];
  counters?: string[];
  sections?: LocalizedCustomSection[];
  isLocalized: boolean;
} {
  const lang = (locale || "en") as ContentLocale;

  // Check inline entity.translations first, then global translation registry
  const translation =
    entity.translations?.[lang] ??
    (entity.id ? KNOWLEDGE_TRANSLATION_REGISTRY[entity.id]?.[lang] : undefined);

  const name =
    translation?.name ??
    (entity.name ? localizeEntityTitle(entity.name, lang) : "");
  const summary = translation?.summary ?? entity.summary ?? "";
  const description = translation?.description ?? entity.description ?? summary;
  const powers = translation?.powers;
  const notableUses = translation?.notableUses;
  const counters = translation?.counters;
  const sections = translation?.sections;

  const isLocalized = Boolean(translation && lang !== "en");

  return {
    name,
    summary,
    description,
    powers,
    notableUses,
    counters,
    sections,
    isLocalized,
  };
}
