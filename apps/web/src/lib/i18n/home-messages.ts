import type { ReadingLanguageCode } from "@/lib/reading/languages";

/**
 * Copy for the redesigned public landing page sections.
 * Kept separate from the large `messages.ts` catalog so the marketing surface
 * can evolve independently. Falls back to English for any missing language.
 */
export type HomeMessages = {
  heroEyebrow: string;
  startReading: string;
  todaysVerse: string;
  searchVerses: string;
  verseForReflection: string;
  featuredMeaning: string;
  readInContext: string;
  valuesHeading: string;
  valuesSubheading: string;
  multilingualTitle: string;
  multilingualBody: string;
  meaningsTitle: string;
  meaningsBody: string;
  focusTitle: string;
  focusBody: string;
  browseHeading: string;
  browseBody: string;
  chaptersLabel: string;
  versesLabel: string;
  languagesLabel: string;
};

const en: HomeMessages = {
  heroEyebrow: "A quieter way to read scripture",
  startReading: "Start reading",
  todaysVerse: "Today's verse",
  searchVerses: "Search verses",
  verseForReflection: "Verse for reflection",
  featuredMeaning:
    "You have a right to your actions alone, never to their fruits.",
  readInContext: "Read in context",
  valuesHeading: "A quiet place to read scripture",
  valuesSubheading:
    "Everything here is designed for slow, unhurried reading — clear on any screen, fast on any connection.",
  multilingualTitle: "Read in your language",
  multilingualBody:
    "Sanskrit alongside translations and meanings in many Indian languages.",
  meaningsTitle: "Word-by-word meanings",
  meaningsBody:
    "Understand each verse deeply with padacheda and commentary, not just translation.",
  focusTitle: "Distraction-free",
  focusBody:
    "No clutter, no noise — just the verse, gentle typography, and space to reflect.",
  browseHeading: "Begin with any chapter",
  browseBody:
    "Eighteen chapters, seven hundred verses. Start anywhere and read at your own pace.",
  chaptersLabel: "Chapters",
  versesLabel: "Verses",
  languagesLabel: "Languages",
};

const hi: HomeMessages = {
  heroEyebrow: "शास्त्र पढ़ने का एक शांत मार्ग",
  startReading: "पढ़ना शुरू करें",
  todaysVerse: "आज का श्लोक",
  searchVerses: "श्लोक खोजें",
  verseForReflection: "मनन के लिए श्लोक",
  featuredMeaning:
    "तुम्हारा अधिकार केवल कर्म में है, उसके फलों में कभी नहीं।",
  readInContext: "संदर्भ में पढ़ें",
  valuesHeading: "शास्त्र पढ़ने का एक शांत स्थान",
  valuesSubheading:
    "यहाँ सब कुछ धीमे, इत्मीनान से पढ़ने के लिए बनाया गया है — हर स्क्रीन पर स्पष्ट, हर कनेक्शन पर तेज़।",
  multilingualTitle: "अपनी भाषा में पढ़ें",
  multilingualBody:
    "संस्कृत के साथ अनेक भारतीय भाषाओं में अनुवाद और अर्थ।",
  meaningsTitle: "शब्द-दर-शब्द अर्थ",
  meaningsBody:
    "केवल अनुवाद नहीं, पदच्छेद और टीका के साथ हर श्लोक को गहराई से समझें।",
  focusTitle: "बिना विक्षेप",
  focusBody:
    "कोई अव्यवस्था नहीं, कोई शोर नहीं — केवल श्लोक, कोमल अक्षर और मनन के लिए स्थान।",
  browseHeading: "किसी भी अध्याय से आरंभ करें",
  browseBody:
    "अठारह अध्याय, सात सौ श्लोक। कहीं से भी आरंभ करें और अपनी गति से पढ़ें।",
  chaptersLabel: "अध्याय",
  versesLabel: "श्लोक",
  languagesLabel: "भाषाएँ",
};

