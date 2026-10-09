import React from 'react';
import { GovernmentScheme, Language } from '../types';
import { UI_STRINGS } from '../lib/translations';
import { CriterionResultRow, EligibilityStatusBadge } from '../components/EligibilityStatusBadge';
import { SourceCitation } from '../components/SourceCitation';
import { 
  ArrowLeft, 
  ExternalLink, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  IndianRupee, 
  Layers 
} from 'lucide-react';

interface SchemeDetailPageProps {
  scheme: GovernmentScheme;
  language: Language;
  onBack: () => void;
  onGoToDocuments: (schemeId?: string) => void;
}

export const SchemeDetailPage: React.FC<SchemeDetailPageProps> = ({
  scheme,
  language,
  onBack,
  onGoToDocuments,
}) => {
  const strings = UI_STRINGS[language];

  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24">
      
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-3 text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Schemes</span>
        </button>
      </div>

      {/* Scheme Title & Eligibility Hero */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 font-mono">
              {scheme.schemeType.toUpperCase()} SCHEME
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950">
              {scheme.popularName}
            </h1>
            <p className="text-xs text-stone-600 font-medium">{scheme.officialName}</p>
          </div>

          <div className="text-right">
            <EligibilityStatusBadge status={scheme.overallStatus} language={language} />
            <div className="text-[11px] text-stone-400 mt-1">Status verified deterministically</div>
          </div>
        </div>

        {/* Financial terms */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-100">
          <div className="p-3 bg-stone-50 rounded-xl">
            <div className="text-[11px] text-stone-500">Maximum Funding</div>
            <div className="font-serif text-lg font-bold text-emerald-950 tabular-nums">
              {formatINR(scheme.maxFundingAmountINR)}
            </div>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl">
            <div className="text-[11px] text-stone-500">Interest Rate</div>
            <div className="font-serif text-lg font-bold text-stone-900 tabular-nums">
              {scheme.interestRateAnnualPercent ? `${scheme.interestRateAnnualPercent}% p.a.` : 'N/A'}
            </div>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl">
            <div className="text-[11px] text-stone-500">Subsidy / Margin</div>
            <div className="font-serif text-lg font-bold text-emerald-950 tabular-nums">
              {scheme.subsidyPercentage ? `${scheme.subsidyPercentage}% Subsidy` : '0%'}
            </div>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl">
            <div className="text-[11px] text-stone-500">Collateral (तारण)</div>
            <div className="font-serif text-lg font-bold text-stone-900">
              {scheme.collateralRequired ? 'Required' : 'Zero Collateral'}
            </div>
          </div>
        </div>

        <p className="text-xs text-stone-700 leading-relaxed pt-2">
          {scheme.description}
        </p>

        {/* Source citation */}
        <SourceCitation
          authority={scheme.implementingAuthority}
          officialUrl={scheme.officialSourceUrl}
          lastVerifiedDate={scheme.lastVerifiedDate}
          isDemonstration={scheme.recordStatus === 'demonstration'}
          sourceExcerpt={scheme.sourceExcerpt}
          language={language}
        />

        {/* Official Portal CTA */}
        <div className="pt-2">
          <a
            href={scheme.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-900 text-white font-semibold text-xs hover:bg-emerald-800 transition-colors shadow-xs"
          >
            <span>{strings.applyNow}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Deterministic Criteria Breakdown */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-800" />
              <span>Deterministic Criteria Evaluation (Phase 6)</span>
            </h2>
            <EligibilityStatusBadge status={scheme.overallStatus} language={language} />
          </div>
          <p className="text-xs text-stone-500">
            Rules evaluated deterministically across pass, fail, unknown, and not-applicable states. Missing profile values are never assumed to pass.
          </p>
        </div>

        {/* Missing Information Callout if any */}
        {scheme.missingInformation && scheme.missingInformation.length > 0 && (
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-amber-900">
              <Layers className="w-4 h-4 text-amber-800" />
              <span>Missing Information Requiring Verification:</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5 text-amber-900">
              {scheme.missingInformation.map((item, idx) => (
                <li key={idx} className="font-mono text-[11px]">{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="divide-y divide-stone-100">
          {scheme.criteria.map((c) => (
            <CriterionResultRow
              key={c.id}
              status={c.status}
              label={c.label}
              explanation={c.explanation}
              userValue={c.userValue}
              requiredRule={c.requiredRule}
              language={language}
            />
          ))}
        </div>

        {/* Evidence References */}
        {scheme.evidenceReferences && scheme.evidenceReferences.length > 0 && (
          <div className="pt-3 border-t border-stone-100 space-y-1 text-xs text-stone-600">
            <div className="font-semibold text-stone-800">Verified Evidence Citations:</div>
            <ul className="space-y-1 pl-1">
              {scheme.evidenceReferences.map((ref, idx) => (
                <li key={idx} className="text-[11px] font-mono text-stone-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>{ref}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Preliminary Legal Disclaimer */}
        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 italic leading-relaxed">
          <strong>Preliminary Assessment Notice:</strong> {scheme.preliminaryDisclaimer || 'Preliminary automated assessment based solely on declared profile and business project data. Official authorities, implementing banks, and nodal agencies make the final binding determination upon physical verification and document submission.'}
        </div>
      </div>

      {/* Required Documents Section */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-800" />
              <span>Required Documents for This Scheme</span>
            </h2>
            <p className="text-xs text-stone-500">
              Only verified mandatory requirements from official scheme guidelines.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onGoToDocuments(scheme.id)}
            className="text-xs font-semibold text-emerald-900 hover:text-emerald-950 underline underline-offset-4"
          >
            Generate Checklist for This Scheme
          </button>
        </div>

        <ul className="space-y-2 text-xs text-stone-700">
          {scheme.requiredDocuments.map((doc, i) => (
            <li key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{doc}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};
