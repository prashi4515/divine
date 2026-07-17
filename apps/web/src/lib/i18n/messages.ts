import type { ReadingLanguageCode } from "@/lib/reading/languages";
import {
  gitaChapterIntro,
  gitaChapterTitle,
} from "@/lib/i18n/gita-chapters";

export type Messages = {
  tagline: string;
  beginReading: string;
  featuredScripture: string;
  scriptures: string;
  scripturesHint: string;
  scriptureSoon: string;
  scriptureSoonHint: string;
  home: string;
  scripture: string;
  gitaTitle: string;
  gitaBlurb: string;
  read: string;
  verses: string;
  verseSingular: string;
  footer: string;
  chapterFallback: (n: number) => string;
  chapterTitle: (n: number, fallback?: string | null) => string;
  chapterIntro: (n: number) => string;
  original: string;
  translation: string;
  sanskrit: string;
  language: string;
  noTranslation: string;
  noCommentary: string;
  noSanskrit: string;
  readingProgress: string;
  previousChapter: string;
  nextChapter: string;
  allChapters: string;
  previousVerse: string;
  nextVerse: string;
  jump: string;
  go: string;
  readIn: string;
  jumpToVerse: string;
  meaning: string;
  commentary: string;
  copy: string;
  copied: string;
  share: string;
  bookmark: string;
  bookmarked: string;
  readingTime: string;
  theme: string;
  minutes: (n: number) => string;
  reader: string;
  workTitles: Record<string, string>;
  workDescriptions: Record<string, string>;
};

type MessageBase = Omit<Messages, "chapterTitle" | "chapterIntro">;

function build(lang: ReadingLanguageCode, base: MessageBase): Messages {
  return {
    ...base,
    chapterTitle: (n, fallback) => gitaChapterTitle(lang, n, fallback),
    chapterIntro: (n) => gitaChapterIntro(lang, n),
  };
}

const en = build("en", {
  tagline: "Read sacred texts with clarity, calm, and reverence.",
  beginReading: "Begin Reading",
  featuredScripture: "Featured scripture",
  scriptures: "Scriptures",
  scripturesHint: "Everything published in the library appears here.",
  scriptureSoon: "Scripture arriving soon",
  scriptureSoonHint: "Published works will appear here when the catalog is ready.",
  home: "Home",
  scripture: "Scripture",
  gitaTitle: "Bhagavad Gita",
  gitaBlurb: "Eighteen chapters — read at your own pace.",
  read: "Read",
  verses: "verses",
  verseSingular: "verse",
  footer: "Built with reverence for seekers everywhere.",
  chapterFallback: (n) => `Chapter ${n}`,
  original: "Original",
  translation: "Translation",
  sanskrit: "Sanskrit",
  language: "Language",
  noTranslation: "No translation for this verse yet.",
  noCommentary: "No commentary for this verse in this language yet.",
  noSanskrit: "No Sanskrit text for this verse yet.",
  readingProgress: "Reading progress",
  previousChapter: "Previous Chapter",
  nextChapter: "Next Chapter",
  allChapters: "All Chapters",
  previousVerse: "Previous",
  nextVerse: "Next",
  jump: "Jump",
  go: "Go",
  readIn: "Read in",
  jumpToVerse: "Jump to any verse",
  meaning: "Word meanings",
  commentary: "Commentary",
  copy: "Copy",
  copied: "Copied",
  share: "Share",
  bookmark: "Bookmark",
  bookmarked: "Bookmarked",
  readingTime: "Reading Time",
  theme: "Theme",
  minutes: (n) => `${n} min`,
  reader: "Reader",
  workTitles: { bg: "Bhagavad Gita", quran: "Quran", bible: "Bible" },
  workDescriptions: {
    bg: "The Song of the Lord — 700 verses across 18 chapters of the Mahabharata.",
  },
});

