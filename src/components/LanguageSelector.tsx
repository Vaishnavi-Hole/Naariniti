import React from 'react';
import { Language } from '../types';
import { Languages } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  compact = false,
}) => {
  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200/80">
      <span className="sr-only">Select language</span>
      {!compact && (
        <span className="flex items-center pl-2 pr-1 text-stone-500">
          <Languages className="w-4 h-4" />
        </span>
      )}
      <div className="flex items-center gap-1">
        {languages.map((l) => {
          const isActive = currentLanguage === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => onLanguageChange(l.code)}
              className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
              aria-pressed={isActive}
            >
              {l.native}
            </button>
          );
        })}
      </div>
    </div>
  );
};
