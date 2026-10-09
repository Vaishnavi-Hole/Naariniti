import { Language } from '../types';

export const UI_STRINGS: Record<Language, {
  appName: string;
  tagline: string;
  home: string;
  myBusiness: string;
  aiMentor: string;
  findFunding: string;
  myDocuments: string;
  actionPlan: string;
  profile: string;
  signup: string;
  login: string;
  logout: string;
  getStarted: string;
  startWizard: string;
  resumeProject: string;
  switchLanguage: string;
  voiceAssistant: string;
  voiceListening: string;
  voiceSpeak: string;
  voiceStop: string;
  voiceConfirmTitle: string;
  voiceConfirmBtn: string;
  voiceCancelBtn: string;
  step: string;
  of: string;
  back: string;
  next: string;
  finish: string;
  saveProgress: string;
  budgetLabel: string;
  locationLabel: string;
  verifiedOfficial: string;
  demonstrationData: string;
  developmentState: string;
  developmentNotice: string;
  checkEligibility: string;
  whyRecommended: string;
  officialSource: string;
  lastVerified: string;
  applyNow: string;
  viewDetails: string;
  statusPass: string;
  statusFail: string;
  statusUnknown: string;
  statusNotApplicable: string;
  eligible: string;
  potentiallyEligible: string;
  ineligible: string;
  insufficientData: string;
  docAvailable: string;
  docNeeded: string;
  docInProgress: string;
  docNotApplicable: string;
  reqMandatory: string;
  reqConditional: string;
  reqOptional: string;
  markCompleted: string;
  completed: string;
  daysRemaining: string;
  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;
}> = {
  en: {
    appName: 'Nariniti',
    tagline: 'Your AI Entrepreneurship Partner for Financial Independence',
    home: 'Home',
    myBusiness: 'My Business',
    aiMentor: 'AI Mentor',
    findFunding: 'Find Funding',
    myDocuments: 'Documents',
    actionPlan: '30-Day Plan',
    profile: 'Profile',
    signup: 'Create Account',
    login: 'Sign In',
    logout: 'Log Out',
    getStarted: 'Start Your Business Journey',
    startWizard: 'Start Guided Business Discovery',
    resumeProject: 'Resume My Business Plan',
    switchLanguage: 'Language',
    voiceAssistant: 'Voice Guide',
    voiceListening: 'Listening to your voice... Speak now',
    voiceSpeak: 'Read Aloud',
    voiceStop: 'Stop Audio',
    voiceConfirmTitle: 'Check Your Spoken Words',
    voiceConfirmBtn: 'Confirm & Send',
    voiceCancelBtn: 'Cancel & Re-record',
    step: 'Step',
    of: 'of',
    back: 'Previous',
    next: 'Continue',
    finish: 'Complete & View Plan',
    saveProgress: 'Progress Saved',
    budgetLabel: 'Available Budget',
    locationLabel: 'Your Location',
    verifiedOfficial: 'Verified Official Scheme',
    demonstrationData: 'Demonstration Record · Phase 1 Shell',
    developmentState: 'FastAPI Backend Pending (Phase 3)',
    developmentNotice: 'AI inference will connect to your Google Colab FastAPI server in Phase 3. Non-AI tools, document tracking, and verified schemes are fully functional.',
    checkEligibility: 'Check Eligibility',
    whyRecommended: 'Why is this recommended?',
    officialSource: 'Official Portal',
    lastVerified: 'Last Verified',
    applyNow: 'Apply on Official Portal',
    viewDetails: 'View Complete Guidelines',
    statusPass: 'Requirement Met (Pass)',
    statusFail: 'Requirement Not Met (Fail)',
    statusUnknown: 'Verification Needed (Unknown)',
    statusNotApplicable: 'Not Applicable',
    eligible: 'Appears Eligible',
    potentiallyEligible: 'Potentially Eligible',
    ineligible: 'Appears Ineligible',
    insufficientData: 'Data Incomplete',
    docAvailable: 'Ready with Me',
    docNeeded: 'Need to Obtain',
    docInProgress: 'Application in Progress',
    docNotApplicable: 'Not Applicable',
    reqMandatory: 'Mandatory Requirement',
    reqConditional: 'Conditional Requirement',
    reqOptional: 'Optional / Recommended',
    markCompleted: 'Mark Done',
    completed: 'Completed',
    daysRemaining: 'Days Timeline',
    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',
  },
  hi: {
    appName: 'नारीनीति',
    tagline: 'महिला उद्यमियों के लिए आत्मनिर्भरता और व्यवसाय मार्गदर्शन',
    home: 'मुख्य पृष्ठ',
    myBusiness: 'मेरा व्यवसाय',
    aiMentor: 'एआई मेंटर',
    findFunding: 'सरकारी योजनाएं',
    myDocuments: 'कागजात',
    actionPlan: '30-दिन की योजना',
    profile: 'प्रोफ़ाइल',
    signup: 'नया खाता बनाएं',
    login: 'लॉग इन करें',
    logout: 'लॉग आउट',
    getStarted: 'अपना व्यवसाय शुरू करें',
    startWizard: 'व्यवसाय चयन सहायक शुरू करें',
    resumeProject: 'व्यवसाय योजना जारी रखें',
    switchLanguage: 'भाषा',
    voiceAssistant: 'आवाज़ सहायक',
    voiceListening: 'आपकी आवाज़ सुन रहे हैं... कृपया बोलें',
    voiceSpeak: 'सुनें (बोलकर पढ़ें)',
    voiceStop: 'आवाज़ रोकें',
    voiceConfirmTitle: 'बोले गए शब्दों की पुष्टि करें',
    voiceConfirmBtn: 'पुष्टि करें',
    voiceCancelBtn: 'रद्द करें व पुनः बोलें',
    step: 'चरण',
    of: 'का',
    back: 'पिछला',
    next: 'आगे बढ़ें',
    finish: 'योजना पूरी करें',
    saveProgress: 'प्रगति सहेजी गई',
    budgetLabel: 'उपलब्ध पूंजी',
    locationLabel: 'आपका स्थान',
    verifiedOfficial: 'सत्यापित सरकारी योजना',
    demonstrationData: 'डेमो डेटा · फेज़ 1 शैल',
    developmentState: 'फास्टएपीआई बैकएंड प्रतीक्षित (फेज़ 3)',
    developmentNotice: 'एआई मॉडल का संबंध फेज़ 3 में आपके गूगल कोलैब फास्टएपीआई से होगा। वर्तमान में गैर-एआई योजनाएं, कागजात और कार्य योजना पूरी तरह सक्रिय हैं।',
    checkEligibility: 'पात्रता जांचें',
    whyRecommended: 'यह सिफारिश क्यों की गई?',
    officialSource: 'आधिकारिक पोर्टल',
    lastVerified: 'अंतिम सत्यापन',
    applyNow: 'आधिकारिक पोर्टल पर आवेदन करें',
    viewDetails: 'विस्तृत विवरण देखें',
    statusPass: 'शर्त पूरी हुई (पास)',
    statusFail: 'शर्त पूरी नहीं हुई (फेल)',
    statusUnknown: 'पुष्टि आवश्यक (अज्ञात)',
    statusNotApplicable: 'लागू नहीं',
    eligible: 'पात्र प्रतीत होते हैं',
    potentiallyEligible: 'संभावित रूप से पात्र',
    ineligible: 'वर्तमान में अपात्र',
    insufficientData: 'जानकारी अधूरी है',
    docAvailable: 'मेरे पास मौजूद है',
    docNeeded: 'बनवाना शेष है',
    docInProgress: 'प्रक्रिया जारी है',
    docNotApplicable: 'लागू नहीं',
    reqMandatory: 'अनिवार्य शर्त',
    reqConditional: 'शर्त के अधीन (सशर्त)',
    reqOptional: 'वैकल्पिक / अनुशंसित',
    markCompleted: 'पूर्ण चिह्नित करें',
    completed: 'पूर्ण हुआ',
    daysRemaining: 'दिन समय-सीमा',
    greetingMorning: 'शुभ प्रभात',
    greetingAfternoon: 'शुभ दोपहर',
    greetingEvening: 'शुभ संध्या',
  },
  mr: {
    appName: 'नारीनीती',
    tagline: 'महिलांच्या स्वावलंबनासाठी व व्यवसायासाठी हक्काचा मार्गदर्शक',
    home: 'मुख्य पान',
    myBusiness: 'माझा व्यवसाय',
    aiMentor: 'मार्गदर्शक (AI)',
    findFunding: 'सरकारी योजना',
    myDocuments: 'कागदपत्रे',
    actionPlan: '३० दिवसांची योजना',
    profile: 'माझी माहिती',
    signup: 'खाते उघडा',
    login: 'लॉगिन करा',
    logout: 'लॉगआउट',
    getStarted: 'नवीन व्यवसाय सुरू करा',
    startWizard: 'व्यवसाय निवड मदतनीस सुरू करा',
    resumeProject: 'माझा व्यवसाय पुढे सुरू ठेवा',
    switchLanguage: 'भाषा',
    voiceAssistant: 'आवाज सहाय्यक',
    voiceListening: 'आवाज ऐकत आहे... कृपया बोला',
    voiceSpeak: 'ऐका (वाचून दाखवा)',
    voiceStop: 'आवाज थांबवा',
    voiceConfirmTitle: 'बोललेल्या शब्दांची खात्री करा',
    voiceConfirmBtn: 'खात्री करून पाठवा',
    voiceCancelBtn: 'रद्द करून पुन्हा बोला',
    step: 'टप्पा',
    of: 'पैकी',
    back: 'मागे जा',
    next: 'पुढे जा',
    finish: 'योजना पूर्ण करा',
    saveProgress: 'प्रगती जतन केली',
    budgetLabel: 'उपलब्ध भांडवल',
    locationLabel: 'तुमचे गाव/तालुका',
    verifiedOfficial: 'अधिकृत शासकीय योजना',
    demonstrationData: 'डेमो डेटा · टप्पा १ शेल',
    developmentState: 'फास्टएपीआय बॅकएंड प्रलंबित (टप्पा ३)',
    developmentNotice: 'एआय मॉडेल्स टप्पा ३ मध्ये तुमच्या गुगल कोलॅब फास्टएपीआय सर्व्हरशी जोडले जातील. इतर शासकीय योजना, कागदपत्रे व कृती आराखडा पूर्ण कार्यरत आहेत.',
    checkEligibility: 'पात्रता तपासा',
    whyRecommended: 'ही शिफारस का केली?',
    officialSource: 'अधिकृत पोर्टल',
    lastVerified: 'शेवटची पडताळणी',
    applyNow: 'अधिकृत पोर्टलवर अर्ज करा',
    viewDetails: 'सविस्तर माहिती पहा',
    statusPass: 'अट पूर्ण झाली (पास)',
    statusFail: 'अट पूर्ण नाही (अपात्र)',
    statusUnknown: 'पडताळणी बाकी (माहिती आवश्यक)',
    statusNotApplicable: 'लागू नाही',
    eligible: 'पात्र दिसत आहात',
    potentiallyEligible: 'संभाव्य पात्र (अधिक माहिती हवी)',
    ineligible: 'सध्याच्या अटीनुसार अपात्र',
    insufficientData: 'माहिती अपूर्ण आहे',
    docAvailable: 'माझ्याकडे उपलब्ध आहे',
    docNeeded: 'काढायचे आहे',
    docInProgress: 'अर्ज केला आहे',
    docNotApplicable: 'लागू नाही',
    reqMandatory: 'अनिवार्य कागदपत्र',
    reqConditional: 'सशर्त कागदपत्र',
    reqOptional: 'पर्यायी / शिफारस केलेले',
    markCompleted: 'पूर्ण झाले',
    completed: 'पूर्ण',
    daysRemaining: 'दिवस वेळापत्रक',
    greetingMorning: 'शुभ सकाळ',
    greetingAfternoon: 'शुभ दुपार',
    greetingEvening: 'शुभ संध्याकाळ',
  },
};
