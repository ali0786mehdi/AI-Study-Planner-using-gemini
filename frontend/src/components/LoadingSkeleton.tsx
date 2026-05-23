import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Loading Skeleton Component — shown while Gemini generates the plan
// ─────────────────────────────────────────────────────────────────────────────

const SkeletonPulse: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-700/50 rounded-lg ${className}`} />
);

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6" aria-busy="true" aria-label="Generating your study plan...">

      {/* AI thinking indicator */}
      <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <span className="text-xl animate-bounce">🧠</span>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <div className="flex-1">
          <h2 className="text-white font-semibold text-lg">Gemini is crafting your plan...</h2>
          <p className="text-slate-400 text-sm mt-1">Analyzing your subject and building a personalized roadmap</p>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-8 bg-violet-500/60 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Header skeleton */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <SkeletonPulse className="h-7 w-48" />
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-3/4" />
      </div>

      {/* Milestones skeleton */}
      <div className="glass-card rounded-2xl p-6 space-y-3">
        <SkeletonPulse className="h-5 w-36 mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <SkeletonPulse key={i} className="h-12 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Day cards skeleton */}
      <div className="space-y-4">
        {[...Array(3)].map((_, dayIdx) => (
          <div key={dayIdx} className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              <SkeletonPulse className="w-14 h-14 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonPulse className="h-5 w-32" />
                <SkeletonPulse className="h-4 w-56" />
              </div>
            </div>
            <div className="space-y-3 ml-18">
              {[...Array(2)].map((_, taskIdx) => (
                <SkeletonPulse key={taskIdx} className="h-16 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
