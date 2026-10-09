import React from 'react';
import { ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { Language } from '../types';
import { UI_STRINGS } from '../lib/translations';

interface SourceCitationProps {
  authority: string;
  officialUrl: string;
  lastVerifiedDate: string;
  isDemonstration?: boolean;
  sourceExcerpt?: string;
  language: Language;
}

export const SourceCitation: React.FC<SourceCitationProps> = ({
  authority,
  officialUrl,
  lastVerifiedDate,
  isDemonstration = false,
  sourceExcerpt,
  language,
}) => {
  const strings = UI_STRINGS[language];

  return (
    <div className="pt-2 text-xs space-y-1.5 text-stone-600">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-medium text-stone-800">{authority}</span>
        <span aria-hidden="true" className="text-stone-300">·</span>
        <span>{strings.lastVerified}: {lastVerifiedDate}</span>
        <span aria-hidden="true" className="text-stone-300">·</span>
        <a
          href={officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-semibold underline underline-offset-2"
        >
          <span>{strings.officialSource}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="flex items-center gap-2 text-[11px]">
        {isDemonstration ? (
          <span className="inline-flex items-center gap-1 text-amber-800 font-medium">
            <AlertCircle className="w-3 h-3" />
            {strings.demonstrationData}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-emerald-800 font-medium">
            <ShieldCheck className="w-3 h-3" />
            {strings.verifiedOfficial}
          </span>
        )}
      </div>

      {sourceExcerpt && (
        <blockquote className="pl-3 border-l-2 border-stone-300 italic text-[11px] text-stone-600 font-serif">
          "{sourceExcerpt}"
        </blockquote>
      )}
    </div>
  );
};