const te: HomeMessages = {
  heroEyebrow: "శాస్త్రం చదవడానికి ఒక ప్రశాంత మార్గం",
  startReading: "చదవడం ప్రారంభించండి",
  todaysVerse: "నేటి శ్లోకం",
  searchVerses: "శ్లోకాలను వెతకండి",
  verseForReflection: "మననం కోసం శ్లోకం",
  featuredMeaning:
    "నీకు కర్మలో మాత్రమే అధికారం, వాటి ఫలాలపై ఎన్నడూ కాదు.",
  readInContext: "సందర్భంలో చదవండి",
  valuesHeading: "శాస్త్రం చదవడానికి ఒక ప్రశాంత స్థలం",
  valuesSubheading:
    "ఇక్కడ ప్రతిదీ నిదానంగా చదవడానికి రూపొందించబడింది — ప్రతి తెరపై స్పష్టం, ప్రతి కనెక్షన్‌పై వేగం.",
  multilingualTitle: "మీ భాషలో చదవండి",
  multilingualBody:
    "సంస్కృతంతో పాటు అనేక భారతీయ భాషల్లో అనువాదాలు మరియు అర్థాలు.",
  meaningsTitle: "పదం-పదం అర్థాలు",
  meaningsBody:
    "కేవలం అనువాదం కాదు, పదచ్ఛేదం మరియు వ్యాఖ్యానంతో ప్రతి శ్లోకాన్ని లోతుగా అర్థం చేసుకోండి.",
  focusTitle: "అంతరాయం లేకుండా",
  focusBody:
    "గందరగోళం లేదు, శబ్దం లేదు — కేవలం శ్లోకం, మృదువైన అక్షరాలు, మననానికి స్థలం.",
  browseHeading: "ఏ అధ్యాయంతోనైనా ప్రారంభించండి",
  browseBody:
    "పద్దెనిమిది అధ్యాయాలు, ఏడు వందల శ్లోకాలు. ఎక్కడి నుండైనా మీ వేగంతో చదవండి.",
  chaptersLabel: "అధ్యాయాలు",
  versesLabel: "శ్లోకాలు",
  languagesLabel: "భాషలు",
};

const kn: HomeMessages = {
  heroEyebrow: "ಶಾಸ್ತ್ರ ಓದಲು ಒಂದು ಶಾಂತ ಮಾರ್ಗ",
  startReading: "ಓದಲು ಪ್ರಾರಂಭಿಸಿ",
  todaysVerse: "ಇಂದಿನ ಶ್ಲೋಕ",
  searchVerses: "ಶ್ಲೋಕಗಳನ್ನು ಹುಡುಕಿ",
  verseForReflection: "ಮನನಕ್ಕಾಗಿ ಶ್ಲೋಕ",
  featuredMeaning:
    "ನಿನಗೆ ಕರ್ಮದಲ್ಲಿ ಮಾತ್ರ ಅಧಿಕಾರ, ಅದರ ಫಲಗಳಲ್ಲಿ ಎಂದಿಗೂ ಇಲ್ಲ.",
  readInContext: "ಸಂದರ್ಭದಲ್ಲಿ ಓದಿ",
  valuesHeading: "ಶಾಸ್ತ್ರ ಓದಲು ಒಂದು ಶಾಂತ ಸ್ಥಳ",
  valuesSubheading:
    "ಇಲ್ಲಿ ಎಲ್ಲವೂ ನಿಧಾನವಾಗಿ ಓದಲು ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ — ಪ್ರತಿ ಪರದೆಯಲ್ಲಿ ಸ್ಪಷ್ಟ, ಪ್ರತಿ ಸಂಪರ್ಕದಲ್ಲಿ ವೇಗ.",
  multilingualTitle: "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಓದಿ",
  multilingualBody:
    "ಸಂಸ್ಕೃತದ ಜೊತೆಗೆ ಹಲವು ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಅನುವಾದ ಮತ್ತು ಅರ್ಥ.",
  meaningsTitle: "ಪದ-ಪದ ಅರ್ಥಗಳು",
  meaningsBody:
    "ಕೇವಲ ಅನುವಾದವಲ್ಲ, ಪದಚ್ಛೇದ ಮತ್ತು ವ್ಯಾಖ್ಯಾನದೊಂದಿಗೆ ಪ್ರತಿ ಶ್ಲೋಕವನ್ನು ಆಳವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.",
  focusTitle: "ಗಮನ ಭಂಗವಿಲ್ಲದೆ",
  focusBody:
    "ಗೊಂದಲವಿಲ್ಲ, ಶಬ್ದವಿಲ್ಲ — ಕೇವಲ ಶ್ಲೋಕ, ಮೃದು ಅಕ್ಷರ ಮತ್ತು ಮನನಕ್ಕೆ ಸ್ಥಳ.",
  browseHeading: "ಯಾವುದೇ ಅಧ್ಯಾಯದಿಂದ ಆರಂಭಿಸಿ",
  browseBody:
    "ಹದಿನೆಂಟು ಅಧ್ಯಾಯಗಳು, ಏಳುನೂರು ಶ್ಲೋಕಗಳು. ಎಲ್ಲಿಂದಾದರೂ ನಿಮ್ಮ ವೇಗದಲ್ಲಿ ಓದಿ.",
  chaptersLabel: "ಅಧ್ಯಾಯಗಳು",
  versesLabel: "ಶ್ಲೋಕಗಳು",
  languagesLabel: "ಭಾಷೆಗಳು",
};

