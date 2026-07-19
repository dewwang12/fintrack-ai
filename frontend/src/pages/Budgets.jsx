import React, { useState, useEffect, useCallback } from 'react';
import { useAxiosPrivate } from '../hooks/useAxiosPrivate';
import { budgetService } from '../services/budget';
import { BudgetProgress } from '../features/budgets/BudgetProgress';
import { BudgetForm } from '../features/budgets/BudgetForm';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { Plus, Info, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { Link } from 'react-router-dom';

export const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [error, setError] = useState('');

  const axiosPrivate = useAxiosPrivate();

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await budgetService.getAll(axiosPrivate);
      setBudgets(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch budget metrics');
    } finally {
      setIsLoading(false);
    }
  }, [axiosPrivate]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleOpenCreateModal = () => {
    setEditingBudget(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const handleCreateOrUpdate = async (formData) => {
    setIsSubmitting(true);
    setError('');
    try {
      if (editingBudget) {
        // Edit flow
        await budgetService.update(axiosPrivate, editingBudget._id, formData.limitAmount);
      } else {
        // Create flow
        await budgetService.create(axiosPrivate, formData);
      }
      setIsFormOpen(false);
      fetchBudgets();
    } catch (err) {
      setError(err?.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this budget limit rule?')) return;

    setError('');
    try {
      await budgetService.delete(axiosPrivate, id);
      fetchBudgets();
    } catch (err) {
      setError(err?.response?.data?.message || 'Deletion failed');
    }
  };

  // Calculate summary totals
  const totalLimit = budgets.reduce((sum, b) => sum + b.limitAmount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
  const totalRemaining = Math.max(totalLimit - totalSpent, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center">
      {/* Top Navbar */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-8 border-b border-slate-200 dark:border-slate-800 pb-5 mt-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Budgets</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Set category ceilings and manage overruns</p>
        </div>
        <div className="flex gap-3">
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
          <Button onClick={handleOpenCreateModal} className="flex items-center gap-1.5">
            <Plus size={16} />
            Define Budget
          </Button>
        </div>
      </div>

      {error && (
        <div className="w-full max-w-6xl mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 text-red-650 dark:text-red-400 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Summary Row */}
      {budgets.length > 0 && (
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card hoverEffect={false} className="border-l-4 border-l-brand-500">
            <span className="text-xs text-slate-450 dark:text-slate-500 uppercase font-bold tracking-wider">Total Allowance</span>
            <h3 className="text-2xl font-black text-slate-850 dark:text-slate-100 mt-1">
              {formatCurrency(totalLimit)}
            </h3>
          </Card>

          <Card hoverEffect={false} className="border-l-4 border-l-red-500">
            <span className="text-xs text-slate-450 dark:text-slate-500 uppercase font-bold tracking-wider">Total Consumed</span>
            <h3 className="text-2xl font-black text-slate-850 dark:text-slate-100 mt-1">
              {formatCurrency(totalSpent)}
            </h3>
          </Card>

          <Card hoverEffect={false} className="border-l-4 border-l-emerald-500">
            <span className="text-xs text-slate-450 dark:text-slate-500 uppercase font-bold tracking-wider">Total Remaining</span>
            <h3 className="text-2xl font-black text-slate-850 dark:text-slate-100 mt-1">
              {formatCurrency(totalRemaining)}
            </h3>
          </Card>
        </div>
      )}

      {/* Budget Grid Cards */}
      <div className="w-full max-w-6xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <div className="w-10 h-10 rounded-full border-4 border-brand-500/10 border-t-brand-500 animate-spin mb-3" />
            <span className="text-xs text-slate-400 tracking-wider font-semibold uppercase animate-pulse">Loading Budget Details...</span>
          </div>
        ) : budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
            <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-450 mb-4 animate-bounce">
              <Info size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-100">No Budgets Defined</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
              Ensure you don't overspend. Create budget ceilings per category (such as Food or Dining).
            </p>
            <Button onClick={handleOpenCreateModal} className="mt-5 flex items-center gap-1.5">
              <Plus size={16} />
              Set First Budget
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((bg) => (
              <BudgetProgress
                key={bg._id}
                budget={bg}
                onEdit={handleOpenEditModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Budget Limit Form Modal */}
      <BudgetForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingBudget}
        isLoading={isSubmitting}
      />
    </div>
  );
};
export default Budgets;
