/**
 * Localized genealogy module card copy (title / eyebrow / summary).
 * Falls back to Knowledge Graph English when a slug/lang is missing.
 */
import type { ReadingLanguageCode } from "@/lib/reading/languages";
import type { GenealogyModule } from "@/lib/genealogy/types";
import { devanagariToReadingScript } from "@/lib/reading/shloka-script";

export type ModuleCopy = {
  title: string;
  eyebrow: string;
  summary: string;
};

const te: Partial<Record<string, ModuleCopy>> = {
  "cosmic-creation": {
    title: "కాస్మిక సృష్టి",
    eyebrow: "మూలం",
    summary: "విష్ణువు, బ్రహ్మ, మరియు మనసుపుత్ర ప్రజనకులు.",
  },
  "trimurti": {
    title: "త్రిమూర్తి",
    eyebrow: "దైవత్వం",
    summary: "బ్రహ్మ, విష్ణువు, శివుడు — సహవాసనులు, సంతానులుతో కలసి.",
  },
  "major-devis": {
    title: "ప్రముఖ దేవీలు",
    eyebrow: "శక్తి",
    summary: "లక్ష్మి, సరస్వతి, పార్వతి, గంగ మరియు సంబంధ రూపాలు.",
  },
  "prajapatis": {
    title: "ప్రజాపతులు",
    eyebrow: "ప్రజనకులు",
    summary: "బ్రహ్మ మనసుపుత్ర పుత్రులు — తరువాతి జాతుల మూలం.",
  },
  "manus": {
    title: "మనువులు",
    eyebrow: "మన్వంతర",
    summary: "వైవస్వత మనువు — ప్రస్తుత మన్వంతరపు మనువు.",
  },
  "saptarishis": {
    title: "సప్తర్షులు",
    eyebrow: "ఫృషులు",
    summary: "బ్రహ్మ మనసుపుత్ర వంశంతో సంబంధించిన ఏడుగురు ఫృషులు.",
  },
  "devas": {
    title: "దేవతలు",
    eyebrow: "ఆదిత్యులు",
    summary: "కశ్యప → అదితి → ఆదిత్యులు (ఇంద్రుడు, వివస్వానుడు మరియు కుటుంబం).",
  },
  "asuras": {
    title: "అసురులు",
    eyebrow: "అసుర వంశాలు",
    summary: "దైత్యులు, దానవులు — ప్రధాన అసుర గృహాలు. పూర్తి వృక్షాల కోసం దైత్యులు లేదా దానవులును తీసుకోండి.",
  },
  "daityas": {
    title: "దైత్యులు",
    eyebrow: "అసుర · దితి పుత్రులు",
    summary: "కశ్యప → దితి → హిరణ్యకశిపుడి వంశం — బలి, బాణుడు వరకు.",
  },
  "danavas": {
    title: "దానవులు",
    eyebrow: "అసుర · దను పుత్రులు",
    summary: "కశ్యప → దను → విప్రచిత్తి మరియు దానవ పుత్రులు.",
  },
  "rakshasas": {
    title: "రాక్షసులు",
    eyebrow: "అసురులు కాదు · లంక వంశం",
    summary: "పులస్త్య → విశ్రవసుడు → రావణుడు, సహోదరులు (దైత్య/దానవ నుండి వేరు).",
  },
  "nagas": {
    title: "నాగులు",
    eyebrow: "సర్ప జాతి",
    summary: "కశ్యప → కద్రు → అనంత, వాసుకి, తక్షక మరియు ప్రధాన నాగులు.",
  },
  "yakshas": {
    title: "యక్షులు",
    eyebrow: "రక్షకులు",
    summary: "కుబేరుడు — యక్షుల అధిపతి; రాక్షసులతో కలపబడలేదు.",
  },
  "gandharvas": {
    title: "గంధర్వులు",
    eyebrow: "దివ్య సంగీతకులు",
    summary: "ఇతిహాస/గీత ఆధారం ఉన్న గంధర్వులు — కల్పిత వంశావళి లేదు.",
  },
  "solar-dynasty": {
    title: "సూర్యవంశం",
    eyebrow: "సూర్యవంశం",
    summary: "వివస్వానుడు → వైవస్వత మనువు → ఇక్ష్వాకుడు → రఘు → దశరథుడు.",
  },
  "lunar-dynasty": {
    title: "చంద్రవంశం",
    eyebrow: "చంద్రవంశం",
    summary: "అత్రి → చంద్రుడు → బుధుడు → పురూరవసుడు → యయాతి → యదు / పురు.",
  },
  "raghu-dynasty": {
    title: "రఘువంశం",
    eyebrow: "రఘువంశం",
    summary: "రఘు → అజ → దశరథుడు → రాముడు, సహోదరులు.",
  },
  "yadu-dynasty": {
    title: "యదువంశం",
    eyebrow: "యాదవులు",
    summary: "యయాతి → యదు → వసుదేవుడు → కృష్ణుడు, బలరాముడు.",
  },
  "kuru-dynasty": {
    title: "కురువంశం",
    eyebrow: "కురువులు",
    summary: "కురు → శంతనుడు → భీష్మ / విచిత్రవీర్యుడు → ధృతరాష్ట్రుడు, పాండువు.",
  },
  "pandavas": {
    title: "పాండవులు",
    eyebrow: "పాండు పుత్రులు",
    summary: "ఇదుగురు సహోదరులు, ద్రౌపది, సుభద్ర, అభిమన్యుడు, కర్ణుడు.",
  },
  "kauravas": {
    title: "కౌరవులు",
    eyebrow: "ధృతరాష్ట్ర పుత్రులు",
    summary: "ధృతరాష్ట్రుడు, గాంధారి, దుర్యోధనుడు, దుశ్శాసనుడు, దుశ్శల.",
  },
  "krishna-family": {
    title: "కృష్ణ కుటుంబం",
    eyebrow: "వృష్ణి గృహం",
    summary: "వసుదేవుడు, దేవకి, నంద–యశోద, బలరాముడు, రుక్మిణి, సుభద్ర.",
  },
  "rama-family": {
    title: "రామ కుటుంబం",
    eyebrow: "అయోధ్య",
    summary: "దశరథ రాణులు, నాలుగురు సహోదరులు, సీత, లవ, కుశ.",
  },
  "major-rishis": {
    title: "ప్రముఖ ఋషులు",
    eyebrow: "మునిలు",
    summary: "వసిష్ఠ, వ్యాస, వాల్మీకి, నారద, పరాశర మరియు కుటుంబం.",
  },
  "major-kings": {
    title: "ప్రముఖ రాజులు",
    eyebrow: "రాజాధిపతులు",
    summary: "బలమైన శాస్త్ర ఆధారం ఉన్న వివిధ వంశాల రాజులు.",
  },
};

