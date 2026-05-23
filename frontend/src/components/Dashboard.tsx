import React, { useState } from 'react';
import type { StudyPlan, DailyPlan, DailyTask } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Helper Utilities
// ─────────────────────────────────────────────────────────────────────────────

const RESOURCE_TYPE_CONFIG: Record<DailyTask['resourceType'], { icon: string; color: string; bg: string }> = {
  reading: { icon: '📖', color: 'text-blue-300', bg: 'bg-blue-500/10 border-blue-500/20' },
  video: { icon: '🎬', color: 'text-rose-300', bg: 'bg-rose-500/10 border-rose-500/20' },
  practice: { icon: '💪', color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  project: { icon: '🚀', color: 'text-orange-300', bg: 'bg-orange-500/10 border-orange-500/20' },
  review: { icon: '🔄', color: 'text-violet-300', bg: 'bg-violet-500/10 border-violet-500/20' },
};

const PRIORITY_CONFIG: Record<DailyTask['priority'], { label: string; color: string }> = {
  high: { label: 'HIGH', color: 'text-red-400 bg-red-500/10 border border-red-500/20' },
  medium: { label: 'MED', color: 'text-amber-400 bg-amber-500/10 border border-amber-500/20' },
  low: { label: 'LOW', color: 'text-slate-400 bg-slate-500/10 border border-slate-500/20' },
};

const LEVEL_BADGE: Record<string, string> = {
  Beginner: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
  Intermediate: 'bg-amber-500/15 text-amber-300 border border-amber-500/25',
  Advanced: 'bg-red-500/15 text-red-300 border border-red-500/25',
};

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Task Card
// ─────────────────────────────────────────────────────────────────────────────

const TaskCard: React.FC<{ task: DailyTask; index: number }> = ({ task, index }) => {
  const [done, setDone] = useState(false);
  const resourceConfig = RESOURCE_TYPE_CONFIG[task.resourceType];
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <div
      className={`group relative flex gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
        done
          ? 'border-slate-700/30 bg-slate-800/20 opacity-60'
          : `border-slate-700/40 bg-slate-800/40 hover:bg-slate-800/60 hover:border-slate-600/60`
      }`}
      onClick={() => setDone(prev => !prev)}
    >
      {/* Checkbox */}
      <div className="flex-shrink-0 mt-0.5">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          done ? 'border-violet-500 bg-violet-500' : 'border-slate-600 group-hover:border-violet-500/50'
        }`}>
          {done && <span className="text-white text-xs">✓</span>}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <span className={`font-medium text-sm ${done ? 'line-through text-slate-500' : 'text-white'}`}>
            {task.title}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${priorityConfig.color}`}>
              {priorityConfig.label}
            </span>
          </div>
        </div>
        <p className={`text-sm leading-relaxed mb-3 ${done ? 'text-slate-600' : 'text-slate-400'}`}>
          {task.description}
        </p>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border ${resourceConfig.bg} ${resourceConfig.color}`}>
            <span>{resourceConfig.icon}</span>
            <span className="capitalize">{task.resourceType}</span>
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <span>⏱</span> {formatMinutes(task.estimatedMinutes)}
          </span>
          <span className="text-xs text-slate-600 font-mono">#{index + 1}</span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Day Card
// ─────────────────────────────────────────────────────────────────────────────

const DayCard: React.FC<{ plan: DailyPlan; isExpanded: boolean; onToggle: () => void }> = ({
  plan,
  isExpanded,
  onToggle,
}) => {
  const formattedDate = plan.date
    ? new Date(plan.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : `Day ${plan.day}`;

  return (
    <div className="glass-card rounded-2xl overflow-hidden transition-all duration-300">
      {/* Day Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-5 p-5 text-left hover:bg-slate-700/20 transition-colors duration-200"
        aria-expanded={isExpanded}
      >
        {/* Day Number Badge */}
        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/20 flex flex-col items-center justify-center">
          <span className="text-violet-400 text-xs font-medium uppercase tracking-wider">Day</span>
          <span className="text-white font-bold text-lg leading-none">{plan.day}</span>
        </div>

        {/* Day Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-semibold truncate">{plan.theme}</span>
          </div>
          <p className="text-slate-400 text-sm truncate">{plan.dailyGoal}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-slate-500">📅 {formattedDate}</span>
            <span className="text-xs text-slate-500">📋 {plan.tasks.length} tasks</span>
            <span className="text-xs text-slate-500">⏱ {formatMinutes(plan.totalEstimatedMinutes)}</span>
          </div>
        </div>

        {/* Expand Icon */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          <span className="text-slate-400 text-sm">↓</span>
        </div>
      </button>

      {/* Expanded Task List */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-slate-700/40 pt-4">
          <p className="text-sm text-slate-400 italic mb-3">🎯 {plan.dailyGoal}</p>
          {plan.tasks.map((task, i) => (
            <TaskCard key={task.taskId} task={task} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard Component
// ─────────────────────────────────────────────────────────────────────────────

interface DashboardProps {
  plan: StudyPlan;
  onReset: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ plan, onReset }) => {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1])); // Day 1 open by default
  const [view, setView] = useState<'timeline' | 'overview'>('timeline');

  const toggleDay = (day: number) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

  const expandAll = () => setExpandedDays(new Set(plan.dailyPlans.map(d => d.day)));
  const collapseAll = () => setExpandedDays(new Set());

  const totalTasks = plan.dailyPlans.reduce((acc, d) => acc + d.tasks.length, 0);
  const totalMinutes = plan.dailyPlans.reduce((acc, d) => acc + d.totalEstimatedMinutes, 0);
  const generatedDate = new Date(plan.generatedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="glass-card rounded-2xl p-7">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🎓</span>
              <h1 className="text-2xl font-bold text-white">{plan.subject}</h1>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${LEVEL_BADGE[plan.currentLevel] ?? 'text-slate-300'}`}>
                {plan.currentLevel}
              </span>
            </div>
            <p className="text-slate-300 text-base leading-relaxed max-w-2xl">{plan.overallGoal}</p>
          </div>
          <button
            onClick={onReset}
            id="generate-new-plan-btn"
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-500 transition-all duration-200 text-sm font-medium"
          >
            ← New Plan
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: '📅', label: 'Days', value: plan.timeframeDays },
            { icon: '📋', label: 'Tasks', value: totalTasks },
            { icon: '⏱', label: 'Total Time', value: formatMinutes(totalMinutes) },
            { icon: '🎯', label: 'Generated', value: generatedDate },
          ].map(stat => (
            <div key={stat.label} className="bg-slate-800/50 rounded-xl p-3 text-center">
              <div className="text-lg mb-1">{stat.icon}</div>
              <div className="text-white font-bold text-sm">{stat.value}</div>
              <div className="text-slate-500 text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Milestones */}
      {plan.weeklyMilestones.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <span>🏆</span> Weekly Milestones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plan.weeklyMilestones.map((milestone, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs text-violet-400 font-bold">
                  {i + 1}
                </span>
                <span className="text-slate-300 text-sm leading-relaxed">{milestone}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Tabs & Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-xl p-1">
          {[
            { id: 'timeline', label: '📋 Timeline' },
            { id: 'overview', label: '📊 Overview' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as 'timeline' | 'overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                view === tab.id
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {view === 'timeline' && (
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700/60 hover:border-slate-600 transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700/60 hover:border-slate-600 transition-colors"
            >
              Collapse
            </button>
          </div>
        )}
      </div>

      {/* Timeline View */}
      {view === 'timeline' && (
        <div className="space-y-3">
          {plan.dailyPlans.map(dayPlan => (
            <DayCard
              key={dayPlan.day}
              plan={dayPlan}
              isExpanded={expandedDays.has(dayPlan.day)}
              onToggle={() => toggleDay(dayPlan.day)}
            />
          ))}
        </div>
      )}

      {/* Overview Grid */}
      {view === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {plan.dailyPlans.map(dayPlan => (
            <button
              key={dayPlan.day}
              onClick={() => {
                setView('timeline');
                setExpandedDays(new Set([dayPlan.day]));
                setTimeout(() => {
                  document.querySelector(`[data-day="${dayPlan.day}"]`)?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="glass-card rounded-xl p-4 text-left hover:border-violet-500/40 hover:bg-slate-700/30 transition-all duration-200 group"
            >
              <div className="text-violet-400 text-xs font-mono mb-1">DAY {dayPlan.day}</div>
              <div className="text-white text-sm font-medium mb-1 line-clamp-2 group-hover:text-violet-200 transition-colors">
                {dayPlan.theme}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500">{dayPlan.tasks.length} tasks</span>
                <span className="text-xs text-slate-500">{formatMinutes(dayPlan.totalEstimatedMinutes)}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Study Tips */}
      {plan.tips.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <span>💡</span> Expert Study Tips
          </h2>
          <div className="space-y-3">
            {plan.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                <span className="text-amber-400 text-sm font-bold flex-shrink-0">#{i + 1}</span>
                <p className="text-slate-300 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
