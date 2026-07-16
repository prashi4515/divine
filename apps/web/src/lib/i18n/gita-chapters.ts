import type { ReadingLanguageCode } from "@/lib/reading/languages";

/** Traditional Gita chapter yoga names by reading language. */
export const GITA_CHAPTER_TITLES: Record<
  ReadingLanguageCode,
  Record<number, string>
> = {
  en: {
    1: "Arjuna Visada Yoga",
    2: "Sankhya Yoga",
    3: "Karma Yoga",
    4: "Jnana Karma Sanyasa Yoga",
    5: "Karma Sanyasa Yoga",
    6: "Dhyana Yoga",
    7: "Jnana Vijnana Yoga",
    8: "Akshara Brahma Yoga",
    9: "Raja Vidya Yoga",
    10: "Vibhuti Yoga",
    11: "Vishwarupa Darshana Yoga",
    12: "Bhakti Yoga",
    13: "Kshetra Kshetrajna Vibhaga Yoga",
    14: "Gunatraya Vibhaga Yoga",
    15: "Purushottama Yoga",
    16: "Daivasura Sampad Vibhaga Yoga",
    17: "Sraddhatraya Vibhaga Yoga",
    18: "Moksha Sanyasa Yoga",
  },
  sa: {
    1: "अर्जुनविषादयोगः",
    2: "साङ्ख्ययोगः",
    3: "कर्मयोगः",
    4: "ज्ञानकर्मसंन्यासयोगः",
    5: "कर्मसंन्यासयोगः",
    6: "ध्यानयोगः",
    7: "ज्ञानविज्ञानयोगः",
    8: "अक्षरब्रह्मयोगः",
    9: "राजविद्याराजगुह्ययोगः",
    10: "विभूतियोगः",
    11: "विश्वरूपदर्शनयोगः",
    12: "भक्तियोगः",
    13: "क्षेत्रक्षेत्रज्ञविभागयोगः",
    14: "गुणत्रयविभागयोगः",
    15: "पुरुषोत्तमयोगः",
    16: "दैवासुरसम्पद्विभागयोगः",
    17: "श्रद्धात्रयविभागयोगः",
    18: "मोक्षसंन्यासयोगः",
  },
  hi: {
    1: "अर्जुन विषाद योग",
    2: "सांख्य योग",
    3: "कर्म योग",
    4: "ज्ञान कर्म संन्यास योग",
    5: "कर्म संन्यास योग",
    6: "ध्यान योग",
    7: "ज्ञान विज्ञान योग",
    8: "अक्षर ब्रह्म योग",
    9: "राज विद्या राज गुह्य योग",
    10: "विभूति योग",
    11: "विश्वरूप दर्शन योग",
    12: "भक्ति योग",
    13: "क्षेत्र क्षेत्रज्ञ विभाग योग",
    14: "गुणत्रय विभाग योग",
    15: "पुरुषोत्तम योग",
    16: "दैवासुर सम्पद् विभाग योग",
    17: "श्रद्धात्रय विभाग योग",
    18: "मोक्ष संन्यास योग",
  },
  te: {
    1: "అర్జున విషాద యోగం",
    2: "సాంఖ్య యోగం",
    3: "కర్మ యోగం",
    4: "జ్ఞాన కర్మ సన్న్యాస యోగం",
    5: "కర్మ సన్న్యాస యోగం",
    6: "ధ్యాన యోగం",
    7: "జ్ఞాన విజ్ఞాన యోగం",
    8: "అక్షర బ్రహ్మ యోగం",
    9: "రాజ విద్యా రాజ గుహ్య యోగం",
    10: "విభూతి యోగం",
    11: "విశ్వరూప దర్శన యోగం",
    12: "భక్తి యోగం",
    13: "క్షేత్ర క్షేత్రజ్ఞ విభాగ యోగం",
    14: "గుణత్రయ విభాగ యోగం",
    15: "పురుషోత్తమ యోగం",
    16: "దైవాసుర సంపద్ విభాగ యోగం",
    17: "శ్రద్ధాత్రయ విభాగ యోగం",
    18: "మోక్ష సన్న్యాస యోగం",
  },
  kn: {
    1: "ಅರ್ಜುನ ವಿಷಾದ ಯೋಗ",
    2: "ಸಾಂಖ್ಯ ಯೋಗ",
    3: "ಕರ್ಮ ಯೋಗ",
    4: "ಜ್ಞಾನ ಕರ್ಮ ಸನ್ಯಾಸ ಯೋಗ",
    5: "ಕರ್ಮ ಸನ್ಯಾಸ ಯೋಗ",
    6: "ಧ್ಯಾನ ಯೋಗ",
    7: "ಜ್ಞಾನ ವಿಜ್ಞಾನ ಯೋಗ",
    8: "ಅಕ್ಷರ ಬ್ರಹ್ಮ ಯೋಗ",
    9: "ರಾಜ ವಿದ್ಯಾ ರಾಜ ಗುಹ್ಯ ಯೋಗ",
    10: "ವಿಭೂತಿ ಯೋಗ",
    11: "ವಿಶ್ವರೂಪ ದರ್ಶನ ಯೋಗ",
    12: "ಭಕ್ತಿ ಯೋಗ",
    13: "ಕ್ಷೇತ್ರ ಕ್ಷೇತ್ರಜ್ಞ ವಿಭಾಗ ಯೋಗ",
    14: "ಗುಣತ್ರಯ ವಿಭಾಗ ಯೋಗ",
    15: "ಪುರುಷೋತ್ತಮ ಯೋಗ",
    16: "ದೈವಾಸುರ ಸಂಪದ್ ವಿಭಾಗ ಯೋಗ",
    17: "ಶ್ರದ್ಧಾತ್ರಯ ವಿಭಾಗ ಯೋಗ",
    18: "ಮೋಕ್ಷ ಸನ್ಯಾಸ ಯೋಗ",
  },
  ta: {
    1: "அர்ஜுன விஷாத யோகம்",
    2: "சாங்கிய யோகம்",
    3: "கர்ம யோகம்",
    4: "ஞான கர்ம சந்நியாச யோகம்",
    5: "கர்ம சந்நியாச யோகம்",
    6: "த்யான யோகம்",
    7: "ஞான விஜ்ஞான யோகம்",
    8: "அக்ஷர பிரம்ம யோகம்",
    9: "ராஜ வித்யா ராஜ குஹ்ய யோகம்",
    10: "விபூதி யோகம்",
    11: "விஸ்வரூப தர்சன யோகம்",
    12: "பக்தி யோகம்",
    13: "க்ஷேத்ர க்ஷேத்ரஜ்ஞ விபாக யோகம்",
    14: "குணத்ரய விபாக யோகம்",
    15: "புருஷோத்தம யோகம்",
    16: "தைவாசுர சம்பத் விபாக யோகம்",
    17: "ச்ரத்தாத்ரய விபாக யோகம்",
    18: "மோக்ஷ சந்நியாச யோகம்",
  },
  ml: {
    1: "അർജുന വിഷാദ യോഗം",
    2: "സാംഖ്യ യോഗം",
    3: "കർമ യോഗം",
    4: "ജ്ഞാന കർമ സന്യാസ യോഗം",
    5: "കർമ സന്യാസ യോഗം",
    6: "ധ്യാന യോഗം",
    7: "ജ്ഞാന വിജ്ഞാന യോഗം",
    8: "അക്ഷര ബ്രഹ്മ യോഗം",
    9: "രാജ വിദ്യാ രാജ ഗുഹ്യ യോഗം",
    10: "വിഭൂതി യോഗം",
    11: "വിശ്വരൂപ ദർശന യോഗം",
    12: "ഭക്തി യോഗം",
    13: "ക്ഷേത്ര ക്ഷേത്രജ്ഞ വിഭാഗ യോഗം",
    14: "ഗുണത്രയ വിഭാഗ യോഗം",
    15: "പുരുഷോത്തമ യോഗം",
    16: "ദൈവാസുര സമ്പദ് വിഭാഗ യോഗം",
    17: "ശ്രദ്ധാത്രയ വിഭാഗ യോഗം",
    18: "മോക്ഷ സന്യാസ യോഗം",
  },
  or: {
    1: "ଅର୍ଜୁନ ବିଷାଦ ଯୋଗ",
    2: "ସାଙ୍ଖ୍ୟ ଯୋଗ",
    3: "କର୍ମ ଯୋଗ",
    4: "ଜ୍ଞାନ କର୍ମ ସନ୍ନ୍ୟାସ ଯୋଗ",
    5: "କର୍ମ ସନ୍ନ୍ୟାସ ଯୋଗ",
    6: "ଧ୍ୟାନ ଯୋଗ",
    7: "ଜ୍ଞାନ ବିଜ୍ଞାନ ଯୋଗ",
    8: "ଅକ୍ଷର ବ୍ରହ୍ମ ଯୋଗ",
    9: "ରାଜ ବିଦ୍ୟା ରାଜ ଗୁହ୍ୟ ଯୋଗ",
    10: "ବିଭୂତି ଯୋଗ",
    11: "ବିଶ୍ୱରୂପ ଦର୍ଶନ ଯୋଗ",
    12: "ଭକ୍ତି ଯୋଗ",
    13: "କ୍ଷେତ୍ର କ୍ଷେତ୍ରଜ୍ଞ ବିଭାଗ ଯୋଗ",
    14: "ଗୁଣତ୍ରୟ ବିଭାଗ ଯୋଗ",
    15: "ପୁରୁଷୋତ୍ତମ ଯୋଗ",
    16: "ଦୈବାସୁର ସମ୍ପଦ୍ ବିଭାଗ ଯୋଗ",
    17: "ଶ୍ରଦ୍ଧାତ୍ରୟ ବିଭାଗ ଯୋଗ",
    18: "ମୋକ୍ଷ ସନ୍ନ୍ୟାସ ଯୋଗ",
  },
};