const hi: Partial<Record<string, ModuleCopy>> = {
  "cosmic-creation": {
    title: "कॉस्मिक सृष्टि",
    eyebrow: "उत्पत्ति",
    summary: "विष्णु, ब्रह्मा और प्रथम मनोजन्म प्रजनक।",
  },
  "trimurti": {
    title: "त्रिमूर्ति",
    eyebrow: "दिव्यता",
    summary: "ब्रह्मा, विष्णु, शिव — पत्नियों और संतानों सहित।",
  },
  "major-devis": {
    title: "प्रमुख देवियाँ",
    eyebrow: "शक्ति",
    summary: "लक्ष्मी, सरस्वती, पार्वती, गंगा और संबंध रूप।",
  },
  "prajapatis": {
    title: "प्रजापति",
    eyebrow: "प्रजनक",
    summary: "ब्रह्मा के मनोजन्म पुत्र — बाद की जातियों के मूल।",
  },
  "manus": {
    title: "मनु",
    eyebrow: "मन्वन्तर",
    summary: "वैवस्वत मनु — वर्तमान मन्वन्तर के मनु।",
  },
  "saptarishis": {
    title: "सप्तर्षि",
    eyebrow: "ऋषि",
    summary: "ब्रह्मा की मनोजन्म परंपरा से जुड़े सात ऋषि।",
  },
  "devas": {
    title: "देव",
    eyebrow: "आदित्य",
    summary: "कश्यप → अदिति → आदित्य (इन्द्र, विवस्वान और परिवार)।",
  },
  "asuras": {
    title: "असुर",
    eyebrow: "असुर वंश",
    summary: "दैत्य और दानव — प्रमुख असुर कुल। पूर्ण वृक्ष के लिए दैत्य या दानव खोलें।",
  },
  "daityas": {
    title: "दैत्य",
    eyebrow: "असुर · दिति के पुत्र",
    summary: "कश्यप → दिति → हिरण्यकशिपु वंश — बलि और बाण तक।",
  },
  "danavas": {
    title: "दानव",
    eyebrow: "असुर · दनु के पुत्र",
    summary: "कश्यप → दनु → विप्रचित्ति और अन्य दानव पुत्र।",
  },
  "rakshasas": {
    title: "राक्षस",
    eyebrow: "असुर नहीं · लंका वंश",
    summary: "पुलस्त्य → विश्रवा → रावण और सहोदर (दैत्य/दानव से अलग)।",
  },
  "nagas": {
    title: "नाग",
    eyebrow: "सर्प जाति",
    summary: "कश्यप → कद्रू → अनन्त, वासुकि, तक्षक और प्रमुख नाग।",
  },
  "yakshas": {
    title: "यक्ष",
    eyebrow: "रक्षक",
    summary: "कुबेर — यक्षों के स्वामी; राक्षसों में मिलाया नहीं।",
  },
  "gandharvas": {
    title: "गंधर्व",
    eyebrow: "दिव्य संगीतक",
    summary: "महाकाव्य/गीता में उल्लिखित गंधर्व — कल्पित वंशावली नहीं।",
  },
  "solar-dynasty": {
    title: "सूर्यवंश",
    eyebrow: "सूर्यवंश",
    summary: "विवस्वान → वैवस्वत मनु → इक्ष्वाकु → रघु → दशरथ।",
  },
  "lunar-dynasty": {
    title: "चंद्रवंश",
    eyebrow: "चंद्रवंश",
    summary: "अत्रि → चन्द्र → बुध → पुरूरवा → ययाति → यदु / पुरु।",
  },
  "raghu-dynasty": {
    title: "रघुवंश",
    eyebrow: "रघुवंश",
    summary: "रघु → अज → दशरथ → राम और भाई।",
  },
  "yadu-dynasty": {
    title: "यदुवंश",
    eyebrow: "यादव",
    summary: "ययाति → यदु → वसुदेव → कृष्ण और बलराम।",
  },
  "kuru-dynasty": {
    title: "कुरुवंश",
    eyebrow: "कुरु",
    summary: "कुरु → शंतनु → भीष्म / विचित्रवीर्य → धृतराष्ट्र और पाण्डु।",
  },
  "pandavas": {
    title: "पांडव",
    eyebrow: "पांडु के पुत्र",
    summary: "पाँच भाई, द्रौपदी, सुभद्रा, अभिमन्यु और कर्ण।",
  },
  "kauravas": {
    title: "कौरव",
    eyebrow: "धृतराष्ट्र के पुत्र",
    summary: "धृतराष्ट्र, गांधारी, दुर्योधन, दुःशासन और दुःशला।",
  },
  "krishna-family": {
    title: "कृष्ण का परिवार",
    eyebrow: "वृष्णि कुल",
    summary: "वसुदेव, देवकी, नन्द–यशोदा, बलराम, रुक्मिणी और सुभद्रा।",
  },
  "rama-family": {
    title: "राम का परिवार",
    eyebrow: "अयोध्या",
    summary: "दशरथ की रानियाँ, चार भाई, सीता, लव और कुश।",
  },
  "major-rishis": {
    title: "प्रमुख ऋषि",
    eyebrow: "मुनि",
    summary: "वसिष्ठ, व्यास, वाल्मीकि, नारद, पराशर और परिवार।",
  },
  "major-kings": {
    title: "प्रमुख राजा",
    eyebrow: "शासक",
    summary: "विविध वंशों के राजा जिनके शास्त्रीय प्रमाण सबसे मजबूत हैं।",
  },
};

