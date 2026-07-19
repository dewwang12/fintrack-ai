import React from 'react';

/**
 * Reusable, premium Input wrapper supporting labels, placeholders, and error messages.
 */
export const Input = ({
  label,
  id,
  type = 'text',
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        className={`px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none transition-all duration-200 text-sm
          ${error 
            ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
            : 'border-slate-200 dark:border-slate-700/60 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
          }
          text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 font-medium">
          {error}
        </span>
      )}
    </div>
  );
};
export default Input;
