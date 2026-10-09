import React from 'react';
import { AppPage, Language } from '../types';
import { UI_STRINGS } from '../lib/translations';
import { LanguageSelector } from './LanguageSelector';
import { 
  Home, 
  Briefcase, 
  Bot, 
  Coins, 
  FileText, 
  CalendarCheck, 
  UserCircle2,
  Sparkles
} from 'lucide-react';

interface NavigationProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isLoggedIn: boolean;
  onAuthToggle: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
  language,
  onLanguageChange,
  isLoggedIn,
  onAuthToggle,
}) => {
  const strings = UI_STRINGS[language];

  const mainNavItems: { id: AppPage; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'landing', label: strings.home, icon: Home },
    { id: 'dashboard', label: strings.myBusiness, icon: Briefcase },
    { id: 'mentor', label: strings.aiMentor, icon: Bot },
    { id: 'schemes', label: strings.findFunding, icon: Coins },
    { id: 'documents', label: strings.myDocuments, icon: FileText },
    { id: 'action-plan', label: strings.actionPlan, icon: CalendarCheck },
  ];

  return (
    <>
      {/* Top Navigation Bar adhering to Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Zone 1: Single text element wordmark in display face */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('landing')}
              className="group flex items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-emerald-800 rounded-lg"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-900 text-amber-300 flex items-center justify-center font-serif text-xl font-bold shadow-xs transition-transform group-hover:scale-105">
                ना
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-emerald-950">
                {strings.appName}
              </span>
            </button>
          </div>

          {/* Zone 2: 4-6 text navigation links with subtle underline/active state */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-stone-700">
            {mainNavItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`relative py-1 whitespace-nowrap transition-colors min-h-[44px] flex items-center ${
                    isActive
                      ? 'text-emerald-900 font-bold border-b-2 border-emerald-900'
                      : 'text-stone-700 hover:text-emerald-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={onLanguageChange}
              compact
            />

            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className={`min-h-[44px] px-3 py-1.5 flex items-center gap-2 rounded-xl text-xs font-semibold border transition-all ${
                  currentPage === 'profile'
                    ? 'bg-emerald-900 text-white border-emerald-900'
                    : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-100'
                }`}
                title={strings.profile}
              >
                <UserCircle2 className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">{strings.profile}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-900 text-white hover:bg-emerald-800 transition-colors shadow-xs whitespace-nowrap"
              >
                {strings.login}
              </button>
            )}

            {!isLoggedIn && (
              <button
                type="button"
                onClick={() => onNavigate('wizard')}
                className="hidden sm:inline-flex min-h-[44px] items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-xs whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>{strings.getStarted}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar for touch-first thumb navigation */}
      <nav 
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-50/95 backdrop-blur-md border-t border-stone-200 shadow-lg pb-safe"
      >
        <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
          {mainNavItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors ${
                  isActive ? 'text-emerald-900 font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-emerald-900' : 'text-stone-500'}`} />
                <span className="text-[10px] tracking-tight mt-1 truncate max-w-[64px]">
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-900 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