const CATALOG: Partial<Record<ReadingLanguageCode, Partial<Record<string, ModuleCopy>>>> = {
  te,
  hi,
};

const SCRIPT_PROXY_LANGS = new Set(["kn", "ta", "ml", "or"]);

function scriptProxyModule(copy: ModuleCopy, code: string): ModuleCopy {
  return {
    title: devanagariToReadingScript(copy.title, code),
    eyebrow: devanagariToReadingScript(copy.eyebrow, code),
    summary: devanagariToReadingScript(copy.summary, code),
  };
}

export function localizeGenealogyModule(
  mod: Pick<GenealogyModule, "slug" | "title" | "eyebrow" | "summary">,
  code: string,
): ModuleCopy {
  if (code === "te") {
    const hit = CATALOG.te?.[mod.slug];
    if (hit) return hit;
  }
  if (code === "hi" || code === "sa") {
    const hit = CATALOG.hi?.[mod.slug];
    if (hit) return hit;
  }
  if (SCRIPT_PROXY_LANGS.has(code)) {
    const hit = CATALOG.hi?.[mod.slug];
    if (hit) return scriptProxyModule(hit, code);
  }
  return {
    title: mod.title,
    eyebrow: mod.eyebrow ?? "",
    summary: mod.summary,
  };
}
