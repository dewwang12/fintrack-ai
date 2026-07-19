import React from 'react';

/**
 * Centered animated loading spinner overlay.
 */
export const Spinner = ({ fullScreen = false }) => {
  const spinnerElement = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        {/* Outer glowing ring */}
        <div className="w-12 h-12 rounded-full border-4 border-brand-500/10 border-t-brand-500 animate-spin" />
        {/* Inner static ring */}
        <div className="absolute top-1 left-1 w-10 h-10 rounded-full border-4 border-slate-200 dark:border-slate-800 opacity-20" />
      </div>
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 animate-pulse">
        Securing Session...
      </span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

export default Spinner;
