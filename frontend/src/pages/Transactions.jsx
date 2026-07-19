import React, { useState, useEffect, useCallback } from 'react';
import { useAxiosPrivate } from '../hooks/useAxiosPrivate';
import { transactionService } from '../services/transaction';
import { TransactionTable } from '../features/transactions/TransactionTable';
import { TransactionForm } from '../features/transactions/TransactionForm';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { Plus, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

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

export const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0 });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    type: '',
    category: '',
    startDate: '',
    endDate: '',
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const axiosPrivate = useAxiosPrivate();
  const { logout } = useAuth();

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await transactionService.getAll(axiosPrivate, filters);
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  }, [axiosPrivate, filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters((prev) => ({ ...prev, [id]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      type: '',
      category: '',
      startDate: '',
      endDate: '',
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleCreateOrUpdate = async (formData) => {
    setIsSubmitting(true);
    setError('');
    try {
      if (editingTransaction) {
        // Edit flow
        await transactionService.update(axiosPrivate, editingTransaction._id, formData);
      } else {
        // Create flow
        await transactionService.create(axiosPrivate, formData);
      }
      setIsFormOpen(false);
      fetchTransactions(); // Reload records
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.details || err?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    
    setError('');
    try {
      await transactionService.delete(axiosPrivate, id);
      fetchTransactions();
    } catch (err) {
      setError(err?.response?.data?.message || 'Deletion failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center">
      {/* Top Navbar */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-8 border-b border-slate-200 dark:border-slate-800 pb-5 mt-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Transactions</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and audit your money flow ledger</p>
        </div>
        <div className="flex gap-3">
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
          <Button onClick={handleOpenCreateModal} className="flex items-center gap-1.5">
            <Plus size={16} />
            Add Transaction
          </Button>
        </div>
      </div>

      {error && (
        <div className="w-full max-w-6xl mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 text-red-650 dark:text-red-400 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Filters Card */}
      <Card className="w-full max-w-6xl mb-6" hoverEffect={false}>
        <div className="flex items-center gap-2 mb-4 text-slate-700 dark:text-slate-350">
          <Filter size={18} />
          <h2 className="text-sm font-bold uppercase tracking-wider">Filters toolbar</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Type</label>
            <select
              id="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs text-slate-800 dark:text-slate-100"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
            <select
              id="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs text-slate-800 dark:text-slate-100"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">End Date</label>
            <input
              type="date"
              id="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="w-full flex items-center justify-center gap-1 px-4 py-2 border border-slate-350 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-650 dark:text-slate-300 transition-colors"
            >
              <X size={14} />
              Reset Filters
            </button>
          </div>
        </div>
      </Card>

      {/* Main Grid table */}
      <div className="w-full max-w-6xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <div className="w-10 h-10 rounded-full border-4 border-brand-500/10 border-t-brand-500 animate-spin mb-3" />
            <span className="text-xs text-slate-400 tracking-wider font-semibold uppercase animate-pulse">Loading Ledger...</span>
          </div>
        ) : (
          <>
            <TransactionTable
              transactions={transactions}
              onEdit={handleOpenEditModal}
              onDelete={handleDelete}
            />

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 px-4 py-3 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Showing Page <strong className="text-slate-700 dark:text-slate-200">{pagination.currentPage}</strong> of <strong className="text-slate-700 dark:text-slate-200">{pagination.totalPages}</strong>
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-550 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page === pagination.totalPages}
                    className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-550 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Transaction Modal form */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingTransaction}
        isLoading={isSubmitting}
      />
    </div>
  );
};
export default Transactions;