const hi = build("hi", {
  tagline: "पवित्र ग्रंथों को स्पष्टता, शांति और श्रद्धा के साथ पढ़ें।",
  beginReading: "पढ़ना शुरू करें",
  featuredScripture: "विशेष ग्रंथ",
  scriptures: "ग्रंथ",
  scripturesHint: "लाइब्रेरी में प्रकाशित सभी ग्रंथ यहाँ दिखते हैं।",
  scriptureSoon: "ग्रंथ जल्द आ रहे हैं",
  scriptureSoonHint: "कैटलॉग तैयार होने पर प्रकाशित ग्रंथ यहाँ दिखाई देंगे।",
  home: "होम",
  scripture: "ग्रंथ",
  gitaTitle: "भगवद्गीता",
  gitaBlurb: "अठारह अध्याय। एक अध्याय चुनें और अपनी गति से शांतिपूर्वक पढ़ें।",
  read: "पढ़ें",
  verses: "श्लोक",
  verseSingular: "श्लोक",
  footer: "सभी साधकों के लिए श्रद्धा के साथ निर्मित।",
  chapterFallback: (n) => `अध्याय ${n}`,
  original: "मूल",
  translation: "अनुवाद",
  sanskrit: "संस्कृत",
  language: "भाषा",
  noTranslation: "इस श्लोक का अनुवाद अभी उपलब्ध नहीं है।",
  noCommentary: "इस श्लोक की इस भाषा में व्याख्या अभी उपलब्ध नहीं है।",
  noSanskrit: "इस श्लोक का संस्कृत पाठ अभी उपलब्ध नहीं है।",
  readingProgress: "पठन प्रगति",
  previousChapter: "पिछला अध्याय",
  nextChapter: "अगला अध्याय",
  allChapters: "सभी अध्याय",
  previousVerse: "पिछला",
  nextVerse: "अगला",
  jump: "जाएँ",
  go: "जाएँ",
  readIn: "इस भाषा में पढ़ें",
  jumpToVerse: "किसी भी श्लोक पर जाएँ",
  meaning: "पदार्थ",
  commentary: "टीका",
  copy: "कॉपी",
  copied: "कॉपी हो गया",
  share: "साझा करें",
  bookmark: "बुकमार्क",
  bookmarked: "बुकमार्क किया",
  readingTime: "पठन समय",
  theme: "विषय",
  minutes: (n) => `${n} मि`,
  reader: "पाठक",
  workTitles: { bg: "भगवद्गीता", quran: "कुरआन", bible: "बाइबिल" },
  workDescriptions: {
    bg: "भगवान का गीत — महाभारत के अठारह अध्यायों में सात सौ श्लोक।",
  },
});

const te = build("te", {
  tagline: "పవిత్ర గ్రంథాలను స్పష్టత, ప్రశాంతత, భక్తితో చదవండి.",
  beginReading: "చదవడం ప్రారంభించండి",
  featuredScripture: "ప్రత్యేక గ్రంథం",
  scriptures: "గ్రంథాలు",
  scripturesHint: "లైబ్రరీలో ప్రచురించిన ప్రతి గ్రంథం ఇక్కడ కనిపిస్తుంది.",
  scriptureSoon: "గ్రంథాలు త్వరలో",
  scriptureSoonHint: "కేటలాగ్ సిద్ధమైనప్పుడు ప్రచురిత గ్రంథాలు ఇక్కడ కనిపిస్తాయి.",
  home: "హోమ్",
  scripture: "గ్రంథం",
  gitaTitle: "భగవద్గీత",
  gitaBlurb: "పద్దెనిమిది అధ్యాయాలు. ఒక అధ్యాయం ఎంచుకుని, మీ వేగంతో ప్రశాంతంగా చదవండి.",
  read: "చదవండి",
  verses: "శ్లోకాలు",
  verseSingular: "శ్లోకం",
  footer: "అన్వేషకులందరికీ భక్తితో నిర్మించబడింది.",
  chapterFallback: (n) => `అధ్యాయం ${n}`,
  original: "మూలం",
  translation: "అనువాదం",
  sanskrit: "సంస్కృతం",
  language: "భాష",
  noTranslation: "ఈ శ్లోకానికి అనువాదం ఇంకా లేదు.",
  noCommentary: "ఈ శ్లోకానికి ఈ భాషలో వ్యాఖ్యానం ఇంకా లేదు.",
  noSanskrit: "ఈ శ్లోకానికి సంస్కృత పాఠం ఇంకా లేదు.",
  readingProgress: "చదివే పురోగతి",
  previousChapter: "మునుపటి అధ్యాయం",
  nextChapter: "తర్వాతి అధ్యాయం",
  allChapters: "అన్ని అధ్యాయాలు",
  previousVerse: "మునుపటి",
  nextVerse: "తర్వాతి",
  jump: "వెళ్లు",
  go: "వెళ్లు",
  readIn: "ఈ భాషలో చదవండి",
  jumpToVerse: "ఏ శ్లోకానికైనా వెళ్లండి",
  meaning: "పదార్థాలు",
  commentary: "వ్యాఖ్యానం",
  copy: "కాపీ",
  copied: "కాపీ అయింది",
  share: "పంచుకోండి",
  bookmark: "బుక్‌మార్క్",
  bookmarked: "బుక్‌మార్క్ అయింది",
  readingTime: "చదివే సమయం",
  theme: "అంశం",
  minutes: (n) => `${n} ని`,
  reader: "పాఠకుడు",
  workTitles: { bg: "భగవద్గీత", quran: "ఖురాన్", bible: "బైబిల్" },
  workDescriptions: {
    bg: "ప్రభువు గీతం — మహాభారతంలోని పద్దెనిమిది అధ్యాయాల్లో ఏడు వందల శ్లోకాలు.",
  },
});

