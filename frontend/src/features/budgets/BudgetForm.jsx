import React, { useState, useEffect } from 'react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Modal } from '../../components/UI/Modal';

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

export const BudgetForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    category: CATEGORIES[0],
    limitAmount: '',
    period: 'monthly',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        category: initialData.category,
        limitAmount: initialData.limitAmount.toString(),
        period: initialData.period || 'monthly',
      });
    } else {
      setFormData({
        category: CATEGORIES[0],
        limitAmount: '',
        period: 'monthly',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.limitAmount) {
      tempErrors.limitAmount = 'Limit amount is required';
    } else if (isNaN(formData.limitAmount) || Number(formData.limitAmount) <= 0) {
      tempErrors.limitAmount = 'Limit must be a positive number';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit({
      category: formData.category,
      limitAmount: Number(formData.limitAmount),
      period: formData.period,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Limit for ${formData.category}` : 'Define Budget Limit'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!initialData && (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="category"
              className="text-xs font-semibold text-slate-650 dark:text-slate-400 uppercase tracking-wider"
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
                // Ignore salary category for budgets
                cat !== 'Salary & Income' && (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                )
              ))}
            </select>
          </div>
        )}

        <Input
          label="Budget Limit Amount"
          id="limitAmount"
          type="number"
          placeholder="500"
          value={formData.limitAmount}
          onChange={handleChange}
          error={errors.limitAmount}
          disabled={isLoading}
        />

        <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Set Limit
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default BudgetForm;
