import React, { useState } from 'react';
import { GovernmentScheme, Language } from '../types';
import { UI_STRINGS } from '../lib/translations';
import { EligibilityStatusBadge } from './EligibilityStatusBadge';
import { SourceCitation } from './SourceCitation';
import { ChevronDown, ChevronUp, ArrowRight, ShieldAlert, Check } from 'lucide-react';

interface RecommendationCardProps {
  scheme: GovernmentScheme;
  language: Language;
  onSelectScheme?: (schemeId: string) => void;
  onViewEligibility?: (schemeId: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  scheme,
  language,
  onSelectScheme,
  onViewEligibility,
}) => {
  const [isWhyExpanded, setIsWhyExpanded] = useState(false);
  const strings = UI_STRINGS[language];

  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  return (
    <article className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs transition-shadow hover:shadow-sm space-y-4">
      {/* Header & Title */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug">
              {scheme.popularName}
            </h3>
            <p className="text-xs text-stone-500 font-medium">{scheme.officialName}</p>
          </div>
          <EligibilityStatusBadge status={scheme.overallStatus} language={language} />
        </div>

        {/* Unboxed Metadata Line */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-600 pt-1">
          <span className="font-medium text-emerald-950">
            Up to {formatINR(scheme.maxFundingAmountINR)}
          </span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span>{scheme.schemeType.toUpperCase()}</span>
          {scheme.interestRateAnnualPercent && (
            <>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="tabular-nums">{scheme.interestRateAnnualPercent}% p.a.</span>
            </>
          )}
          {scheme.subsidyPercentage && (
            <>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="tabular-nums text-emerald-800 font-semibold">{scheme.subsidyPercentage}% Subsidy</span>
            </>
          )}
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span>{scheme.collateralRequired ? 'Collateral Needed' : 'No Collateral Required'}</span>
        </div>
      </div>

      <p className="text-xs text-stone-700 leading-relaxed">
        {scheme.description}
      </p>

      {/* Why is this recommended drawer */}
      {scheme.whyRecommended && (
        <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/70 text-xs space-y-2">
          <button
            type="button"
            onClick={() => setIsWhyExpanded(!isWhyExpanded)}
            className="w-full flex items-center justify-between text-left font-semibold text-stone-900 group"
          >
            <span className="flex items-center gap-1.5 text-emerald-900 group-hover:text-emerald-950">
              <span>{strings.whyRecommended}</span>
            </span>
            {isWhyExpanded ? (
              <ChevronUp className="w-4 h-4 text-stone-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-500" />
            )}
          </button>

          {isWhyExpanded && (
            <div className="pt-1 text-stone-700 leading-relaxed border-t border-stone-200/60 mt-2 space-y-2">
              <p>{scheme.whyRecommended}</p>
              <div className="space-y-1 pt-1 text-[11px]">
                <div className="font-semibold text-stone-800">Criteria Check Snapshot:</div>
                {scheme.criteria.map((c) => (
                  <div key={c.id} className="flex items-start gap-1.5 text-stone-600">
                    {c.status === 'pass' && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />}
                    {c.status === 'fail' && <span className="w-3.5 h-3.5 text-rose-700 font-bold shrink-0 mt-0.5">✕</span>}
                    {c.status === 'unknown' && <span className="w-3.5 h-3.5 text-amber-700 font-bold shrink-0 mt-0.5">?</span>}
                    <span>{c.label} ({c.status})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Source Citation */}
      <SourceCitation
        authority={scheme.implementingAuthority}
        officialUrl={scheme.officialSourceUrl}
        lastVerifiedDate={scheme.lastVerifiedDate}
        isDemonstration={scheme.recordStatus === 'demonstration'}
        sourceExcerpt={scheme.sourceExcerpt}
        language={language}
      />

      {/* Actions */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
        <a
          href={scheme.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-emerald-900 hover:text-emerald-950 underline underline-offset-4"
        >
          {strings.applyNow}
        </a>

        <div className="flex items-center gap-2">
          {onViewEligibility && (
            <button
              type="button"
              onClick={() => onViewEligibility(scheme.id)}
              className="min-h-[44px] px-3.5 py-1.5 text-xs font-semibold rounded-xl text-stone-700 hover:bg-stone-100 border border-stone-200"
            >
              {strings.checkEligibility}
            </button>
          )}
          {onSelectScheme && (
            <button
              type="button"
              onClick={() => onSelectScheme(scheme.id)}
              className="min-h-[44px] px-4 py-1.5 text-xs font-semibold rounded-xl bg-emerald-900 text-white hover:bg-emerald-800 flex items-center gap-1.5 shadow-xs"
            >
              <span>{strings.viewDetails}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
