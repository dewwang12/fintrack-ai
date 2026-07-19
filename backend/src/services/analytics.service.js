const Transaction = require('../models/transaction.model');
const mongoose = require('mongoose');

/**
 * Retrieve net balance, total income, and total expenses dynamically
 */
const getDashboardSummary = async (userId) => {
  // Aggregate total income and expenses
  const result = await Transaction.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpense = 0;

  result.forEach((item) => {
    if (item._id === 'income') totalIncome = item.total;
    if (item._id === 'expense') totalExpense = item.total;
  });

  const netBalance = totalIncome - totalExpense;

  return {
    netBalance,
    totalIncome,
    totalExpense,
  };
};

/**
 * Retrieve categorization breakdown of expenses
 */
const getCategoryBreakdown = async (userId) => {
  // Aggregate expenses grouped by category
  const result = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: 'expense',
      },
    },
    {
      $group: {
        _id: '$category',
        value: { $sum: '$amount' },
      },
    },
    { $sort: { value: -1 } }, // Sort descending
  ]);

  const totalExpense = result.reduce((sum, item) => sum + item.value, 0);

  return result.map((item) => ({
    category: item._id,
    value: item.value,
    percentage: totalExpense > 0 ? Math.round((item.value / totalExpense) * 100) : 0,
  }));
};

/**
 * Retrieve last 6 months monthly trend data
 */
const getMonthlyTrends = async (userId) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const result = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
  ]);

  // Generate continuous list of last 6 months
  const monthlyData = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // MongoDB months are 1-indexed

    monthlyData.push({
      year,
      month,
      name: `${monthNames[month - 1]} ${year.toString().slice(-2)}`,
      income: 0,
      expense: 0,
    });
  }

  // Map database aggregation results into clean monthly details
  result.forEach((item) => {
    const matched = monthlyData.find(
      (m) => m.year === item._id.year && m.month === item._id.month
    );
    if (matched) {
      if (item._id.type === 'income') matched.income = item.total;
      if (item._id.type === 'expense') matched.expense = item.total;
    }
  });

  return monthlyData.map(({ name, income, expense }) => ({
    month: name,
    income,
    expense,
  }));
};

module.exports = {
  getDashboardSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
};
