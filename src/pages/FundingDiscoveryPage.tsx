import React, { useState, useEffect } from 'react';
import { GovernmentScheme, Language } from '../types';
import { UI_STRINGS } from '../lib/translations';
import { RecommendationCard } from '../components/RecommendationCard';
import { api } from '../lib/api';
import { 
  Search, 
  ShieldCheck, 
  Coins, 
  Users, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface FundingDiscoveryPageProps {
  schemes: GovernmentScheme[];
  language: Language;
  onSelectScheme: (schemeId: string) => void;
  onViewEligibility: (schemeId: string) => void;
}

export const FundingDiscoveryPage: React.FC<FundingDiscoveryPageProps> = ({
  schemes,
  language,
  onSelectScheme,
  onViewEligibility,
}) => {
  const strings = UI_STRINGS[language];
  const [activeTab, setActiveTab] = useState<'schemes' | 'partners'>('schemes');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'eligible' | 'loan' | 'subsidy'>('all');
  const [semanticResults, setSemanticResults] = useState<any[] | null>(null);
  const [partners, setPartners] = useState<any[]>([]);

  // Load partners on mount
  useEffect(() => {
    async function loadPartners() {
      try {
        const res = await api.matchPartners('');
        if (res && res.partners) {
          setPartners(res.partners);
        }
      } catch (err) {
        console.warn('Could not load partner list:', err);
      }
    }
    loadPartners();
  }, []);

  // Trigger multilingual semantic matching when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSemanticResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.matchSchemesSemantically(searchTerm.trim());
        if (res && res.results) {
          setSemanticResults(res.results);
        }
      } catch {
        setSemanticResults(null);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredSchemes = schemes.filter((s) => {
    const matchesSearch =
      s.popularName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.officialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Boolean(semanticResults?.some((r) => r.scheme.id === s.id && r.hybridScore > 0.2));

    if (!matchesSearch && searchTerm.trim().length > 0) return false;

    if (filterType === 'eligible') {
      return s.overallStatus === 'eligible' || s.overallStatus === 'potentially_eligible';
    }
    if (filterType === 'loan') {
      return s.schemeType === 'loan';
    }
    if (filterType === 'subsidy') {
      return s.schemeType === 'subsidy';
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24">
      
      {/* Header */}
      <div className="space-y-1 border-b border-stone-200/80 pb-4">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-emerald-800" />
          <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">
            Verified Support Ecosystem · Phase 5 Hybrid Retrieval
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950">
          Government Schemes & NGO Mentorship
        </h1>
        <p className="text-xs text-stone-600 max-w-2xl">
          Semantic concept retrieval supporting Marathi, Hindi, and English. Semantic relevance scoring is strictly separated from deterministic eligibility checks.
        </p>
      </div>

      {/* Main Switcher: Schemes vs Partners */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('schemes')}
          className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors ${
            activeTab === 'schemes'
              ? 'bg-emerald-900 text-white shadow-xs'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Government Schemes ({schemes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('partners')}
          className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors ${
            activeTab === 'partners'
              ? 'bg-emerald-900 text-white shadow-xs'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Verified NGO & Mentors ({partners.length})</span>
        </button>
      </div>

      {/* Semantic Pipeline Information Callout */}
      <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-xs text-stone-700 space-y-1">
        <div className="font-semibold text-stone-900 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-800" />
          <span>Multilingual Sentence Embedding & BM25 Hybrid Matching</span>
        </div>
        <p>
          You can search in Marathi (e.g. <em>"मला चहाचा स्टॉल सुरू करायचा आहे"</em>), Hindi (e.g. <em>"सिलाई मशीन का काम"</em>), or English. Semantically similar descriptions match even without exact keyword overlap.
        </p>
      </div>

      {/* SCHEMES TAB */}
      {activeTab === 'schemes' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[260px] max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search in Marathi, Hindi, or English..."
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-800 bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200/80">
              {[
                { id: 'all', label: 'All Schemes' },
                { id: 'eligible', label: 'Eligible Only' },
                { id: 'loan', label: 'Loans' },
                { id: 'subsidy', label: 'Subsidies' },
              ].map((tab) => {
                const isActive = filterType === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterType(tab.id as any)}
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
          </div>

          {/* Scheme Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSchemes.map((scheme) => (
              <RecommendationCard
                key={scheme.id}
                scheme={scheme}
                language={language}
                onSelectScheme={onSelectScheme}
                onViewEligibility={onViewEligibility}
              />
            ))}
          </div>

          {filteredSchemes.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
              No schemes match your filter. Try clearing the search term.
            </div>
          )}
        </div>
      )}

      {/* PARTNERS TAB */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p>
              <strong>Trusted Partner Verification Policy:</strong> Only vetted organizations with verified physical presence in Maharashtra/India and proven micro-credit records are recommended. Unverified community clubs are strictly excluded.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-base font-bold text-stone-900">
                      {partner.name}
                    </h3>
                    <span className="text-[11px] font-bold text-emerald-800 shrink-0">
                      ✓ Verified
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {partner.description}
                  </p>

                  <div className="space-y-1 pt-1 text-[11px] text-stone-500">
                    <div><strong>Coverage:</strong> {partner.coverage}</div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {partner.services.map((s: string, i: number) => (
                        <span key={i} className="bg-stone-100 px-2 py-0.5 rounded text-stone-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-400 font-mono text-[10px]">Verified 2026</span>
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-900 hover:text-emerald-950 font-semibold flex items-center gap-1 underline underline-offset-2"
                  >
                    <span>Official Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
