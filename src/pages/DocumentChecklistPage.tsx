import React, { useState } from 'react';
import { DocumentItem, Language, GovernmentScheme } from '../types';
import { UI_STRINGS } from '../lib/translations';
import { DocumentChecklistItem } from '../components/DocumentChecklistItem';
import { VERIFIED_GOVERNMENT_SCHEMES } from '../lib/constants';
import { 
  FileCheck, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  MinusCircle, 
  RefreshCw,
  Layers,
  Sparkles
} from 'lucide-react';

interface DocumentChecklistPageProps {
  documents: DocumentItem[];
  language: Language;
  onUpdateDocumentStatus: (id: string, status: DocumentItem['status']) => void;
  onGenerateForScheme?: (schemeId: string) => Promise<void>;
  selectedSchemeId?: string;
}

export const DocumentChecklistPage: React.FC<DocumentChecklistPageProps> = ({
  documents,
  language,
  onUpdateDocumentStatus,
  onGenerateForScheme,
  selectedSchemeId,
}) => {
  const strings = UI_STRINGS[language];
  const [filter, setFilter] = useState<'all' | 'mandatory' | 'conditional' | 'needed' | 'available' | 'not_applicable'>('all');
  const [activeSchemeId, setActiveSchemeId] = useState<string>(selectedSchemeId || 'sch_mudra_shishu');
  const [isRegenerating, setIsRegenerating] = useState(false);

  const readyCount = documents.filter((d) => d.status === 'available').length;
  const neededCount = documents.filter((d) => d.status === 'needed').length;
  const naCount = documents.filter((d) => d.status === 'not_applicable').length;
  const total = documents.length;
  const mandatoryTotal = documents.filter((d) => d.requirementType === 'mandatory' || d.isMandatory).length;
  const mandatoryReady = documents.filter((d) => (d.requirementType === 'mandatory' || d.isMandatory) && d.status === 'available').length;
  
  const readinessPercentage = total > 0 ? Math.round((readyCount / total) * 100) : 0;
  const mandatoryPercentage = mandatoryTotal > 0 ? Math.round((mandatoryReady / mandatoryTotal) * 100) : 0;

  const filteredDocs = documents.filter((d) => {
    if (filter === 'mandatory') return d.requirementType === 'mandatory' || d.isMandatory;
    if (filter === 'conditional') return d.requirementType === 'conditional';
    if (filter === 'needed') return d.status === 'needed';
    if (filter === 'available') return d.status === 'available';
    if (filter === 'not_applicable') return d.status === 'not_applicable';
    return true;
  });

  const handleSchemeChange = async (newSchemeId: string) => {
    setActiveSchemeId(newSchemeId);
    if (onGenerateForScheme) {
      setIsRegenerating(true);
      try {
        await onGenerateForScheme(newSchemeId);
      } finally {
        setIsRegenerating(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24">
      
      {/* Header */}
      <div className="space-y-1 border-b border-stone-200/80 pb-4">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-800" />
          <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">
            Verified Official Document Checklist
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950">
          Application Document Checklist & Preparation
        </h1>
        <p className="text-xs text-stone-600 max-w-2xl">
          Track official certificates, identity documents, and vendor quotations. Documents are labeled as mandatory, conditional, or optional strictly based on verified government circulars.
        </p>
      </div>

      {/* Scheme Checklist Selector */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-800" />
            <span className="text-xs font-bold text-stone-900">
              Generate Checklist from Verified Scheme:
            </span>
          </div>
          {isRegenerating && (
            <span className="text-xs text-emerald-800 flex items-center gap-1 font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Updating checklist...
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {VERIFIED_GOVERNMENT_SCHEMES.map((scheme) => {
            const isSelected = activeSchemeId === scheme.id;
            return (
              <button
                key={scheme.id}
                type="button"
                onClick={() => handleSchemeChange(scheme.id)}
                className={`min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all text-left ${
                  isSelected
                    ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                    : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span>{scheme.popularName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress & Stat Header */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-950">
              Mandatory Requirements Readiness
            </span>
            <div className="font-serif text-3xl font-bold text-stone-900 tabular-nums">
              {mandatoryPercentage}% of Mandatory Ready
            </div>
            <div className="text-xs text-stone-500">
              {mandatoryReady} of {mandatoryTotal} compulsory documents verified with applicant
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-900 flex items-center gap-1.5 border border-emerald-200/70">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{readyCount} Available</span>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-900 flex items-center gap-1.5 border border-amber-200/70">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>{neededCount} Needed</span>
            </div>
            <div className="p-2.5 bg-stone-100 rounded-xl text-stone-700 flex items-center gap-1.5 border border-stone-200">
              <MinusCircle className="w-4 h-4 text-stone-500" />
              <span>{naCount} N/A</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-800 h-full rounded-full transition-all duration-300"
            style={{ width: `${mandatoryPercentage}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200/80">
          {[
            { id: 'all', label: `All (${total})` },
            { id: 'mandatory', label: `Mandatory (${mandatoryTotal})` },
            { id: 'conditional', label: 'Conditional' },
            { id: 'needed', label: `Needed (${neededCount})` },
            { id: 'available', label: `Ready (${readyCount})` },
            { id: 'not_applicable', label: `Not Applicable (${naCount})` },
          ].map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as any)}
                className={`min-h-[38px] px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-stone-500 hidden sm:block">
          Mark as Available, Needed, or Not Applicable
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {filteredDocs.map((doc) => (
          <DocumentChecklistItem
            key={doc.id}
            document={doc}
            language={language}
            onStatusChange={onUpdateDocumentStatus}
          />
        ))}
      </div>

      {/* Persistence and Self-Declaration Transparency Note */}
      <div className="p-4 bg-stone-100 rounded-2xl border border-stone-200/80 text-xs text-stone-600 flex items-start gap-2.5 leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
        <p>
          <strong>Self-Declaration & Official Submission Notice:</strong> All checklist progress is saved to your account. Nariniti does not collect identity document scans or submit loan applications on your behalf. Applications must be presented in person or on the official government portal.
        </p>
      </div>

    </div>
  );
};
