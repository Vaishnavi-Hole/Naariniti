import React, { useState } from 'react';
import { ActionPlanTask, Language } from '../types';
import { UI_STRINGS } from '../lib/translations';
import { 
  Check, 
  Clock, 
  IndianRupee, 
  Layers, 
  Calendar, 
  ExternalLink,
  Edit2,
  CheckCircle2,
  GitFork
} from 'lucide-react';

interface ActionPlanTaskItemProps {
  task: ActionPlanTask;
  language: Language;
  onToggleComplete: (taskId: string) => void;
  onViewRelatedScheme?: (schemeId: string) => void;
  onRescheduleTask?: (taskId: string, newSchedule: string) => void;
}

export const ActionPlanTaskItem: React.FC<ActionPlanTaskItemProps> = ({
  task,
  language,
  onToggleComplete,
  onViewRelatedScheme,
  onRescheduleTask,
}) => {
  const strings = UI_STRINGS[language];
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [scheduleText, setScheduleText] = useState(task.scheduledDate || `Day 1–${task.estimatedDays}`);

  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const handleSaveSchedule = () => {
    if (onRescheduleTask && scheduleText.trim()) {
      onRescheduleTask(task.id, scheduleText.trim());
    }
    setIsEditingSchedule(false);
  };

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all ${
        task.isCompleted
          ? 'bg-stone-50/70 border-stone-200/60 opacity-90'
          : 'bg-white border-stone-200 shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Large Accessible Checkbox Hitbox */}
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border-2 transition-colors ${
            task.isCompleted
              ? 'bg-emerald-900 border-emerald-900 text-white'
              : 'border-stone-300 hover:border-emerald-800 bg-white'
          }`}
          aria-checked={task.isCompleted}
          role="checkbox"
          aria-label={task.title}
        >
          {task.isCompleted && <Check className="w-5 h-5 stroke-[3]" />}
        </button>

        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4
              className={`text-sm font-semibold text-stone-900 ${
                task.isCompleted ? 'line-through text-stone-500' : ''
              }`}
            >
              {task.title}
            </h4>
            
            {/* Metadata (Time, Cost, Schedule) */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>{task.estimatedDays} days</span>
              </span>

              {task.estimatedCostINR > 0 && (
                <>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span className="flex items-center gap-0.5 text-emerald-900 font-semibold">
                    <IndianRupee className="w-3 h-3" />
                    <span>{formatINR(task.estimatedCostINR)}</span>
                  </span>
                </>
              )}

              {/* Schedule indicator / Reschedule */}
              <span aria-hidden="true" className="text-stone-300">·</span>
              <div className="flex items-center gap-1 text-stone-600 bg-stone-100 px-2 py-0.5 rounded-lg">
                <Calendar className="w-3 h-3 text-stone-500" />
                <span>{task.scheduledDate || `Days 1–${task.estimatedDays}`}</span>
                {onRescheduleTask && !isEditingSchedule && (
                  <button
                    type="button"
                    onClick={() => setIsEditingSchedule(true)}
                    className="ml-1 text-stone-400 hover:text-stone-700 p-0.5"
                    title="Reschedule task"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Reschedule inline editor */}
          {isEditingSchedule && (
            <div className="flex items-center gap-2 pt-1 pb-1">
              <span className="text-xs text-stone-500">Reschedule:</span>
              <input
                type="text"
                value={scheduleText}
                onChange={(e) => setScheduleText(e.target.value)}
                placeholder="e.g. Day 8–10 or Oct 15"
                className="text-xs px-2.5 py-1 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-800"
              />
              <button
                type="button"
                onClick={handleSaveSchedule}
                className="text-xs px-2.5 py-1 bg-emerald-900 text-white rounded-lg font-semibold hover:bg-emerald-800"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingSchedule(false)}
                className="text-xs px-2 py-1 text-stone-500 hover:text-stone-700"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Task description in simple language */}
          <p className="text-xs text-stone-600 leading-relaxed">
            {task.description}
          </p>

          {/* Dependencies */}
          {task.dependencies && task.dependencies.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
              <GitFork className="w-3 h-3 text-amber-700 shrink-0" />
              <span>Depends on previous milestones: </span>
              <span className="font-mono text-stone-700">
                {task.dependencies.join(', ')}
              </span>
            </div>
          )}

          {/* Materials or Action items */}
          {task.materialsNeeded && task.materialsNeeded.length > 0 && (
            <div className="pt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-stone-500">
              <span className="font-semibold text-stone-700">Required:</span>
              {task.materialsNeeded.map((mat, i) => (
                <span key={i} className="bg-stone-100 px-2 py-0.5 rounded text-stone-700">
                  {mat}
                </span>
              ))}
            </div>
          )}

          {/* Source reference or recommendation basis */}
          {task.relatedRecommendationOrSource && (
            <div className="pt-1 text-[11px] text-stone-500 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
              <span>Source/Basis: {task.relatedRecommendationOrSource}</span>
            </div>
          )}

          {/* Related Scheme Link */}
          {task.relatedSchemeId && onViewRelatedScheme && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => onViewRelatedScheme(task.relatedSchemeId!)}
                className="text-xs text-emerald-900 hover:text-emerald-950 font-semibold underline underline-offset-2 flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>View Linked Government Scheme Verification</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
