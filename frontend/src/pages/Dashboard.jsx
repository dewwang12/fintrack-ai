import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAxiosPrivate } from '../hooks/useAxiosPrivate';
import { analyticsService } from '../services/analytics';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';
import { TrendingUp, DollarSign, Wallet, Calendar, ArrowRight } from 'lucide-react';

export const Dashboard = () => {
  const { auth, logout } = useAuth();
  const [summary, setSummary] = useState({ netBalance: 0, totalIncome: 0, totalExpense: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const axiosPrivate = useAxiosPrivate();

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await analyticsService.getSummary(axiosPrivate);
      setSummary(data.summary);
    } catch (err) {
      console.error('Failed to load dashboard summary metrics', err);
    } finally {
      setIsLoading(false);
    }
  }, [axiosPrivate]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center">
      {/* Top Header */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-8 border-b border-slate-200 dark:border-slate-800 pb-5 mt-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">FinTrack AI</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Enterprise Finance Dashboard</p>
        </div>
        <Button variant="secondary" onClick={logout}>
          Sign Out
        </Button>
      </div>

      <div className="w-full max-w-5xl flex flex-col gap-6">
        {/* Welcome Card & Navigation controls */}
        <Card className="p-8 border border-slate-200/50 dark:border-slate-800/50" hoverEffect={false}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
                Welcome back, {auth.user?.name}!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 leading-relaxed max-w-xl">
                Your enterprise finance operations manager is active. Track transactions, scan receipts, define budget limit constraints, and view live graphs.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Link to="/transactions">
                <Button className="flex items-center gap-1">
                  Manage Ledger <ArrowRight size={14} />
                </Button>
              </Link>
              <Link to="/budgets">
                <Button variant="outline">Budgets</Button>
              </Link>
              <Link to="/analytics">
                <Button variant="secondary">Analytics Charts</Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Live Aggregates Overview */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hoverEffect={true} className="flex items-center gap-4 border border-slate-200/50 dark:border-slate-800/50">
              <div className="p-3 bg-brand-50 dark:bg-brand-950/20 text-brand-500 rounded-xl">
                <Wallet size={20} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Available Balance</span>
                <h3 className={`text-xl font-black mt-0.5 ${summary.netBalance >= 0 ? 'text-slate-800 dark:text-slate-100' : 'text-red-500'}`}>
                  {formatCurrency(summary.netBalance)}
                </h3>
              </div>
            </Card>

            <Card hoverEffect={true} className="flex items-center gap-4 border border-slate-200/50 dark:border-slate-800/50">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl">
                <TrendingUp size={20} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Income</span>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5">
                  {formatCurrency(summary.totalIncome)}
                </h3>
              </div>
            </Card>

            <Card hoverEffect={true} className="flex items-center gap-4 border border-slate-200/50 dark:border-slate-800/50">
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl">
                <TrendingUp size={20} className="rotate-180" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Expenses</span>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5">
                  {formatCurrency(summary.totalExpense)}
                </h3>
              </div>
            </Card>
          </div>
        )}

        {/* Profile Card details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card hoverEffect={false}>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Security Credentials</h3>
            <div className="flex flex-col gap-3.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Account Owner</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{auth.user?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">System Email</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{auth.user?.email}</span>
              </div>
            </div>
          </Card>

          <Card hoverEffect={false}>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 font-sans">Session Meta</h3>
            <div className="flex flex-col gap-3.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1"><Calendar size={14} /> Active Period</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Connection Mode</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-105 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
                  HTTPS Secure
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
