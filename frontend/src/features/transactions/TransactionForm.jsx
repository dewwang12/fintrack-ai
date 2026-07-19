import React, { useState, useEffect } from 'react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Modal } from '../../components/UI/Modal';
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate';
import { transactionService } from '../../services/transaction';

const CATEGORIES = [
  'Food & Dining',
  'Housing & Rent',
  'Utilities',
  'Salary & Income',
  'Transport & Taxi',
  'Entertainment & Leisure',
  'Healthcare',
  'Shopping',
  'Investments',
  'Others',
];

export const TransactionForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: CATEGORIES[0],
    date: new Date().toISOString().split('T')[0],
    description: '',
    receipt: null,
  });
  const [errors, setErrors] = useState({});
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const axiosPrivate = useAxiosPrivate();

  const handleScanReceipt = async () => {
    if (!formData.receipt) return;
    setIsScanning(true);
    setScanError('');
    try {
      const data = await transactionService.scan(axiosPrivate, formData.receipt);
      setFormData((prev) => ({
        ...prev,
        amount: data.amount ? data.amount.toString() : prev.amount,
        type: data.type || prev.type,
        category: data.category || prev.category,
        date: data.date ? new Date(data.date).toISOString().split('T')[0] : prev.date,
        description: data.description || prev.description,
      }));
    } catch (err) {
      setScanError(err?.response?.data?.message || err?.message || 'AI scanning failed.');
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount.toString(),
        type: initialData.type,
        category: initialData.category,
        date: new Date(initialData.date).toISOString().split('T')[0],
        description: initialData.description || '',
        receipt: null, // Don't bind receipt file object back, handles separately
      });
    } else {
      // Reset form
      setFormData({
        amount: '',
        type: 'expense',
        category: CATEGORIES[0],
        date: new Date().toISOString().split('T')[0],
        description: '',
        receipt: null,
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.amount) {
      tempErrors.amount = 'Amount is required';
    } else if (isNaN(formData.amount) || Number(formData.amount) <= 0) {
      tempErrors.amount = 'Amount must be a positive number';
    }

    if (!formData.category) {
      tempErrors.category = 'Category is required';
    }

    if (!formData.date) {
      tempErrors.date = 'Date is required';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, receipt: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'Add Transaction'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Amount"
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={handleChange}
          error={errors.amount}
          disabled={isLoading}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, type: 'expense' }))}
              className={`py-2 px-4 rounded-xl border text-sm font-semibold transition-all duration-200
                ${formData.type === 'expense'
                  ? 'bg-red-50 dark:bg-red-950/20 border-red-500 text-red-600 dark:text-red-400 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, type: 'income' }))}
              className={`py-2 px-4 rounded-xl border text-sm font-semibold transition-all duration-200
                ${formData.type === 'income'
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
            >
              Income
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="category"
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
          >
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={handleChange}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl outline-none focus:border-brand-500 text-sm text-slate-850 dark:text-slate-100"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Date"
          id="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          error={errors.date}
          disabled={isLoading}
        />

        <Input
          label="Description (Optional)"
          id="description"
          placeholder="Lunch, utility bill details..."
          value={formData.description}
          onChange={handleChange}
          disabled={isLoading}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Receipt File (Optional)
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-slate-800 dark:file:text-slate-200 text-slate-500 flex-1"
            />
            {formData.receipt && !initialData && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleScanReceipt}
                isLoading={isScanning}
                className="flex items-center gap-1 border-brand-500/30 text-brand-600 hover:bg-brand-50/50"
              >
                Scan with AI
              </Button>
            )}
          </div>
          {scanError && (
            <span className="text-[11px] text-red-500 font-medium mt-1">
              {scanError}
            </span>
          )}
          {isScanning && (
            <span className="text-[11px] text-brand-500 font-medium mt-1 animate-pulse">
              Gemini AI is analyzing receipt layout...
            </span>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default TransactionForm;
