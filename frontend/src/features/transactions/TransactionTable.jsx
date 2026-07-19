import React from 'react';
import { formatCurrency } from '../../utils/currency';
import { Edit2, Trash2, FileText, Image } from 'lucide-react';

export const TransactionTable = ({
  transactions,
  onEdit,
  onDelete,
}) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
        <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
          <FileText size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No Transactions Found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
          Start recording your financial operations by clicking the "Add Transaction" button.
        </p>
      </div>
    );
  }

  const getReceiptIcon = (url) => {
    if (!url) return null;
    const isPdf = url.toLowerCase().endsWith('.pdf');
    return isPdf ? <FileText size={16} className="text-red-500" /> : <Image size={16} className="text-blue-500" />;
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/55 dark:bg-slate-950/20 text-xs font-semibold text-slate-650 dark:text-slate-400 uppercase tracking-wider">
            <th className="p-4">Date</th>
            <th className="p-4">Category</th>
            <th className="p-4">Description</th>
            <th className="p-4">Receipt</th>
            <th className="p-4">Type</th>
            <th className="p-4 text-right">Amount</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm text-slate-700 dark:text-slate-350">
          {transactions.map((tr) => (
            <tr key={tr._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
              <td className="p-4 whitespace-nowrap">
                {new Date(tr.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td className="p-4 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                {tr.category}
              </td>
              <td className="p-4 max-w-xs truncate" title={tr.description}>
                {tr.description || '—'}
              </td>
              <td className="p-4 whitespace-nowrap">
                {tr.receipt && tr.receipt.url ? (
                  <a
                    href={tr.receipt.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-350 font-semibold transition-colors"
                  >
                    {getReceiptIcon(tr.receipt.url)}
                    <span>View Receipt</span>
                  </a>
                ) : (
                  <span className="text-slate-400 dark:text-slate-600 text-xs">—</span>
                )}
              </td>
              <td className="p-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                    ${tr.type === 'income'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                      : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                    }`}
                >
                  {tr.type}
                </span>
              </td>
              <td
                className={`p-4 text-right font-bold whitespace-nowrap
                  ${tr.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}
              >
                {tr.type === 'income' ? '+' : '-'}{formatCurrency(tr.amount)}
              </td>
              <td className="p-4">
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => onEdit(tr)}
                    className="text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Edit transaction"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(tr._id)}
                    className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Delete transaction"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default TransactionTable;