const kn = build("kn", {
  tagline: "ಪವಿತ್ರ ಗ್ರಂಥಗಳನ್ನು ಸ್ಪಷ್ಟತೆ, ಶಾಂತಿ ಮತ್ತು ಭಕ್ತಿಯಿಂದ ಓದಿ.",
  beginReading: "ಓದಲು ಪ್ರಾರಂಭಿಸಿ",
  featuredScripture: "ವಿಶೇಷ ಗ್ರಂಥ",
  scriptures: "ಗ್ರಂಥಗಳು",
  scripturesHint: "ಲೈಬ್ರರಿಯಲ್ಲಿ ಪ್ರಕಟವಾದ ಎಲ್ಲಾ ಗ್ರಂಥಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",
  scriptureSoon: "ಗ್ರಂಥಗಳು ಶೀಘ್ರದಲ್ಲೇ",
  scriptureSoonHint: "ಕ್ಯಾಟಲಾಗ್ ಸಿದ್ಧವಾದಾಗ ಪ್ರಕಟಿತ ಗ್ರಂಥಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",
  home: "ಮುಖಪುಟ",
  scripture: "ಗ್ರಂಥ",
  gitaTitle: "ಭಗವದ್ಗೀತೆ",
  gitaBlurb: "ಹದಿನೆಂಟು ಅಧ್ಯಾಯಗಳು. ಒಂದು ಅಧ್ಯಾಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ, ನಿಮ್ಮ ವೇಗದಲ್ಲಿ ಶಾಂತಿಯಿಂದ ಓದಿ.",
  read: "ಓದಿ",
  verses: "ಶ್ಲೋಕಗಳು",
  verseSingular: "ಶ್ಲೋಕ",
  footer: "ಎಲ್ಲಾ ಅನ್ವೇಷಕರಿಗಾಗಿ ಭಕ್ತಿಯಿಂದ ನಿರ್ಮಿಸಲಾಗಿದೆ.",
  chapterFallback: (n) => `ಅಧ್ಯಾಯ ${n}`,
  original: "ಮೂಲ",
  translation: "ಅನುವಾದ",
  sanskrit: "ಸಂಸ್ಕೃತ",
  language: "ಭಾಷೆ",
  noTranslation: "ಈ ಶ್ಲೋಕದ ಅನುವಾದ ಇನ್ನೂ ಲಭ್ಯವಿಲ್ಲ.",
  noCommentary: "ಈ ಶ್ಲೋಕಕ್ಕೆ ಈ ಭಾಷೆಯಲ್ಲಿ ವ್ಯಾಖ್ಯಾನ ಇನ್ನೂ ಲಭ್ಯವಿಲ್ಲ.",
  noSanskrit: "ಈ ಶ್ಲೋಕದ ಸಂಸ್ಕೃತ ಪಾಠ ಇನ್ನೂ ಲಭ್ಯವಿಲ್ಲ.",
  readingProgress: "ಓದುವ ಪ್ರಗತಿ",
  previousChapter: "ಹಿಂದಿನ ಅಧ್ಯಾಯ",
  nextChapter: "ಮುಂದಿನ ಅಧ್ಯಾಯ",
  allChapters: "ಎಲ್ಲಾ ಅಧ್ಯಾಯಗಳು",
  previousVerse: "ಹಿಂದಿನ",
  nextVerse: "ಮುಂದಿನ",
  jump: "ಹೋಗಿ",
  go: "ಹೋಗಿ",
  readIn: "ಈ ಭಾಷೆಯಲ್ಲಿ ಓದಿ",
  jumpToVerse: "ಯಾವುದೇ ಶ್ಲೋಕಕ್ಕೆ ಹೋಗಿ",
  meaning: "ಪದಾರ್ಥಗಳು",
  commentary: "ವ್ಯಾಖ್ಯಾನ",
  copy: "ನಕಲು",
  copied: "ನಕಲಾಯಿತು",
  share: "ಹಂಚಿಕೊಳ್ಳಿ",
  bookmark: "ಬುಕ್‌ಮಾರ್ಕ್",
  bookmarked: "ಬುಕ್‌ಮಾರ್ಕ್ ಆಯಿತು",
  readingTime: "ಓದುವ ಸಮಯ",
  theme: "ವಿಷಯ",
  minutes: (n) => `${n} ನಿ`,
  reader: "ಓದುಗ",
  workTitles: { bg: "ಭಗವದ್ಗೀತೆ", quran: "ಖುರಾನ್", bible: "ಬೈಬಲ್" },
  workDescriptions: {
    bg: "ಪ್ರಭುವಿನ ಗೀತೆ — ಮಹಾಭಾರತದ ಹದಿನೆಂಟು ಅಧ್ಯಾಯಗಳಲ್ಲಿ ಏಳುನೂರು ಶ್ಲೋಕಗಳು.",
  },
});