const INTRO_EN: Record<number, string> = {
  1: "Arjuna stands on the field of Kurukshetra, overwhelmed by duty and compassion. This opening chapter sets the stage for a dialogue on courage, conscience, and the human heart.",
  2: "This chapter explores knowledge and wisdom — the eternal nature of the Self, the discipline of action, and the steady mind that remains unshaken amid joy and sorrow.",
  3: "Here the path of action unfolds: how to work without attachment, fulfill one’s duty, and turn everyday effort into a form of yoga.",
  4: "Wisdom and action meet. This chapter reveals how knowledge transforms work, how lineages of teaching endure, and how the divine appears across ages.",
  5: "Renunciation and engagement are reconciled. The chapter shows that true freedom lies not in withdrawal, but in acting with a quiet, detached mind.",
  6: "The yoga of meditation. Practice, posture, and the quieting of thought become a path toward inner stillness and union with the Self.",
  7: "Knowledge expands into realization. Creation, material nature, and the divine presence within all things come into clear view.",
  8: "Life, death, and the journey beyond. This chapter reflects on devotion at the final moment and the imperishable destination of the soul.",
  9: "The most confidential knowledge — the presence of the divine in all beings, and the simple, intimate path of loving devotion.",
  10: "Divine manifestations. The chapter invites contemplation of how the sacred shines through excellence, beauty, and power in the world.",
  11: "The cosmic vision. Arjuna is granted a glimpse of the universal form — awe, terror, and reverence in a single revelation.",
  12: "The path of devotion. Loving service, humility, and steadiness of heart are offered as a gentle and complete yoga.",
  13: "The field and the knower of the field. Nature, consciousness, and the distinction between body and Self are carefully drawn.",
  14: "The three qualities of nature — clarity, passion, and inertia — and how they color every thought, action, and destiny.",
  15: "The eternal tree of existence. Attachment is cut at the root, and the path leads upward to the imperishable person.",
  16: "Divine and demoniac natures. Character, restraint, and the quiet strength of virtue are weighed with clarity.",
  17: "Faith takes three forms. This chapter reflects on how belief, offering, and discipline shape the quality of a life.",
  18: "The culmination. Renunciation, duty, knowledge, and surrender gather into a final teaching on freedom and devotion.",
};