const ta: HomeMessages = {
  heroEyebrow: "மறைநூல் படிக்க ஓர் அமைதியான வழி",
  startReading: "வாசிக்கத் தொடங்குங்கள்",
  todaysVerse: "இன்றைய சுலோகம்",
  searchVerses: "சுலோகங்களைத் தேடு",
  verseForReflection: "சிந்தனைக்கான சுலோகம்",
  featuredMeaning:
    "செயலில் மட்டுமே உனக்கு உரிமை, அதன் பலன்களில் ஒருபோதும் இல்லை.",
  readInContext: "சூழலில் படிக்க",
  valuesHeading: "மறைநூல் படிக்க ஓர் அமைதியான இடம்",
  valuesSubheading:
    "இங்கு அனைத்தும் நிதானமாகப் படிக்க வடிவமைக்கப்பட்டுள்ளது — எந்தத் திரையிலும் தெளிவு, எந்த இணைப்பிலும் வேகம்.",
  multilingualTitle: "உங்கள் மொழியில் படியுங்கள்",
  multilingualBody:
    "சமஸ்கிருதத்துடன் பல இந்திய மொழிகளில் மொழிபெயர்ப்பும் பொருளும்.",
  meaningsTitle: "சொல்லுக்குச் சொல் பொருள்",
  meaningsBody:
    "மொழிபெயர்ப்பு மட்டுமல்ல, பதச்சேதம் மற்றும் விளக்கத்துடன் ஒவ்வொரு சுலோகத்தையும் ஆழமாகப் புரிந்துகொள்ளுங்கள்.",
  focusTitle: "கவனச்சிதறல் இல்லாமல்",
  focusBody:
    "குழப்பம் இல்லை, சத்தம் இல்லை — சுலோகம், மென்மையான எழுத்துரு, சிந்திக்க இடம் மட்டுமே.",
  browseHeading: "எந்த அத்தியாயத்திலிருந்தும் தொடங்குங்கள்",
  browseBody:
    "பதினெட்டு அத்தியாயங்கள், எழுநூறு சுலோகங்கள். எங்கிருந்தும் உங்கள் வேகத்தில் படியுங்கள்.",
  chaptersLabel: "அத்தியாயங்கள்",
  versesLabel: "சுலோகங்கள்",
  languagesLabel: "மொழிகள்",
};

