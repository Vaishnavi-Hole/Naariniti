import React, { useState } from 'react';
import { Language, BusinessSector } from '../types';
import { UI_STRINGS } from '../lib/translations';
import { BUSINESS_SECTORS_META } from '../lib/constants';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { VoiceControls } from '../components/VoiceControls';
import { 
  ArrowRight, 
  ArrowLeft, 
  IndianRupee, 
  Store, 
  Home, 
  Truck, 
  Check, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface OnboardingWizardPageProps {
  language: Language;
  onCompleteWizard: (projectData: any) => void;
  onCancel: () => void;
}

export const OnboardingWizardPage: React.FC<OnboardingWizardPageProps> = ({
  language,
  onCompleteWizard,
  onCancel,
}) => {
  const strings = UI_STRINGS[language];
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Form State
  const [selectedSector, setSelectedSector] = useState<BusinessSector>('food_snacks');
  const [customIdeaText, setCustomIdeaText] = useState('Breakfast poha, vadapav, and tea stall');
  const [investmentBudget, setInvestmentBudget] = useState(30000);
  const [operationMode, setOperationMode] = useState<'stall' | 'home' | 'rented_shop' | 'mobile_cart'>('stall');
  const [hasWorkspace, setHasWorkspace] = useState(false);
  const [isFirstBusiness, setIsFirstBusiness] = useState(true);
  const [monthlyTargetIncome, setMonthlyTargetIncome] = useState(15000);
  const [locationText, setLocationText] = useState('Shirur Market Road, Pune Rural');

  const stepTitles: Record<number, { en: string; hi: string; mr: string }> = {
    1: {
      en: 'What kind of business would you like to start?',
      hi: 'आप किस प्रकार का व्यवसाय शुरू करना चाहती हैं?',
      mr: 'तुम्हाला कोणत्या प्रकारचा व्यवसाय सुरू करायचा आहे?',
    },
    2: {
      en: 'How much money do you currently have available to invest?',
      hi: 'वर्तमान में आपके पास निवेश करने के लिए कितनी पूंजी उपलब्ध है?',
      mr: 'सध्या तुमच्याकडे व्यवसायात गुंतवण्यासाठी किती पैसे उपलब्ध आहेत?',
    },
    3: {
      en: 'Where and how would you like to operate your business?',
      hi: 'आप अपना व्यवसाय कहां और किस प्रकार संचालित करना चाहेंगी?',
      mr: 'तुम्ही तुमचा व्यवसाय कोठून आणि कसा चालवणार आहात?',
    },
    4: {
      en: 'Is this your first business, and do you have any equipment ready?',
      hi: 'क्या यह आपका पहला व्यवसाय है, और क्या आपके पास कोई उपकरण उपलब्ध हैं?',
      mr: 'हा तुमचा पहिला व्यवसाय आहे का, आणि काही साहित्य अगोदरच उपलब्ध आहे का?',
    },
    5: {
      en: 'How much monthly profit or income are you hoping to generate?',
      hi: 'आप प्रति माह कितना लाभ या आमदनी कमाने की उम्मीद करती हैं?',
      mr: 'तुम्हाला दरमहा अंदाजे किती नफा किंवा उत्पन्न मिळण्याची अपेक्षा आहे?',
    },
  };

  const currentQuestionText = stepTitles[currentStep][language] || stepTitles[currentStep].en;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onCompleteWizard({
        sector: selectedSector,
        ideaDescription: customIdeaText,
        budget: investmentBudget,
        operationMode,
        hasWorkspace,
        isFirstBusiness,
        monthlyTargetIncome,
        location: locationText,
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onCancel();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header & Step Tracker */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="min-h-[44px] px-3 text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{strings.back}</span>
          </button>
          <span className="text-xs font-bold text-emerald-950 font-serif">
            Let's Start Your Business
          </span>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-stone-500 hover:text-stone-800"
          >
            Exit
          </button>
        </div>

        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepPrefix={strings.step}
          ofLabel={strings.of}
        />
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-xs space-y-6">
        
        {/* Question Header & Voice Audio Control */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-950 leading-snug">
              {currentQuestionText}
            </h2>
            <VoiceControls
              language={language}
              textToRead={currentQuestionText}
              onTranscriptionComplete={(text) => {
                if (currentStep === 1) setCustomIdeaText(text);
                if (currentStep === 3) setLocationText(text);
              }}
            />
          </div>
          <p className="text-xs text-stone-500">
            Select one option below or tap the microphone to speak your answer.
          </p>
        </div>

        {/* STEP 1: CATEGORY SELECTION */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BUSINESS_SECTORS_META.map((sec) => {
                const isSelected = selectedSector === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      setSelectedSector(sec.id as BusinessSector);
                      setCustomIdeaText(sec.desc[language] || sec.desc.en);
                    }}
                    className={`min-h-[72px] p-4 rounded-2xl border-2 text-left transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'border-emerald-900 bg-emerald-50/50 shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm text-stone-900">
                        {sec.title[language] || sec.title.en}
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                        {sec.desc[language] || sec.desc.en}
                      </div>
                      <div className="text-[11px] font-mono text-emerald-900 font-semibold mt-1">
                        From ₹{sec.minBudget.toLocaleString('en-IN')}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-emerald-900 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Describe your specific idea (optional):
              </label>
              <input
                type="text"
                value={customIdeaText}
                onChange={(e) => setCustomIdeaText(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                placeholder="e.g. Small tea and poha corner near market bus stop"
              />
            </div>
          </div>
        )}

        {/* STEP 2: AVAILABLE INVESTMENT BUDGET */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center py-4 bg-stone-50 rounded-2xl border border-stone-200/80">
              <div className="text-xs text-stone-500 font-medium">Your current available savings</div>
              <div className="font-serif text-3xl font-bold text-emerald-950 mt-1 flex items-center justify-center gap-1">
                <IndianRupee className="w-6 h-6 text-emerald-800" />
                <span className="tabular-nums">{investmentBudget.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Zero collateral Mudra loan can top up this amount up to ₹50,000!
              </div>
            </div>

            {/* Quick preset buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[15000, 30000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setInvestmentBudget(amt)}
                  className={`min-h-[48px] py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    investmentBudget === amt
                      ? 'bg-emerald-900 text-white border-emerald-900'
                      : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  ₹{amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <input
                type="range"
                min="5000"
                max="200000"
                step="5000"
                value={investmentBudget}
                onChange={(e) => setInvestmentBudget(Number(e.target.value))}
                className="w-full accent-emerald-900 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-stone-400 font-mono">
                <span>₹5,000</span>
                <span>₹50,000 (Mudra Shishu)</span>
                <span>₹2,00,000</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: LOCATION & WORKSPACE */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'stall', title: 'Roadside Stall / Cart', icon: Store, desc: 'Market road, bus stop, near schools or offices' },
                { id: 'home', title: 'Home Based', icon: Home, desc: 'Save on rent, manage family duties alongside' },
                { id: 'rented_shop', title: 'Rented Small Shop', icon: Store, desc: 'Dedicated space with monthly lease agreement' },
                { id: 'mobile_cart', title: 'Mobile Cycle / Cart', icon: Truck, desc: 'Move to where customers gather during peak hours' },
              ].map((opt) => {
                const isSelected = operationMode === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setOperationMode(opt.id as any)}
                    className={`min-h-[70px] p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-emerald-900 bg-emerald-50/50'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-stone-900">{opt.title}</div>
                      <div className="text-xs text-stone-500">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Your Village / Town or Preferred Market Location:
              </label>
              <input
                type="text"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                placeholder="e.g. Shirur, Pune District"
              />
            </div>
          </div>
        )}

        {/* STEP 4: EXPERIENCE & EXISTING ASSETS */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-800">Is this your first time running a business?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsFirstBusiness(true)}
                  className={`min-h-[48px] p-3 rounded-xl border text-xs font-semibold ${
                    isFirstBusiness ? 'bg-emerald-900 text-white border-emerald-900' : 'bg-white border-stone-200'
                  }`}
                >
                  Yes, First Business (New)
                </button>
                <button
                  type="button"
                  onClick={() => setIsFirstBusiness(false)}
                  className={`min-h-[48px] p-3 rounded-xl border text-xs font-semibold ${
                    !isFirstBusiness ? 'bg-emerald-900 text-white border-emerald-900' : 'bg-white border-stone-200'
                  }`}
                >
                  I have past experience
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-stone-800">Do you already have a shop or dedicated space?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setHasWorkspace(true)}
                  className={`min-h-[48px] p-3 rounded-xl border text-xs font-semibold ${
                    hasWorkspace ? 'bg-emerald-900 text-white border-emerald-900' : 'bg-white border-stone-200'
                  }`}
                >
                  Yes, have spot/space
                </button>
                <button
                  type="button"
                  onClick={() => setHasWorkspace(false)}
                  className={`min-h-[48px] p-3 rounded-xl border text-xs font-semibold ${
                    !hasWorkspace ? 'bg-emerald-900 text-white border-emerald-900' : 'bg-white border-stone-200'
                  }`}
                >
                  No, need to find one
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: MONTHLY INCOME GOAL */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="text-center py-4 bg-stone-50 rounded-2xl border border-stone-200/80">
              <div className="text-xs text-stone-500 font-medium">Desired monthly take-home profit</div>
              <div className="font-serif text-3xl font-bold text-emerald-950 mt-1 flex items-center justify-center gap-1">
                <IndianRupee className="w-6 h-6 text-emerald-800" />
                <span className="tabular-nums">{monthlyTargetIncome.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Around ₹500 - ₹600 daily net profit from 60-80 cups of tea and snacks
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[8000, 15000, 25000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setMonthlyTargetIncome(amt)}
                  className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-semibold border ${
                    monthlyTargetIncome === amt
                      ? 'bg-emerald-900 text-white border-emerald-900'
                      : 'bg-white border-stone-200'
                  }`}
                >
                  ₹{amt.toLocaleString('en-IN')} / mo
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation CTAs */}
        <div className="pt-4 flex items-center justify-between gap-3 border-t border-stone-100">
          <button
            type="button"
            onClick={handleBack}
            className="min-h-[48px] px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-xl"
          >
            {strings.back}
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="min-h-[48px] px-6 py-2.5 rounded-xl bg-emerald-900 text-white font-semibold text-xs hover:bg-emerald-800 shadow-md flex items-center gap-2"
          >
            <span>{currentStep === totalSteps ? strings.finish : strings.next}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
