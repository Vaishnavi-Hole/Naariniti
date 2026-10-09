import React, { useState } from 'react';
import { ActionPlanTask, Language, BusinessProject, EntrepreneurProfile } from '../types';
import { UI_STRINGS } from '../lib/translations';
import { ActionPlanTaskItem } from '../components/ActionPlanTaskItem';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  Layers, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface ActionPlanPageProps {
  tasks: ActionPlanTask[];
  project: BusinessProject;
  profile: EntrepreneurProfile;
  language: Language;
  onToggleTaskComplete: (taskId: string) => void;
  onViewRelatedScheme?: (schemeId: string) => void;
  onRescheduleTask?: (taskId: string, newSchedule: string) => void;
  onRegenerateActionPlan?: () => Promise<void>;
}

export const ActionPlanPage: React.FC<ActionPlanPageProps> = ({
  tasks,
  project,
  profile,
  language,
  onToggleTaskComplete,
  onViewRelatedScheme,
  onRescheduleTask,
  onRegenerateActionPlan,
}) => {
  const strings = UI_STRINGS[language];
  const [activePhase, setActivePhase] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalTasks = tasks.length;
  const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const totalCost = tasks.reduce((sum, t) => sum + (t.estimatedCostINR || 0), 0);
  const spentCost = tasks
    .filter((t) => t.isCompleted)
    .reduce((sum, t) => sum + (t.estimatedCostINR || 0), 0);

  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const phases = [
    { id: 'all', label: `All Tasks (${totalTasks})` },
    { id: 'days_1_7', label: 'Phase 1: Days 1–7 (Discovery)' },
    { id: 'days_8_14', label: 'Phase 2: Days 8–14 (Equipment & Quotes)' },
    { id: 'days_15_21', label: 'Phase 3: Days 15–21 (Scheme & Licensing)' },
    { id: 'days_22_30', label: 'Phase 4: Days 22–30 (Trial & Launch)' },
  ];

  const filteredTasks = tasks.filter((t) => {
    if (activePhase === 'all') return true;
    return t.phase === activePhase;
  });

  const handleRegenerate = async () => {
    if (onRegenerateActionPlan) {
      setIsGenerating(true);
      try {
        await onRegenerateActionPlan();
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24">
      
      {/* Header */}
      <div className="space-y-1 border-b border-stone-200/80 pb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-800" />
            <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">
              Personalized 30-Day Launch Roadmap
            </span>
          </div>

          {onRegenerateActionPlan && (
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Personalize for {project.title.slice(0, 20)}</span>
            </button>
          )}
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950">
          Step-by-Step 30-Day Execution Plan
        </h1>
        <p className="text-xs text-stone-600 max-w-2xl">
          Personalized for your {project.title} (₹{project.budgetInINR.toLocaleString('en-IN')} budget in {project.location || profile.villageTown || profile.district}). Mark tasks complete, reschedule dates at your own pace, and resume anytime.
        </p>
      </div>

      {/* Progress & Milestone Overview Card */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-950">
              30-Day Launch Roadmap Progress
            </span>
            <div className="font-serif text-3xl font-bold text-stone-900 tabular-nums">
              {progressPct}% Completed
            </div>
            <div className="text-xs text-stone-500">
              {completedCount} of {totalTasks} milestones achieved · Progress automatically saved
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/70 text-right">
              <div className="text-[11px] text-stone-500 font-sans">Estimated Capital Deployed</div>
              <div className="font-serif text-base font-bold text-emerald-950 tabular-nums">
                {formatINR(spentCost)} <span className="text-xs text-stone-400 font-normal">of {formatINR(totalCost)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-800 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Phase Tabs */}
      <div className="overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200/80 w-max">
          {phases.map((ph) => {
            const isActive = activePhase === ph.id;
            return (
              <button
                key={ph.id}
                type="button"
                onClick={() => setActivePhase(ph.id)}
                className={`min-h-[38px] px-3.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                {ph.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <ActionPlanTaskItem
            key={task.id}
            task={task}
            language={language}
            onToggleComplete={onToggleTaskComplete}
            onViewRelatedScheme={onViewRelatedScheme}
            onRescheduleTask={onRescheduleTask}
          />
        ))}
      </div>

      {/* Official Timeline Disclaimer */}
      <div className="p-4 bg-stone-100 rounded-2xl border border-stone-200/80 text-xs text-stone-600 flex items-start gap-2.5 leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
        <p>
          <strong>No Guaranteed Deadlines or Auto-Submission:</strong> This 30-day roadmap is an educational guidance framework created to help prioritize tasks at your own pace. Official scheme sanction timelines depend strictly on the respective branch manager and implementing department.
        </p>
      </div>

    </div>
  );
};