const ml: HomeMessages = {
  heroEyebrow: "വേദഗ്രന്ഥം വായിക്കാൻ ഒരു ശാന്ത വഴി",
  startReading: "വായന ആരംഭിക്കുക",
  todaysVerse: "ഇന്നത്തെ ശ്ലോകം",
  searchVerses: "ശ്ലോകങ്ങൾ തിരയുക",
  verseForReflection: "ധ്യാനത്തിനുള്ള ശ്ലോകം",
  featuredMeaning:
    "പ്രവൃത്തിയിൽ മാത്രമേ നിനക്ക് അവകാശമുള്ളൂ, അതിന്റെ ഫലങ്ങളിൽ ഒരിക്കലുമില്ല.",
  readInContext: "സന്ദർഭത്തിൽ വായിക്കുക",
  valuesHeading: "വേദഗ്രന്ഥം വായിക്കാൻ ഒരു ശാന്ത ഇടം",
  valuesSubheading:
    "ഇവിടെ എല്ലാം സാവധാനം വായിക്കാൻ രൂപകൽപ്പന ചെയ്തിരിക്കുന്നു — ഏത് സ്ക്രീനിലും വ്യക്തം, ഏത് കണക്ഷനിലും വേഗം.",
  multilingualTitle: "നിങ്ങളുടെ ഭാഷയിൽ വായിക്കൂ",
  multilingualBody:
    "സംസ്കൃതത്തോടൊപ്പം പല ഇന്ത്യൻ ഭാഷകളിൽ വിവർത്തനവും അർത്ഥവും.",
  meaningsTitle: "പദം-പദം അർത്ഥം",
  meaningsBody:
    "വിവർത്തനം മാത്രമല്ല, പദച്ഛേദവും വ്യാഖ്യാനവും ചേർത്ത് ഓരോ ശ്ലോകവും ആഴത്തിൽ മനസ്സിലാക്കൂ.",
  focusTitle: "ശ്രദ്ധ വ്യതിചലിക്കാതെ",
  focusBody:
    "കുഴപ്പമില്ല, ശബ്ദമില്ല — ശ്ലോകവും മൃദുവായ അക്ഷരവും ധ്യാനത്തിനുള്ള ഇടവും മാത്രം.",
  browseHeading: "ഏത് അധ്യായത്തിൽ നിന്നും തുടങ്ങൂ",
  browseBody:
    "പതിനെട്ട് അധ്യായങ്ങൾ, എഴുന്നൂറ് ശ്ലോകങ്ങൾ. എവിടെ നിന്നും നിങ്ങളുടെ വേഗത്തിൽ വായിക്കൂ.",
  chaptersLabel: "അധ്യായങ്ങൾ",
  versesLabel: "ശ്ലോകങ്ങൾ",
  languagesLabel: "ഭാഷകൾ",
};

