import React, { useState } from 'react';
import { DocumentItem, Language } from '../types';
import { UI_STRINGS } from '../lib/translations';
import { 
  CheckCircle2, 
  AlertCircle, 
  MinusCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  ShieldAlert,
  Info
} from 'lucide-react';

interface DocumentChecklistItemProps {
  document: DocumentItem;
  language: Language;
  onStatusChange: (id: string, newStatus: DocumentItem['status']) => void;
}

export const DocumentChecklistItem: React.FC<DocumentChecklistItemProps> = ({
  document,
  language,
  onStatusChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const strings = UI_STRINGS[language];

  const getStatusButton = (status: DocumentItem['status'], label: string) => {
    const isActive = document.status === status;
    return (
      <button
        type="button"
        onClick={() => onStatusChange(document.id, status)}
        className={`min-h-[38px] px-3 py-1 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
          isActive
            ? status === 'available'
              ? 'bg-emerald-900 text-white shadow-xs'
              : status === 'needed'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-stone-700 text-white shadow-xs'
            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
        }`}
      >
        {label}
      </button>
    );
  };

  const requirementBadge = () => {
    if (document.requirementType === 'mandatory' || document.isMandatory) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
          <ShieldAlert className="w-3 h-3" />
          <span>{strings.reqMandatory}</span>
        </span>
      );
    }
    if (document.requirementType === 'conditional') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
          <Info className="w-3 h-3" />
          <span>{strings.reqConditional}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
        <span>{strings.reqOptional}</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-stone-900">{document.name}</h4>
            {requirementBadge()}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
            <span>{document.issuingAuthority}</span>
            {document.verifiedSourceDate && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[11px] font-mono text-emerald-800">Verified: {document.verifiedSourceDate}</span>
              </>
            )}
          </div>
        </div>

        {/* Current status display */}
        <div className="shrink-0 flex items-center">
          {document.status === 'available' && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{strings.docAvailable}</span>
            </span>
          )}
          {document.status === 'needed' && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>{strings.docNeeded}</span>
            </span>
          )}
          {document.status === 'not_applicable' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-xl">
              <MinusCircle className="w-4 h-4 text-stone-500" />
              <span>{strings.docNotApplicable}</span>
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-stone-700 leading-relaxed">{document.purpose}</p>

      {/* Conditional Explanation if applicable */}
      {document.conditionNote && (
        <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold">Condition for submission: </strong>
            {document.conditionNote}
          </p>
        </div>
      )}

      {/* Expandable How to Obtain Guide */}
      <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/60 text-xs space-y-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left font-semibold text-stone-800"
        >
          <span>Official instructions & how to obtain</span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
        </button>

        {isExpanded && (
          <div className="pt-2 text-stone-700 leading-relaxed border-t border-stone-200/60 mt-1 space-y-2">
            <p>{document.howToObtain}</p>
            {document.officialReferenceUrl && (
              <a
                href={document.officialReferenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-900 hover:text-emerald-950 font-semibold underline"
              >
                <span>Official government portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Interactive Status Switcher (Available, Needed, Not Applicable) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
        <span className="text-xs font-medium text-stone-500">Self-declaration status:</span>
        <div className="flex items-center gap-1.5">
          {getStatusButton('available', strings.docAvailable)}
          {getStatusButton('needed', strings.docNeeded)}
          {getStatusButton('not_applicable', strings.docNotApplicable)}
        </div>
      </div>
    </div>
  );
};