const ta = build("ta", {
  tagline: "புனித நூல்களைத் தெளிவு, அமைதி, பக்தியுடன் வாசிக்கவும்.",
  beginReading: "வாசிக்கத் தொடங்குங்கள்",
  featuredScripture: "சிறப்பு நூல்",
  scriptures: "நூல்கள்",
  scripturesHint: "நூலகத்தில் வெளியிடப்பட்ட அனைத்து நூல்களும் இங்கே தோன்றும்.",
  scriptureSoon: "நூல்கள் விரைவில்",
  scriptureSoonHint: "பட்டியல் தயாரானதும் வெளியிடப்பட்ட நூல்கள் இங்கே தோன்றும்.",
  home: "முகப்பு",
  scripture: "நூல்",
  gitaTitle: "பகவத்கீதை",
  gitaBlurb: "பதினெட்டு அத்தியாயங்கள். ஒரு அத்தியாயத்தைத் தேர்ந்தெடுத்து, உங்கள் வேகத்தில் அமைதியாக வாசிக்கவும்.",
  read: "வாசிக்க",
  verses: "சுலோகங்கள்",
  verseSingular: "சுலோகம்",
  footer: "அனைத்து தேடுபவர்களுக்கும் பக்தியுடன் உருவாக்கப்பட்டது.",
  chapterFallback: (n) => `அத்தியாயம் ${n}`,
  original: "மூலம்",
  translation: "மொழிபெயர்ப்பு",
  sanskrit: "சமஸ்கிருதம்",
  language: "மொழி",
  noTranslation: "இந்த சுலோகத்திற்கு மொழிபெயர்ப்பு இன்னும் இல்லை.",
  noCommentary: "இந்த சுலோகத்திற்கு இந்த மொழியில் விளக்கம் இன்னும் இல்லை.",
  noSanskrit: "இந்த சுலோகத்திற்கு சமஸ்கிருத உரை இன்னும் இல்லை.",
  readingProgress: "வாசிப்பு முன்னேற்றம்",
  previousChapter: "முந்தைய அத்தியாயம்",
  nextChapter: "அடுத்த அத்தியாயம்",
  allChapters: "அனைத்து அத்தியாயங்கள்",
  previousVerse: "முந்தைய",
  nextVerse: "அடுத்த",
  jump: "செல்",
  go: "செல்",
  readIn: "இந்த மொழியில் வாசிக்க",
  jumpToVerse: "எந்த சுலோகத்திற்கும் செல்லுங்கள்",
  meaning: "சொற்பொருள்",
  commentary: "விளக்கம்",
  copy: "நகலெடு",
  copied: "நகலெடுக்கப்பட்டது",
  share: "பகிர்",
  bookmark: "புக்மார்க்",
  bookmarked: "புக்மார்க் செய்யப்பட்டது",
  readingTime: "வாசிப்பு நேரம்",
  theme: "கருப்பொருள்",
  minutes: (n) => `${n} நி`,
  reader: "வாசகர்",
  workTitles: { bg: "பகவத்கீதை", quran: "குர்ஆன்", bible: "விவிலியம்" },
  workDescriptions: {
    bg: "இறைவனின் பாடல் — மகாபாரதத்தின் பதினெட்டு அத்தியாயங்களில் எழுநூறு சுலோகங்கள்.",
  },
});

