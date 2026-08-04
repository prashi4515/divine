/**
 * Optional per-entity copy overlays (summary).
 * Keys are entity ids. Missing entries fall back to English summary
 * with IAST tokens rewritten into the reading script.
 */
import { devanagariToReadingScript } from "@/lib/reading/shloka-script";

export type EntityCopy = {
  summary: string;
};

/** Hindi summaries for high-traffic / featured entities. */
const hi: Record<string, EntityCopy> = {
  "city.ayodhya": {
    summary: "इक्ष्वाकु / रघु वंश की राजधानी; राम की नगरी।",
  },
  "city.dvaraka": {
    summary: "कृष्ण और यादवों की समुद्रतटीय राजधानी।",
  },
  "city.hastinapura": {
    summary: "महाभारत में कुरु राज्य की राजधानी।",
  },
  "city.indraprastha": {
    summary: "खाण्डव प्रदेश पर पांडवों द्वारा बसाई गई राजधानी।",
  },
  "city.kampilya": {
    summary: "दक्षिण पांचाल की राजधानी; द्रौपदी की नगरी।",
  },
  "city.mathura": {
    summary: "कंस की नगरी और कृष्ण की प्रारंभिक लीलाओं का केंद्र।",
  },
  "city.rajagriha": {
    summary: "मगध की पहाड़ी राजधानी।",
  },
  "city.ujjayini": {
    summary: "अवन्ति की राजधानी।",
  },
  "city.viratanagara": {
    summary: "तेरहवें वर्ष की मत्स्य राजधानी।",
  },
  "concept.atman": {
    summary: "शाश्वत आत्मा — शरीर, मन और मृत्यु से परे।",
  },
  "concept.bhakti": {
    summary: "भगवद्भक्ति — गीता में एक प्रमुख मार्ग।",
  },
  "concept.brahman": {
    summary: "परब्रह्म — गीता और उपनिषदों में वर्णित परम सत्य।",
  },
};

const te: Record<string, EntityCopy> = {
  "city.ayodhya": {
    summary: "ఇక్ష్వాకు / రఘు వంశ రాజధాని; రాముని నగరం.",
  },
  "city.dvaraka": {
    summary: "కృష్ణుడు మరియు యాదవుల సముద్రతీర రాజధాని.",
  },
  "city.hastinapura": {
    summary: "మహాభారతంలో కురు రాజ్య రాజధాని.",
  },
  "city.indraprastha": {
    summary: "ఖాండవ ప్రాంతంపై పాండవులు నిర్మించిన రాజధాని.",
  },
  "city.kampilya": {
    summary: "దక్షిణ పాంచాల రాజధాని; ద్రౌపది నగరం.",
  },
  "city.mathura": {
    summary: "కంస నగరం మరియు కృష్ణుని ప్రారంభ లీలల కేంద్రం.",
  },
  "city.rajagriha": {
    summary: "మగధ పర్వత రాజధాని.",
  },
  "city.ujjayini": {
    summary: "అవంతి రాజధాని.",
  },
  "city.viratanagara": {
    summary: "పదమూడవ సంవత్సరం మత్స్య రాజధాని.",
  },
  "concept.atman": {
    summary: "శాశ్వత ఆత్మ — శరీరం, మనస్సు, మరణం దాటి.",
  },
  "concept.bhakti": {
    summary: "భగవద్భక్తి — గీతలో ప్రధాన మార్గం.",
  },
  "concept.brahman": {
    summary: "పరబ్రహ్మ — గీత మరియు ఉపనిషత్తులలో చెప్పిన పరమ సత్యం.",
  },
};

const SCRIPT_PROXY = new Set(["kn", "ta", "ml", "or"]);

export function getEntityCopyOverlay(
  entityId: string,
  code: string,
): EntityCopy | undefined {
  if (code === "te") return te[entityId];
  if (code === "hi" || code === "sa") return hi[entityId];
  if (SCRIPT_PROXY.has(code)) {
    const hit = hi[entityId];
    if (!hit) return undefined;
    return { summary: devanagariToReadingScript(hit.summary, code) };
  }
  return undefined;
}
