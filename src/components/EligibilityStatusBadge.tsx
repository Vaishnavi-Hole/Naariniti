import React from 'react';
import { OverallEligibility, CriterionStatus, Language } from '../types';
import { UI_STRINGS } from '../lib/translations';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

interface EligibilityStatusBadgeProps {
  status: OverallEligibility;
  language: Language;
  showIcon?: boolean;
}

export const EligibilityStatusBadge: React.FC<EligibilityStatusBadgeProps> = ({
  status,
  language,
  showIcon = true,
}) => {
  const strings = UI_STRINGS[language];

  switch (status) {
    case 'eligible':
      return (
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
          {showIcon && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
          <span>{strings.eligible}</span>
        </div>
      );
    case 'potentially_eligible':
      return (
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800">
          {showIcon && <AlertTriangle className="w-4 h-4 text-amber-700" />}
          <span>{strings.potentiallyEligible}</span>
        </div>
      );
    case 'ineligible':
      return (
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800">
          {showIcon && <XCircle className="w-4 h-4 text-rose-700" />}
          <span>{strings.ineligible}</span>
        </div>
      );
    case 'insufficient_data':
    default:
      return (
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600">
          {showIcon && <HelpCircle className="w-4 h-4 text-stone-500" />}
          <span>{strings.insufficientData}</span>
        </div>
      );
  }
};

interface CriterionResultProps {
  status: CriterionStatus;
  label: string;
  explanation: string;
  userValue?: string | number | boolean;
  requiredRule?: string;
  language: Language;
}

export const CriterionResultRow: React.FC<CriterionResultProps> = ({
  status,
  label,
  explanation,
  userValue,
  requiredRule,
  language,
}) => {
  const strings = UI_STRINGS[language];

  const getStatusDisplay = () => {
    switch (status) {
      case 'pass':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />,
          label: strings.statusPass,
          color: 'text-emerald-900',
        };
      case 'fail':
        return {
          icon: <XCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />,
          label: strings.statusFail,
          color: 'text-rose-900',
        };
      case 'unknown':
        return {
          icon: <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />,
          label: strings.statusUnknown,
          color: 'text-amber-900',
        };
      case 'not_applicable':
      default:
        return {
          icon: <span className="w-4 h-4 text-stone-400 font-bold text-center">-</span>,
          label: strings.statusNotApplicable,
          color: 'text-stone-600',
        };
    }
  };

  const current = getStatusDisplay();

  return (
    <div className="py-3 border-b border-stone-200/80 last:border-none space-y-1.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          {current.icon}
          <div>
            <h4 className="text-sm font-semibold text-stone-900">{label}</h4>
            <div className={`text-xs font-medium ${current.color}`}>{current.label}</div>
          </div>
        </div>
      </div>

      <p className="text-xs text-stone-600 pl-6 leading-relaxed">
        {explanation}
      </p>

      {(userValue !== undefined || requiredRule) && (
        <div className="pl-6 pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-500 font-mono">
          {requiredRule && <span>Rule: {requiredRule}</span>}
          {userValue !== undefined && <span>Your Data: {String(userValue)}</span>}
        </div>
      )}
    </div>
  );
};