const ml = build("ml", {
  tagline: "പുണ്യഗ്രന്ഥങ്ങൾ വ്യക്തതയോടെയും ശാന്തിയോടെയും ഭക്തിയോടെയും വായിക്കൂ.",
  beginReading: "വായന ആരംഭിക്കുക",
  featuredScripture: "പ്രത്യേക ഗ്രന്ഥം",
  scriptures: "ഗ്രന്ഥങ്ങൾ",
  scripturesHint: "ലൈബ്രറിയിൽ പ്രസിദ്ധീകരിച്ച എല്ലാ ഗ്രന്ഥങ്ങളും ഇവിടെ കാണാം.",
  scriptureSoon: "ഗ്രന്ഥങ്ങൾ ഉടൻ",
  scriptureSoonHint: "കാറ്റലോഗ് തയ്യാറാകുമ്പോൾ പ്രസിദ്ധീകരിച്ച ഗ്രന്ഥങ്ങൾ ഇവിടെ കാണാം.",
  home: "ഹോം",
  scripture: "ഗ്രന്ഥം",
  gitaTitle: "ഭഗവദ്ഗീത",
  gitaBlurb: "പതിനെട്ട് അധ്യായങ്ങൾ. ഒരു അധ്യായം തിരഞ്ഞെടുത്ത് നിങ്ങളുടെ വേഗതയിൽ ശാന്തമായി വായിക്കൂ.",
  read: "വായിക്കുക",
  verses: "ശ്ലോകങ്ങൾ",
  verseSingular: "ശ്ലോകം",
  footer: "എല്ലാ അന്വേഷകർക്കുമായി ഭക്തിയോടെ നിർമ്മിച്ചത്.",
  chapterFallback: (n) => `അധ്യായം ${n}`,
  original: "മൂലം",
  translation: "വിവർത്തനം",
  sanskrit: "സംസ്കൃതം",
  language: "ഭാഷ",
  noTranslation: "ഈ ശ്ലോകത്തിന് വിവർത്തനം ഇതുവരെ ഇല്ല.",
  noCommentary: "ഈ ശ്ലോകത്തിന് ഈ ഭാഷയിൽ വ്യാഖ്യാനം ഇതുവരെ ഇല്ല.",
  noSanskrit: "ഈ ശ്ലോകത്തിന് സംസ്കൃത പാഠം ഇതുവരെ ഇല്ല.",
  readingProgress: "വായനാ പുരോഗതി",
  previousChapter: "മുൻ അധ്യായം",
  nextChapter: "അടുത്ത അധ്യായം",
  allChapters: "എല്ലാ അധ്യായങ്ങളും",
  previousVerse: "മുൻ",
  nextVerse: "അടുത്ത",
  jump: "പോകുക",
  go: "പോകുക",
  readIn: "ഈ ഭാഷയിൽ വായിക്കുക",
  jumpToVerse: "ഏത് ശ്ലോകത്തിലേക്കും പോകുക",
  meaning: "പദാർത്ഥങ്ങൾ",
  commentary: "വ്യാഖ്യാനം",
  copy: "പകർത്തുക",
  copied: "പകർത്തി",
  share: "പങ്കിടുക",
  bookmark: "ബുക്ക്മാർക്ക്",
  bookmarked: "ബുക്ക്മാർക്ക് ചെയ്തു",
  readingTime: "വായനാ സമയം",
  theme: "വിഷയം",
  minutes: (n) => `${n} മി`,
  reader: "വായനക്കാരൻ",
  workTitles: { bg: "ഭഗവദ്ഗീത", quran: "ഖുർആൻ", bible: "ബൈബിൾ" },
  workDescriptions: {
    bg: "പ്രഭുവിന്റെ ഗീതം — മഹാഭാരതത്തിലെ പതിനെട്ട് അധ്യായങ്ങളിലായി എഴുന്നൂറ് ശ്ലോകങ്ങൾ.",
  },
});

