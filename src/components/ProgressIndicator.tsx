import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  stepPrefix?: string;
  ofLabel?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels = [],
  stepPrefix = 'Step',
  ofLabel = 'of',
}) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-800" />
          <span>{stepPrefix} {currentStep} {ofLabel} {totalSteps}</span>
          {stepLabels[currentStep - 1] && (
            <>
              <span className="text-stone-300" aria-hidden="true">·</span>
              <span className="text-emerald-950 font-bold">{stepLabels[currentStep - 1]}</span>
            </>
          )}
        </span>
        <span className="tabular-nums font-mono text-stone-500">{percentage}%</span>
      </div>

      <div className="w-full h-2 bg-stone-200/90 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-800 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
