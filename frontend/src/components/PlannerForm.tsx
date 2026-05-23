import React, { useState, type FormEvent } from 'react';
import type { StudyPlanRequest, DifficultyLevel } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// PlannerForm Component
// ─────────────────────────────────────────────────────────────────────────────

interface PlannerFormProps {
  onSubmit: (data: StudyPlanRequest) => void;
  isLoading: boolean;
}

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string; desc: string; icon: string }[] = [
  { value: 'Beginner', label: 'Beginner', desc: 'Starting fresh', icon: '🌱' },
  { value: 'Intermediate', label: 'Intermediate', desc: 'Some experience', icon: '⚡' },
  { value: 'Advanced', label: 'Advanced', desc: 'Deep expertise', icon: '🔥' },
];

const TIMEFRAME_PRESETS = [
  { days: 7, label: '1 Week' },
  { days: 14, label: '2 Weeks' },
  { days: 30, label: '1 Month' },
  { days: 60, label: '2 Months' },
  { days: 90, label: '3 Months' },
];

export const PlannerForm: React.FC<PlannerFormProps> = ({ onSubmit, isLoading }) => {
  const [subject, setSubject] = useState('');
  const [timeframeDays, setTimeframeDays] = useState<number>(14);
  const [currentLevel, setCurrentLevel] = useState<DifficultyLevel>('Beginner');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!subject.trim()) newErrors['subject'] = 'Please enter a subject to study.';
    if (subject.trim().length > 100) newErrors['subject'] = 'Subject must be under 100 characters.';
    if (!timeframeDays || timeframeDays < 1) newErrors['timeframe'] = 'Timeframe must be at least 1 day.';
    if (timeframeDays > 365) newErrors['timeframe'] = 'Timeframe cannot exceed 365 days.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ subject: subject.trim(), timeframeDays, currentLevel });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 mb-4 shadow-lg shadow-violet-500/25">
          <span className="text-2xl">🧠</span>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
          AI Study Planner
        </h1>
        <p className="text-slate-400 text-lg font-light">
          Generate a personalized study roadmap powered by Gemini AI
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="glass-card rounded-2xl p-8 space-y-8">

          {/* Subject Input */}
          <div className="space-y-2">
            <label htmlFor="subject" className="block text-sm font-medium text-slate-300 uppercase tracking-widest">
              What do you want to master?
            </label>
            <div className="relative">
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (errors['subject']) setErrors(prev => ({ ...prev, subject: '' }));
                }}
                placeholder="e.g. Machine Learning, React, Piano, Spanish..."
                maxLength={100}
                disabled={isLoading}
                className={`w-full bg-slate-800/60 border ${errors['subject'] ? 'border-red-500/70' : 'border-slate-700/60'} rounded-xl px-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200 disabled:opacity-50 text-lg`}
              />
              {subject && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                  {subject.length}/100
                </span>
              )}
            </div>
            {errors['subject'] && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <span>⚠</span> {errors['subject']}
              </p>
            )}
          </div>

          {/* Timeframe */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300 uppercase tracking-widest">
              Study Timeframe
            </label>
            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {TIMEFRAME_PRESETS.map(preset => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => setTimeframeDays(preset.days)}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
                    timeframeDays === preset.days
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                      : 'bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:border-violet-500/40 hover:text-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {/* Custom Input */}
            <div className="flex items-center gap-3">
              <input
                id="timeframe"
                type="number"
                value={timeframeDays}
                onChange={(e) => {
                  setTimeframeDays(Number(e.target.value));
                  if (errors['timeframe']) setErrors(prev => ({ ...prev, timeframe: '' }));
                }}
                min={1}
                max={365}
                disabled={isLoading}
                className={`w-32 bg-slate-800/60 border ${errors['timeframe'] ? 'border-red-500/70' : 'border-slate-700/60'} rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200 disabled:opacity-50 text-center text-lg font-mono`}
              />
              <span className="text-slate-400 text-sm">custom days (1–365)</span>
            </div>
            {errors['timeframe'] && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <span>⚠</span> {errors['timeframe']}
              </p>
            )}
          </div>

          {/* Level Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300 uppercase tracking-widest">
              Your Current Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTY_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCurrentLevel(option.value)}
                  disabled={isLoading}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 disabled:opacity-50 cursor-pointer ${
                    currentLevel === option.value
                      ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20'
                      : 'border-slate-700/60 bg-slate-800/40 hover:border-slate-600'
                  }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className={`font-semibold text-sm ${currentLevel === option.value ? 'text-violet-300' : 'text-slate-300'}`}>
                    {option.label}
                  </span>
                  <span className="text-xs text-slate-500">{option.desc}</span>
                  {currentLevel === option.value && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="generate-plan-btn"
            disabled={isLoading}
            className="w-full relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-violet-600/30 hover:shadow-violet-500/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0 disabled:cursor-not-allowed text-lg group"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating your plan...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                ✨ Generate Study Plan
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
