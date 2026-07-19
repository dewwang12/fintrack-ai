import React, { useState, useEffect, useCallback } from 'react';
import { useAxiosPrivate } from '../hooks/useAxiosPrivate';
import { analyticsService } from '../services/analytics';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { formatCurrency } from '../utils/currency';
import { Link } from 'react-router-dom';
import { Info, TrendingUp, DollarSign, PieChart as PieIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const CHART_COLORS = [
  '#5c7af6', // Brand Blue
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f43f5e', // Rose
  '#64748b', // Slate
];

export const Analytics = () => {
  const [data, setData] = useState({
    summary: { netBalance: 0, totalIncome: 0, totalExpense: 0 },
    categoryBreakdown: [],
    monthlyTrends: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const axiosPrivate = useAxiosPrivate();

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const summaryData = await analyticsService.getSummary(axiosPrivate);
      setData(summaryData);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch financial analysis metrics');
    } finally {
      setIsLoading(false);
    }
  }, [axiosPrivate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const { summary, categoryBreakdown, monthlyTrends } = data;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center">
      {/* Top Navbar */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-8 border-b border-slate-200 dark:border-slate-800 pb-5 mt-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Interactive reports and cash trends</p>
        </div>
        <Link to="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>

      {error && (
        <div className="w-full max-w-6xl mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 text-red-650 dark:text-red-400 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20">
          <div className="w-10 h-10 rounded-full border-4 border-brand-500/10 border-t-brand-500 animate-spin mb-3" />
          <span className="text-xs text-slate-400 tracking-wider font-semibold uppercase animate-pulse">Analyzing Financial Records...</span>
        </div>
      ) : categoryBreakdown.length === 0 && monthlyTrends.every((m) => m.income === 0 && m.expense === 0) ? (
        <div className="w-full max-w-6xl flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
          <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-455 mb-4 animate-pulse">
            <Info size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-850 dark:text-slate-100">Insufficient Data</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
            Record some transactions (income or expenses) to generate visual graphs.
          </p>
          <Link to="/transactions" className="mt-5">
            <Button>Go to Ledger</Button>
          </Link>
        </div>
      ) : (
        <div className="w-full max-w-6xl flex flex-col gap-6">
          {/* Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hoverEffect={false} className="flex items-center gap-4 border border-slate-200/60 dark:border-slate-800/60">
              <div className="p-3 bg-brand-50 dark:bg-brand-950/20 text-brand-500 rounded-xl">
                <DollarSign size={24} />
              </div>
              <div>
                <span className="text-[10px] text-slate-450 dark:text-slate-500 uppercase font-bold tracking-wider">Net Balance</span>
                <h3 className={`text-2xl font-black mt-0.5 ${summary.netBalance >= 0 ? 'text-slate-850 dark:text-slate-100' : 'text-red-500'}`}>
                  {formatCurrency(summary.netBalance)}
                </h3>
              </div>
            </Card>

            <Card hoverEffect={false} className="flex items-center gap-4 border border-slate-200/60 dark:border-slate-800/60">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl">
                <TrendingUp size={24} />
              </div>
              <div>
                <span className="text-[10px] text-slate-450 dark:text-slate-500 uppercase font-bold tracking-wider">Total Income</span>
                <h3 className="text-2xl font-black text-slate-850 dark:text-slate-100 mt-0.5">
                  {formatCurrency(summary.totalIncome)}
                </h3>
              </div>
            </Card>

            <Card hoverEffect={false} className="flex items-center gap-4 border border-slate-200/60 dark:border-slate-800/60">
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl">
                <TrendingUp size={24} className="rotate-180" />
              </div>
              <div>
                <span className="text-[10px] text-slate-450 dark:text-slate-500 uppercase font-bold tracking-wider">Total Expenses</span>
                <h3 className="text-2xl font-black text-slate-850 dark:text-slate-100 mt-0.5">
                  {formatCurrency(summary.totalExpense)}
                </h3>
              </div>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Income vs Expenses Bar Chart */}
            <Card hoverEffect={false} className="lg:col-span-3 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-brand-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Income vs Expenses Trends</h2>
              </div>
              <div className="h-80 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#f8fafc',
                      }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Category Split Donut Chart */}
            <Card hoverEffect={false} className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <PieIcon size={18} className="text-pink-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Category Expense Split</h2>
              </div>
              <div className="h-60 w-full">
                {categoryBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        dataKey="value"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#f8fafc',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No expense category allocations recorded yet.
                  </div>
                )}
              </div>

              {/* Dynamic Legend List */}
              <div className="max-h-36 overflow-y-auto flex flex-col gap-2.5 pr-1 border-t border-slate-100 dark:border-slate-800/80 pt-3 text-xs">
                {categoryBreakdown.map((item, index) => (
                  <div key={item.category} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="font-semibold text-slate-755 dark:text-slate-300">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-slate-500 font-bold">
                      {formatCurrency(item.value)} ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
export default Analytics;
