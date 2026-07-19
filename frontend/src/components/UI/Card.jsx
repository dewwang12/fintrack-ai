import React from 'react';

/**
 * Reusable panel card wrapper implementing global glassmorphism styling presets.
 */
export const Card = ({
  children,
  className = '',
  hoverEffect = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm rounded-2xl
        ${hoverEffect ? 'glow-hover' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}`}
    >
      {children}
    </div>
  );
};
export default Card;
