import { useState, useCallback } from 'react';
import { PlannerForm } from './components/PlannerForm';
import { Dashboard } from './components/Dashboard';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ErrorBanner } from './components/ErrorBanner';
import { generateStudyPlan } from './utils/api';
import type { StudyPlan, StudyPlanRequest, AppState } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Root Application Component
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleGeneratePlan = useCallback(async (request: StudyPlanRequest) => {
    setAppState('loading');
    setErrorMessage('');
    setStudyPlan(null);

    const result = await generateStudyPlan(request);

    if (result.success && result.data) {
      setStudyPlan(result.data);
      setAppState('success');
    } else {
      setErrorMessage(result.message ?? result.error ?? 'An unknown error occurred. Please try again.');
      setAppState('error');
    }
  }, []);

  const handleReset = useCallback(() => {
    setAppState('idle');
    setStudyPlan(null);
    setErrorMessage('');
  }, []);

  return (
    <div className="min-h-screen bg-app">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-violet-600/8 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/8 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-slate-700/5 blur-[150px]" />
      </div>

      {/* Top navigation bar */}
      <nav className="relative z-10 border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <span className="text-sm">🧠</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">StudyAI</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20 font-medium">
              Powered by Gemini
            </span>
          </div>

          {appState === 'success' && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors duration-200"
            >
              <span>+</span> New Plan
            </button>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">

        {/* IDLE: Show the form */}
        {appState === 'idle' && (
          <div className="animate-fade-in">
            <PlannerForm onSubmit={handleGeneratePlan} isLoading={false} />
          </div>
        )}

        {/* LOADING: Show skeleton */}
        {appState === 'loading' && (
          <div className="animate-fade-in">
            <LoadingSkeleton />
          </div>
        )}

        {/* ERROR: Show error with form below */}
        {appState === 'error' && (
          <div className="animate-fade-in space-y-8">
            <ErrorBanner error={errorMessage} onDismiss={handleReset} />
            <PlannerForm onSubmit={handleGeneratePlan} isLoading={false} />
          </div>
        )}

        {/* SUCCESS: Show dashboard */}
        {appState === 'success' && studyPlan && (
          <div className="animate-fade-in">
            <Dashboard plan={studyPlan} onReset={handleReset} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-sm text-slate-600">
          <span>AI Study Planner · Built with Gemini 2.5 Flash</span>
          <span>MERN Stack + TypeScript</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