const INTRO_TE: Record<number, string> = {
  1: "అర్జునుడు కురుక్షేత్ర యుద్ధభూమిలో ధర్మం, కరుణ మధ్య కలవరపడతాడు. ఈ మొదటి అధ్యాయం ధైర్యం, మనస్సాక్షి, మానవ హృదయం గురించిన సంభాషణకు వేదిక అవుతుంది.",
  2: "ఈ అధ్యాయం జ్ఞానాన్ని వివరిస్తుంది — ఆత్మ శాశ్వత స్వభావం, కర్మలో క్రమశిక్షణ, సుఖదుఃఖాల్లో అచంచలమైన మనస్సు.",
  3: "ఇక్కడ కర్మ మార్గం విప్పుతుంది: అనాసక్తితో పని చేయడం, స్వధర్మం నెరవేర్చడం, రోజువారీ కృషిని యోగంగా మార్చడం.",
  4: "జ్ఞానం, కర్మ కలుస్తాయి. జ్ఞానం పనిని ఎలా మారుస్తుంది, ఉపదేశ పరంపర ఎలా నిలుస్తుంది, యుగాల్లో దైవం ఎలా ప్రత్యక్షమవుతుంది అని ఈ అధ్యాయం చూపుతుంది.",
  5: "సన్న్యాసం, కర్మలో నిమగ్నత సమన్వయం అవుతాయి. నిజమైన స్వేచ్ఛ విరమణలో కాదు, నిశ్చల మనస్సుతో చేసే కర్మలో ఉంటుంది.",
  6: "ధ్యాన యోగం. అభ్యాసం, ఆసనం, మనో నిగ్రహం అంతర శాంతి, ఆత్మ సాక్షాత్కారం వైపు మార్గమవుతాయి.",
  7: "జ్ఞానం సాక్షాత్కారంగా విస్తరిస్తుంది. సృష్టి, ప్రకృతి, సర్వంలోని దైవ సాన్నిధ్యం స్పష్టమవుతాయి.",
  8: "జీవితం, మరణం, అవతలి ప్రయాణం. అంతిమ క్షణంలో భక్తి, ఆత్మ అమర గమ్యం గురించి ఈ అధ్యాయం చెబుతుంది.",
  9: "అత్యంత రహస్య జ్ఞానం — సర్వ భూతాల్లో దైవం, ప్రేమపూర్వక భక్తి అనే సరళమైన మార్గం.",
  10: "దైవ విభూతులు. లోకంలోని శ్రేష్ఠత, సౌందర్యం, శక్తి ద్వారా పవిత్రత ఎలా ప్రకాశిస్తుందో ఈ అధ్యాయం ఆలోచింపజేస్తుంది.",
  11: "విశ్వరూప దర్శనం. అర్జునుడికి విశ్వరూపం కనపడుతుంది — విస్మయం, భయం, భక్తి ఒకే వెలుగులో.",
  12: "భక్తి మార్గం. ప్రేమ సేవ, వినయం, స్థిరమైన హృదయం సంపూర్ణ యోగంగా అందించబడతాయి.",
  13: "క్షేత్రం, క్షేత్రజ్ఞుడు. ప్రకృతి, చైతన్యం, దేహం-ఆత్మ భేదం స్పష్టంగా చెప్పబడతాయి.",
  14: "ప్రకృతి మూడు గుణాలు — సత్త్వం, రజస్సు, తమస్సు — ఆలోచన, కర్మ, గతిని ఎలా రంగులు వేస్తాయో.",
  15: "శాశ్వత సంసార వృక్షం. ఆసక్తి వేరు నుండి కోయబడి, అక్షయ పురుషుని వైపు మార్గం ఎగుస్తుంది.",
  16: "దైవీ, ఆసురీ సంపత్తులు. స్వభావం, నిగ్రహం, సద్గుణ బలం స్పష్టంగా తూకం వేయబడతాయి.",
  17: "శ్రద్ధ మూడు రూపాలు. నమ్మకం, అర్పణ, క్రమశిక్షణ జీవిత నాణ్యతను ఎలా రూపొందిస్తాయో ఈ అధ్యాయం చెబుతుంది.",
  18: "సమాప్తి. సన్న్యాసం, ధర్మం, జ్ఞానం, శరణాగతి — స్వేచ్ఛ, భక్తి గురించిన తుది ఉపదేశంలో కలుస్తాయి.",
};