const or = build("or", {
  tagline: "ପବିତ୍ର ଗ୍ରନ୍ଥଗୁଡ଼ିକୁ ସ୍ପଷ୍ଟତା, ଶାନ୍ତି ଓ ଭକ୍ତି ସହିତ ପଢ଼ନ୍ତୁ।",
  beginReading: "ପଢ଼ିବା ଆରମ୍ଭ କରନ୍ତୁ",
  featuredScripture: "ବିଶେଷ ଗ୍ରନ୍ଥ",
  scriptures: "ଗ୍ରନ୍ଥଗୁଡ଼ିକ",
  scripturesHint: "ଲାଇବ୍ରେରୀରେ ପ୍ରକାଶିତ ସମସ୍ତ ଗ୍ରନ୍ଥ ଏଠାରେ ଦେଖାଯାଏ।",
  scriptureSoon: "ଗ୍ରନ୍ଥ ଶୀଘ୍ର ଆସୁଛି",
  scriptureSoonHint: "କ୍ୟାଟାଲଗ୍ ପ୍ରସ୍ତୁତ ହେଲେ ପ୍ରକାଶିତ ଗ୍ରନ୍ଥ ଏଠାରେ ଦେଖାଯିବ।",
  home: "ହୋମ୍",
  scripture: "ଗ୍ରନ୍ଥ",
  gitaTitle: "ଭଗବଦ୍ଗୀତା",
  gitaBlurb: "ଅଠର ଅଧ୍ୟାୟ। ଗୋଟିଏ ଅଧ୍ୟାୟ ବାଛନ୍ତୁ ଏବଂ ନିଜ ଗତିରେ ଶାନ୍ତିରେ ପଢ଼ନ୍ତୁ।",
  read: "ପଢ଼ନ୍ତୁ",
  verses: "ଶ୍ଲୋକ",
  verseSingular: "ଶ୍ଲୋକ",
  footer: "ସମସ୍ତ ଅନ୍ୱେଷକଙ୍କ ପାଇଁ ଭକ୍ତି ସହିତ ନିର୍ମିତ।",
  chapterFallback: (n) => `ଅଧ୍ୟାୟ ${n}`,
  original: "ମୂଳ",
  translation: "ଅନୁବାଦ",
  sanskrit: "ସଂସ୍କୃତ",
  language: "ଭାଷା",
  noTranslation: "ଏହି ଶ୍ଲୋକର ଅନୁବାଦ ଏପର୍ଯ୍ୟନ୍ତ ନାହିଁ।",
  noCommentary: "ଏହି ଶ୍ଲୋକର ଏହି ଭାଷାରେ ବ୍ୟାଖ୍ୟା ଏପର୍ଯ୍ୟନ୍ତ ନାହିଁ।",
  noSanskrit: "ଏହି ଶ୍ଲୋକର ସଂସ୍କୃତ ପାଠ ଏପର୍ଯ୍ୟନ୍ତ ନାହିଁ।",
  readingProgress: "ପଠନ ପ୍ରଗତି",
  previousChapter: "ପୂର୍ବ ଅଧ୍ୟାୟ",
  nextChapter: "ପରବର୍ତ୍ତୀ ଅଧ୍ୟାୟ",
  allChapters: "ସମସ୍ତ ଅଧ୍ୟାୟ",
  previousVerse: "ପୂର୍ବ",
  nextVerse: "ପର",
  jump: "ଯାଆନ୍ତୁ",
  go: "ଯାଆନ୍ତୁ",
  readIn: "ଏହି ଭାଷାରେ ପଢ଼ନ୍ତୁ",
  jumpToVerse: "ଯେକୌଣସି ଶ୍ଲୋକକୁ ଯାଆନ୍ତୁ",
  meaning: "ପଦାର୍ଥ",
  commentary: "ଟୀକା",
  copy: "କପି",
  copied: "କପି ହେଲା",
  share: "ସେୟାର୍",
  bookmark: "ବୁକମାର୍କ",
  bookmarked: "ବୁକମାର୍କ ହେଲା",
  readingTime: "ପଠନ ସମୟ",
  theme: "ବିଷୟ",
  minutes: (n) => `${n} ମି`,
  reader: "ପାଠକ",
  workTitles: { bg: "ଭଗବଦ୍ଗୀତା", quran: "କୁରଆନ୍", bible: "ବାଇବଲ୍" },
  workDescriptions: {
    bg: "ପ୍ରଭୁଙ୍କ ଗୀତ — ମହାଭାରତର ଅଠର ଅଧ୍ୟାୟରେ ସାତଶହ ଶ୍ଲୋକ।",
  },
});

