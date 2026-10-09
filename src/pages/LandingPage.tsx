import React from 'react';
import { Language } from '../types';
import { UI_STRINGS } from '../lib/translations';
import { HERO_IMAGE, BUSINESS_SECTORS_META } from '../lib/constants';
import { VoiceControls } from '../components/VoiceControls';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Compass, 
  Users, 
  Coins, 
  CheckCircle2,
  FileCheck
} from 'lucide-react';

interface LandingPageProps {
  language: Language;
  onStartWizard: () => void;
  onExploreSchemes: () => void;
  onViewDashboard: () => void;
  isLoggedIn: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  language,
  onStartWizard,
  onExploreSchemes,
  onViewDashboard,
  isLoggedIn,
}) => {
  const strings = UI_STRINGS[language];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-100/80 to-transparent pt-6 sm:pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Unboxed Kicker */}
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900 tracking-wide uppercase">
                <span>Empowering Women Micro-Entrepreneurs</span>
                <span aria-hidden="true">·</span>
                <span>Rural & Semi-Urban India</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-950 leading-[1.15] text-balance">
                {language === 'mr'
                  ? 'तुमचा स्वतःचा व्यवसाय सुरू करा, सरकारी पाठबळ आणि योग्य मार्गदर्शनासह.'
                  : language === 'hi'
                  ? 'शुरू करें अपना खुद का व्यवसाय, सरकारी योजनाओं और सटीक मार्गदर्शन के साथ।'
                  : 'Start Your Business with Confidence, Verified Schemes, and Step-by-Step Guidance.'}
              </h1>

              <p className="text-sm sm:text-base text-stone-700 leading-relaxed max-w-2xl">
                {language === 'mr'
                  ? 'तुमच्याकडे ₹१०,००० असोत किंवा ₹५०,००० — नारीनीती तुम्हाला व्यवसाय निवडण्यापासून, सरकारी अनुदानाची पात्रता तपासण्यापर्यंत आणि ३० दिवसांचा प्रत्यक्ष कृती आराखडा बनवण्यापर्यंत मार्गदर्शन करते.'
                  : language === 'hi'
                  ? 'चाहे आपके पास ₹10,000 हों या ₹50,000 — नारीनीति आपको सही व्यवसाय चुनने, सरकारी ऋण व सब्सिडी की पात्रता जांचने और 30 दिन की कार्ययोजना तैयार करने में मदद करती है।'
                  : 'Tailored for women with big aspirations and real budgets. Calculate true costs, verify government scheme eligibility deterministically, and follow a practical 30-day action plan in your language.'}
              </p>

              {/* Voice Helper Bar */}
              <div className="bg-white/90 p-3.5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-stone-900">
                      {strings.voiceAssistant}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {language === 'mr' ? 'मराठीत ऐका किंवा बोला' : language === 'hi' ? 'हिंदी में सुनें या बोलें' : 'Listen or speak in Marathi, Hindi & English'}
                    </div>
                  </div>
                </div>

                <VoiceControls
                  language={language}
                  textToRead={
                    language === 'mr'
                      ? 'नारीनीतीमध्ये आपले स्वागत आहे. तुमचा नवीन व्यवसाय सुरू करण्यासाठी खालील हिरव्या बटणावर दाबा.'
                      : language === 'hi'
                      ? 'नारीनीति में आपका स्वागत है। अपना व्यवसाय शुरू करने के लिए नीचे दिए बटन को दबाएं।'
                      : 'Welcome to Nariniti. Press the button below to start your guided business discovery.'
                  }
                />
              </div>

              {/* Primary Call to Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onStartWizard}
                  className="min-h-[48px] px-6 py-3 rounded-xl bg-emerald-900 text-white font-semibold text-sm hover:bg-emerald-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <span>{strings.startWizard}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onExploreSchemes}
                  className="min-h-[48px] px-5 py-3 rounded-xl bg-white text-stone-900 font-semibold text-sm hover:bg-stone-100 border border-stone-300 transition-colors flex items-center gap-2"
                >
                  <Coins className="w-4 h-4 text-emerald-800" />
                  <span>{strings.findFunding}</span>
                </button>

                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={onViewDashboard}
                    className="min-h-[48px] px-4 py-3 rounded-xl text-stone-700 font-semibold text-xs hover:text-stone-950 underline underline-offset-4"
                  >
                    {strings.resumeProject}
                  </button>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-600">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>100% Verified Govt. Portals</span>
                </div>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>No Collateral Loans for Micro-Vendors</span>
                </div>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <div className="flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-700" />
                  <span>Clear Document Checklists</span>
                </div>
              </div>

            </div>

            {/* Right Column: Hero Visual */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border border-stone-200/90 shadow-lg bg-stone-100 aspect-[16/10] sm:aspect-[16/11]">
                <img
                  src={HERO_IMAGE}
                  alt="Indian woman micro-entrepreneur smiling proudly beside her organized tea and snack stall"
                  className="w-full h-full object-cover"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating Real-World Anchor */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-stone-200 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-stone-900">Sai Shakti Snacks Centre</div>
                      <div className="text-[11px] text-stone-600">Shirur, Pune Rural · ₹30,000 Budget</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-800">Mudra Shishu Ready</div>
                      <div className="text-[10px] text-stone-500 font-mono">0 Collateral Needed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Business Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-900">
            Micro-Enterprises You Can Start Today
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Practical Business Sectors for Rural & Semi-Urban Women
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Selected for realistic startup budgets between ₹10,000 and ₹50,000 with strong local demand.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BUSINESS_SECTORS_META.slice(0, 3).map((sec) => (
            <div
              key={sec.id}
              onClick={onStartWizard}
              className="group cursor-pointer bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {sec.image && (
                <div className="aspect-[16/9] w-full overflow-hidden bg-stone-100">
                  <img
                    src={sec.image}
                    alt={sec.title.en}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <div className="p-4 space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-bold text-stone-900">
                    {sec.title[language] || sec.title.en}
                  </h3>
                  <span className="text-xs font-mono font-semibold text-emerald-900">
                    From ₹{sec.minBudget.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {sec.desc[language] || sec.desc.en}
                </p>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between text-xs font-semibold text-emerald-900">
                <span>Explore This Plan</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 Core Pillars */}
      <section className="bg-stone-100/60 py-12 border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950">
              How Nariniti Guides Your Journey
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Not a generic chatbot. A deterministic, verified, and grounded business execution platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900">
                1. Guided Discovery
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                One question at a time. No overwhelming forms. Tailors options to your exact village, skills, and investment savings.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900">
                2. Real Scheme Eligibility
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Deterministic rules evaluation. Tells you honestly whether you Pass, Fail, or need extra documents—no fabricated promises.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900">
                3. 30-Day Action Roadmap
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Week-by-week manageable tasks from testing market demand and getting utensils to filing basic registrations.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-900 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900">
                4. Voice & Low-Literacy Care
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Built-in audio readout and speech recognition in Marathi, Hindi, and English so every sister can use it with ease.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 border-t border-stone-200/80 text-xs text-stone-500 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="font-serif text-base font-bold text-stone-900">Nariniti (नारीनीती)</div>
          <p>Public-interest entrepreneurship platform for Indian women micro-enterprises.</p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span>Phase 1 Foundation Shell</span>
          <span aria-hidden="true">·</span>
          <span>FastAPI Open-Source AI Architecture</span>
        </div>
      </footer>
    </div>
  );
};