/** Shorter intros for remaining languages — Telugu-quality depth for hi; concise for others. */
const INTRO_HI: Record<number, string> = {
  1: "अर्जुन कुरुक्षेत्र में कर्तव्य और करुणा के बीच व्याकुल खड़ा है। यह अध्याय साहस, विवेक और मानव हृदय की चर्चा का आरंभ करता है।",
  2: "यह अध्याय ज्ञान और विवेक को खोलता है — आत्मा की नित्यता, कर्म का अनुशासन, और सुख-दुःख में अचल मन।",
  3: "यहाँ कर्म का मार्ग खुलता है: अनासक्ति से कार्य, स्वधर्म का पालन, और दैनिक प्रयास को योग बनाना।",
  4: "ज्ञान और कर्म मिलते हैं। यह अध्याय बताता है कि ज्ञान कैसे कर्म को बदलता है और युगों में दिव्य कैसे प्रकट होता है।",
  5: "संन्यास और कर्म का समन्वय। सच्ची मुक्ति त्याग में नहीं, शांत अनासक्त कर्म में है।",
  6: "ध्यान योग। अभ्यास, आसन और मन की शांति आत्म-साक्षात्कार का मार्ग बनते हैं।",
  7: "ज्ञान साक्षात्कार तक फैलता है। सृष्टि, प्रकृति और सर्व में दिव्य उपस्थिति स्पष्ट होती है।",
  8: "जीवन, मृत्यु और परलोक। अंतिम क्षण की भक्ति और आत्मा की अविनाशी गति पर यह अध्याय विचार करता है।",
  9: "सबसे गोपनीय ज्ञान — सब प्राणियों में दिव्य, और प्रेमपूर्ण भक्ति का सरल मार्ग।",
  10: "दिव्य विभूतियाँ। जगत में श्रेष्ठता, सौंदर्य और शक्ति के माध्यम से पवित्र कैसे चमकता है।",
  11: "विश्वरूप दर्शन। अर्जुन को विराट रूप का दर्शन होता है — विस्मय, भय और भक्ति एक साथ।",
  12: "भक्ति मार्ग। प्रेम सेवा, विनम्रता और स्थिर हृदय पूर्ण योग के रूप में दिए जाते हैं।",
  13: "क्षेत्र और क्षेत्रज्ञ। प्रकृति, चेतना तथा देह-आत्मा का भेद स्पष्ट किया जाता है।",
  14: "प्रकृति के तीन गुण — सत्त्व, रजस्, तमस् — और वे विचार, कर्म व गति को कैसे रंगते हैं।",
  15: "संसार का शाश्वत वृक्ष। आसक्ति जड़ से कटती है और मार्ग अविनाशी पुरुष की ओर ऊपर उठता है।",
  16: "दैवी और आसुरी संपदा। चरित्र, संयम और सद्गुण के बल को स्पष्ट तौला जाता है।",
  17: "श्रद्धा के तीन रूप। विश्वास, अर्पण और अनुशासन जीवन की गुणवत्ता कैसे गढ़ते हैं।",
  18: "समापन। संन्यास, धर्म, ज्ञान और शरणागति स्वतंत्रता व भक्ति के अंतिम उपदेश में मिलते हैं।",
};