const sa = build("sa", {
  ...en,
  tagline: "स्पष्टतया शान्त्या च भक्त्या च पवित्राणि शास्त्राणि पठन्तु।",
  beginReading: "पठनम् आरभ्यताम्",
  featuredScripture: "प्रमुखं शास्त्रम्",
  scriptures: "शास्त्राणि",
  scripturesHint: "प्रकाशितानि सर्वाणि शास्त्राणि अत्र दृश्यन्ते।",
  home: "गृहम्",
  scripture: "शास्त्रम्",
  gitaTitle: "भगवद्गीता",
  gitaBlurb: "अष्टादश अध्यायाः। एकम् अध्यायं वृणुत, स्वगत्या शान्त्या च पठत।",
  read: "पठतु",
  verses: "श्लोकाः",
  verseSingular: "श्लोकः",
  footer: "सर्वेषां साधकानां कृते भक्त्या निर्मितम्।",
  chapterFallback: (n) => `अध्यायः ${n}`,
  original: "मूलम्",
  translation: "अनुवादः",
  sanskrit: "संस्कृतम्",
  language: "भाषा",
  previousChapter: "पूर्वो अध्यायः",
  nextChapter: "अनन्तरो अध्यायः",
  allChapters: "सर्वे अध्यायाः",
  previousVerse: "पूर्वः",
  nextVerse: "अनन्तरः",
  jump: "गच्छतु",
  go: "गच्छतु",
  readIn: "अस्यां भाषायां पठतु",
  jumpToVerse: "यस्मिन् कस्मिन् अपि श्लोके गच्छतु",
  meaning: "पदार्थाः",
  commentary: "टीका",
  copy: "प्रतिलिपिः",
  copied: "प्रतिलिपितम्",
  share: "वितरयतु",
  bookmark: "चिह्नम्",
  bookmarked: "चिह्नितम्",
  readingTime: "पठनकालः",
  theme: "विषयः",
  minutes: (n) => `${n} नि`,
  reader: "पाठकः",
  workTitles: { bg: "भगवद्गीता", quran: "कुरआन", bible: "बाइबिल्" },
  workDescriptions: {
    bg: "भगवतः गीतम् — महाभारतस्य अष्टादशसु अध्यायेषु सप्तशतं श्लोकाः।",
  },
});

export const MESSAGE_CATALOG: Record<ReadingLanguageCode, Messages> = {
  en,
  sa,
  hi,
  te,
  kn,
  ta,
  ml,
  or,
};

export function getMessages(code: string): Messages {
  if (code in MESSAGE_CATALOG) {
    return MESSAGE_CATALOG[code as ReadingLanguageCode];
  }
  return en;
}
