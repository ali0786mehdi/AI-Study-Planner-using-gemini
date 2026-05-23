import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Error Banner — shown when Gemini API call fails
// ─────────────────────────────────────────────────────────────────────────────

interface ErrorBannerProps {
  error: string;
  onDismiss: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onDismiss }) => {
  return (
    <div className="w-full max-w-2xl mx-auto" role="alert">
      <div className="glass-card rounded-2xl p-6 border border-red-500/20 bg-red-500/5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
            <span className="text-xl">⚠️</span>
          </div>
          <div className="flex-1">
            <h3 className="text-red-300 font-semibold mb-1">Generation Failed</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={onDismiss}
                className="px-4 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-300 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Try Again
              </button>
              <p className="text-slate-500 text-sm self-center">
                Make sure the backend is running and your Gemini API key is valid.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
