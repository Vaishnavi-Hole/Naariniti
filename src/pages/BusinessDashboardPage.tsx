import React, { useState } from 'react';
import { EntrepreneurProfile, BusinessProject, GovernmentScheme, DocumentItem, ActionPlanTask, Language, AppPage } from '../types';
import { UI_STRINGS } from '../lib/translations';
import { 
  ArrowRight, 
  Coins, 
  FileText, 
  CalendarCheck, 
  Bot, 
  IndianRupee, 
  CheckCircle2, 
  Sparkles, 
  PlusCircle, 
  SlidersHorizontal,
  Store,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react';
import { EligibilityStatusBadge } from '../components/EligibilityStatusBadge';

interface BusinessDashboardPageProps {
  profile: EntrepreneurProfile;
  project: BusinessProject;
  schemes: GovernmentScheme[];
  documents: DocumentItem[];
  tasks: ActionPlanTask[];
  language: Language;
  onNavigate: (page: AppPage) => void;
  onStartNewProject: () => void;
  allProjects?: BusinessProject[];
  onSelectProject?: (projectId: string) => void;
}

export const BusinessDashboardPage: React.FC<BusinessDashboardPageProps> = ({
  profile,
  project,
  schemes,
  documents,
  tasks,
  language,
  onNavigate,
  onStartNewProject,
  allProjects = [],
  onSelectProject,
}) => {
  const [isDetailedView, setIsDetailedView] = useState(false);
  const strings = UI_STRINGS[language];

  // Derive metrics strictly from real passed state
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const totalTasks = tasks.length;
  const taskProgressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const readyDocuments = documents.filter((d) => d.status === 'available').length;
  const totalDocs = documents.length;
  const docProgressPct = totalDocs > 0 ? Math.round((readyDocuments / totalDocs) * 100) : 0;

  const eligibleSchemes = schemes.filter((s) => s.overallStatus === 'eligible' || s.overallStatus === 'potentially_eligible');
  const nextPendingTask = tasks.find((t) => !t.isCompleted);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return strings.greetingMorning;
    if (hour < 17) return strings.greetingAfternoon;
    return strings.greetingEvening;
  };

  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 pb-24">
      
      {/* Top Welcome Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div>
          <div className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
            {profile.villageTown}, {profile.district} · {strings.demonstrationData}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950 mt-0.5">
            {getGreeting()}, {profile.preferredName || profile.fullName}!
          </h1>
        </div>

        {/* Action buttons & View toggle */}
        <div className="flex items-center gap-2">
          {/* Beginner / Detailed View Switcher */}
          <button
            type="button"
            onClick={() => setIsDetailedView(!isDetailedView)}
            className="min-h-[44px] px-3.5 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100 flex items-center gap-1.5"
            aria-pressed={isDetailedView}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
            <span>{isDetailedView ? 'Detailed View Active' : 'Beginner View'}</span>
          </button>

          <button
            type="button"
            onClick={onStartNewProject}
            className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-stone-50 flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-800" />
            <span className="hidden sm:inline">Start Another Business</span>
          </button>
        </div>
      </div>

      {/* Main Business Project Spotlight Card */}
      <section className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-800" />
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                Current Active Project
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              {project.title}
            </h2>
            {allProjects.length > 1 && onSelectProject && (
              <div className="pt-1">
                <label className="text-[11px] text-stone-500 font-semibold block mb-0.5">Switch Project:</label>
                <select
                  value={project.id}
                  onChange={(e) => onSelectProject(e.target.value)}
                  className="text-xs p-1.5 rounded-lg border border-stone-300 bg-stone-50 font-sans font-medium text-stone-800"
                >
                  {allProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (₹{p.budgetInINR.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500 font-mono">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {project.location}
              </span>
              <span aria-hidden="true">·</span>
              <span>Mode: {project.operationMode.toUpperCase()}</span>
              <span aria-hidden="true">·</span>
              <span>Target: {project.targetDailyCustomers} customers/day</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('mentor')}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-900 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Bot className="w-4 h-4 text-amber-300" />
            <span>Ask Business Mentor</span>
          </button>
        </div>

        {/* Core Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          
          {/* Budget */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
            <div className="text-xs font-medium text-stone-500 flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-800" />
              <span>Available Budget</span>
            </div>
            <div className="font-serif text-xl sm:text-2xl font-bold text-stone-900 tabular-nums">
              {formatINR(project.budgetInINR)}
            </div>
            <div className="text-[11px] text-stone-500">Mudra eligible up to ₹50k</div>
          </div>

          {/* Action Plan Progress */}
          <div 
            onClick={() => onNavigate('action-plan')}
            className="cursor-pointer p-4 rounded-2xl bg-stone-50 border border-stone-200/70 hover:border-emerald-700 transition-colors space-y-1"
          >
            <div className="text-xs font-medium text-stone-500 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <CalendarCheck className="w-3.5 h-3.5 text-emerald-800" />
                <span>30-Day Plan</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            </div>
            <div className="font-serif text-xl sm:text-2xl font-bold text-stone-900 tabular-nums">
              {completedTasks}/{totalTasks} <span className="text-xs font-normal text-stone-500 font-sans">tasks</span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-emerald-800 h-full rounded-full" style={{ width: `${taskProgressPct}%` }} />
            </div>
          </div>

          {/* Document Readiness */}
          <div 
            onClick={() => onNavigate('documents')}
            className="cursor-pointer p-4 rounded-2xl bg-stone-50 border border-stone-200/70 hover:border-emerald-700 transition-colors space-y-1"
          >
            <div className="text-xs font-medium text-stone-500 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-emerald-800" />
                <span>Documents</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            </div>
            <div className="font-serif text-xl sm:text-2xl font-bold text-stone-900 tabular-nums">
              {readyDocuments}/{totalDocs} <span className="text-xs font-normal text-stone-500 font-sans">ready</span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-emerald-800 h-full rounded-full" style={{ width: `${docProgressPct}%` }} />
            </div>
          </div>

          {/* Verified Schemes */}
          <div 
            onClick={() => onNavigate('schemes')}
            className="cursor-pointer p-4 rounded-2xl bg-stone-50 border border-stone-200/70 hover:border-emerald-700 transition-colors space-y-1"
          >
            <div className="text-xs font-medium text-stone-500 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-emerald-800" />
                <span>Eligible Schemes</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            </div>
            <div className="font-serif text-xl sm:text-2xl font-bold text-emerald-950 tabular-nums">
              {eligibleSchemes.length} Matches
            </div>
            <div className="text-[11px] text-emerald-900 font-semibold">100% verified portals</div>
          </div>

        </div>

        {/* Recommended Immediate Next Task */}
        {nextPendingTask && (
          <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200/80 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-800" />
                <span>Recommended Next Step for Today</span>
              </div>
              <div className="text-sm font-semibold text-stone-900">
                {nextPendingTask.title}
              </div>
              <div className="text-xs text-stone-600">
                {nextPendingTask.description}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('action-plan')}
              className="min-h-[44px] px-4 py-2 bg-emerald-900 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <span>View in Action Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* Matched Government Schemes Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Matched Government Schemes for Your Budget
            </h3>
            <p className="text-xs text-stone-500">
              Filtered for ₹30,000 food and tea stall in Shirur, Pune Rural.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('schemes')}
            className="text-xs font-semibold text-emerald-900 hover:text-emerald-950 flex items-center gap-1"
          >
            <span>View All ({schemes.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schemes.slice(0, 2).map((scheme) => (
            <div
              key={scheme.id}
              onClick={() => onNavigate('schemes')}
              className="cursor-pointer bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs hover:shadow-sm transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-serif text-base font-bold text-stone-900">
                  {scheme.popularName}
                </h4>
                <EligibilityStatusBadge status={scheme.overallStatus} language={language} />
              </div>
              <p className="text-xs text-stone-600 line-clamp-2">
                {scheme.description}
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
                <span className="font-mono text-emerald-950 font-semibold">
                  Max {formatINR(scheme.maxFundingAmountINR)}
                </span>
                <span className="text-emerald-900 font-semibold flex items-center gap-1">
                  <span>Inspect details</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Technical / Context Memory View (If Toggled) */}
      {isDetailedView && (
        <section className="bg-stone-100 rounded-3xl p-6 border border-stone-300 space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-900 font-sans text-sm">
              Deterministic Rules & Context Summary Memory
            </span>
            <span className="bg-stone-200 px-2 py-0.5 rounded text-stone-700">Project ID: {project.id}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-stone-700">
            <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1">
              <div className="font-bold text-stone-900">Stored Profile Context:</div>
              <div>Age: {profile.ageBand} · State: {profile.state} · Dist: {profile.district}</div>
              <div>Education: {profile.educationLevel} · Language: {profile.language}</div>
              <div>Investment Capital: ₹{profile.availableInvestment.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1">
              <div className="font-bold text-stone-900">FastAPI RAG Inference Target:</div>
              <div>Endpoint: /api/v1/ai/chat (Phase 3 Open-Source LLM)</div>
              <div>Retrieval: Multilingual embeddings + BM25 Hybrid</div>
              <div>Status: Demonstration Shell Active</div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