const or: HomeMessages = {
  heroEyebrow: "ଶାସ୍ତ୍ର ପଢ଼ିବାର ଏକ ଶାନ୍ତ ମାର୍ଗ",
  startReading: "ପଢ଼ିବା ଆରମ୍ଭ କରନ୍ତୁ",
  todaysVerse: "ଆଜିର ଶ୍ଲୋକ",
  searchVerses: "ଶ୍ଲୋକ ଖୋଜନ୍ତୁ",
  verseForReflection: "ମନନ ପାଇଁ ଶ୍ଲୋକ",
  featuredMeaning:
    "ତୁମର ଅଧିକାର କେବଳ କର୍ମରେ, ଏହାର ଫଳରେ କେବେ ନୁହେଁ।",
  readInContext: "ପ୍ରସଙ୍ଗରେ ପଢ଼ନ୍ତୁ",
  valuesHeading: "ଶାସ୍ତ୍ର ପଢ଼ିବା ପାଇଁ ଏକ ଶାନ୍ତ ସ୍ଥାନ",
  valuesSubheading:
    "ଏଠାରେ ସବୁକିଛି ଧୀରେ ପଢ଼ିବା ପାଇଁ ପ୍ରସ୍ତୁତ — ପ୍ରତ୍ୟେକ ସ୍କ୍ରିନରେ ସ୍ପଷ୍ଟ, ପ୍ରତ୍ୟେକ ସଂଯୋଗରେ ଦ୍ରୁତ।",
  multilingualTitle: "ଆପଣଙ୍କ ଭାଷାରେ ପଢ଼ନ୍ତୁ",
  multilingualBody:
    "ସଂସ୍କୃତ ସହିତ ଅନେକ ଭାରତୀୟ ଭାଷାରେ ଅନୁବାଦ ଓ ଅର୍ଥ।",
  meaningsTitle: "ଶବ୍ଦ-ଶବ୍ଦ ଅର୍ଥ",
  meaningsBody:
    "କେବଳ ଅନୁବାଦ ନୁହେଁ, ପଦଚ୍ଛେଦ ଓ ଟୀକା ସହିତ ପ୍ରତ୍ୟେକ ଶ୍ଲୋକକୁ ଗଭୀର ଭାବେ ବୁଝନ୍ତୁ।",
  focusTitle: "ବିକ୍ଷେପ ବିନା",
  focusBody:
    "କୌଣସି ଅଗାଡ଼ି ନାହିଁ, କୌଣସି ଶବ୍ଦ ନାହିଁ — କେବଳ ଶ୍ଲୋକ, କୋମଳ ଅକ୍ଷର ଓ ମନନ ପାଇଁ ସ୍ଥାନ।",
  browseHeading: "ଯେକୌଣସି ଅଧ୍ୟାୟରୁ ଆରମ୍ଭ କରନ୍ତୁ",
  browseBody:
    "ଅଠର ଅଧ୍ୟାୟ, ସାତଶହ ଶ୍ଲୋକ। ଯେକୌଣସି ସ୍ଥାନରୁ ନିଜ ଗତିରେ ପଢ଼ନ୍ତୁ।",
  chaptersLabel: "ଅଧ୍ୟାୟ",
  versesLabel: "ଶ୍ଲୋକ",
  languagesLabel: "ଭାଷା",
};

const sa: HomeMessages = {
  heroEyebrow: "शास्त्रपठनस्य शान्तः मार्गः",
  startReading: "पठनम् आरभताम्",
  todaysVerse: "अद्यतनः श्लोकः",
  searchVerses: "श्लोकान् अन्विष्यताम्",
  verseForReflection: "मननाय श्लोकः",
  featuredMeaning:
    "कर्मणि एव अधिकारः ते, मा फलेषु कदाचन।",
  readInContext: "प्रसङ्गे पठ्यताम्",
  valuesHeading: "शास्त्रपठनाय शान्तं स्थानम्",
  valuesSubheading:
    "अत्र सर्वं शनैः पठनाय निर्मितम् — सर्वस्मिन् पटले स्पष्टं, सर्वस्मिन् संयोगे शीघ्रम्।",
  multilingualTitle: "स्वभाषायां पठ्यताम्",
  multilingualBody:
    "संस्कृतेन सह अनेकासु भारतीयभाषासु अनुवादाः अर्थाश्च।",
  meaningsTitle: "पदशः अर्थाः",
  meaningsBody:
    "केवलम् अनुवादः न, पदच्छेदेन टीकया च प्रतिश्लोकं गभीरतया अवगम्यताम्।",
  focusTitle: "विक्षेपरहितम्",
  focusBody:
    "न सङ्कीर्णता, न कोलाहलः — केवलं श्लोकः, मृदवः अक्षराः, मननाय अवकाशश्च।",
  browseHeading: "केनापि अध्यायेन आरभ्यताम्",
  browseBody:
    "अष्टादश अध्यायाः, सप्तशतं श्लोकाः। कुतोऽपि स्वगत्या पठ्यताम्।",
  chaptersLabel: "अध्यायाः",
  versesLabel: "श्लोकाः",
  languagesLabel: "भाषाः",
};

const HOME_CATALOG: Record<ReadingLanguageCode, HomeMessages> = {
  en,
  sa,
  hi,
  te,
  kn,
  ta,
  ml,
  or,
};

export function getHomeMessages(code: string): HomeMessages {
  if (code in HOME_CATALOG) {
    return HOME_CATALOG[code as ReadingLanguageCode];
  }
  return en;
}
