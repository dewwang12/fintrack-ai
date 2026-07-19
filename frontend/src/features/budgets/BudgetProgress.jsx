import React from 'react';
import { Card } from '../../components/UI/Card';
import { formatCurrency } from '../../utils/currency';
import { Edit2, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

export const BudgetProgress = ({
  budget,
  onEdit,
  onDelete,
}) => {
  const { category, limitAmount, spentAmount } = budget;
  
  // Calculate percentage spent
  const percentage = limitAmount > 0 ? Math.round((spentAmount / limitAmount) * 100) : 0;

  // Determine progress color, status icon, and alert messages
  let progressColor = 'bg-emerald-500';
  let badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400';
  let statusIcon = <CheckCircle size={14} className="text-emerald-500" />;
  let statusText = 'On Track';

  if (percentage >= 100) {
    progressColor = 'bg-red-500';
    badgeColor = 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400';
    statusIcon = <AlertTriangle size={14} className="text-red-500" />;
    statusText = 'Over Budget';
  } else if (percentage >= 80) {
    progressColor = 'bg-amber-500';
    badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400';
    statusIcon = <AlertTriangle size={14} className="text-amber-500" />;
    statusText = 'Warning';
  }

  // Cap visual bar width to 100%
  const barWidth = Math.min(percentage, 100);

  return (
    <Card hoverEffect={true} className="flex flex-col gap-4 relative overflow-hidden">
      {/* Top Bar (Title + Actions) */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {category}
          </h3>
          <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
            {budget.period}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(budget)}
            className="text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Edit Limit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(budget._id)}
            className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Delete Budget"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full flex flex-col gap-1.5">
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
        
        {/* Progress Metrics Label */}
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
          <span>{percentage}% spent</span>
          <span>{formatCurrency(limitAmount)} limit</span>
        </div>
      </div>

      {/* Financial Details Info */}
      <div className="flex justify-between items-center border-t border-slate-150/70 dark:border-slate-800/70 pt-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Spent</span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {formatCurrency(spentAmount)}
          </span>
        </div>

        {/* Dynamic status badge */}
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeColor}`}>
          {statusIcon}
          <span>{statusText}</span>
        </span>
      </div>

      {/* Over Limit Alert Banner */}
      {percentage >= 100 && (
        <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/20 text-[11px] font-semibold text-red-650 dark:text-red-400 rounded-xl flex items-center gap-1.5 animate-pulse">
          <AlertTriangle size={12} />
          <span>Over limit by {formatCurrency(spentAmount - limitAmount)}!</span>
        </div>
      )}
      
      {percentage >= 80 && percentage < 100 && (
        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/20 text-[11px] font-semibold text-amber-650 dark:text-amber-400 rounded-xl flex items-center gap-1.5">
          <AlertTriangle size={12} />
          <span>Approaching limit: {formatCurrency(limitAmount - spentAmount)} remaining.</span>
        </div>
      )}
    </Card>
  );
};
export default BudgetProgress;