function fillIntros(
  base: Record<number, string>,
): Record<number, string> {
  const out: Record<number, string> = {};
  for (let i = 1; i <= 18; i += 1) {
    out[i] = base[i] ?? INTRO_EN[i]!;
  }
  return out;
}

export const GITA_CHAPTER_INTROS: Record<
  ReadingLanguageCode,
  Record<number, string>
> = {
  en: INTRO_EN,
  sa: fillIntros(INTRO_HI),
  hi: INTRO_HI,
  te: INTRO_TE,
  kn: fillIntros(INTRO_TE),
  ta: fillIntros(INTRO_TE),
  ml: fillIntros(INTRO_TE),
  or: fillIntros(INTRO_HI),
};

export function gitaChapterTitle(
  lang: ReadingLanguageCode,
  number: number,
  fallback?: string | null,
): string {
  return (
    GITA_CHAPTER_TITLES[lang][number] ??
    fallback?.trim() ??
    GITA_CHAPTER_TITLES.en[number] ??
    `Chapter ${number}`
  );
}

export function gitaChapterIntro(
  lang: ReadingLanguageCode,
  number: number,
): string {
  return (
    GITA_CHAPTER_INTROS[lang][number] ??
    GITA_CHAPTER_INTROS.en[number] ??
    ""
  );
}
