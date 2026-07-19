const Budget = require('../models/budget.model');
const Transaction = require('../models/transaction.model');
const AppError = require('../utils/AppError');

/**
 * Get date range for calculations
 */
const getDateRange = (period) => {
  const start = new Date();
  const end = new Date();

  if (period === 'monthly') {
    // Start of current month
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    // End of current month
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);
  } else if (period === 'yearly') {
    // Start of current year
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);

    // End of current year
    end.setMonth(11, 31);
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
};

/**
 * Create a new category budget limit
 */
const createBudget = async (userId, data) => {
  // Check if budget for this category already exists
  const existing = await Budget.findOne({ user: userId, category: data.category });
  if (existing) {
    throw new AppError(`A budget limit for category "${data.category}" already exists`, 400);
  }

  const budget = await Budget.create({
    user: userId,
    category: data.category,
    limitAmount: data.limitAmount,
    period: data.period || 'monthly',
  });

  return budget;
};

/**
 * Retrieve user budgets with dynamically calculated spentAmount
 */
const getBudgets = async (userId) => {
  const budgets = await Budget.find({ user: userId });
  
  // Calculate spentAmount for each budget dynamically
  const enrichedBudgets = await Promise.all(
    budgets.map(async (budget) => {
      const { start, end } = getDateRange(budget.period);

      // Aggregate transaction totals for this category
      const result = await Transaction.aggregate([
        {
          $match: {
            user: userId,
            category: budget.category,
            type: 'expense',
            date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: '$amount' },
          },
        },
      ]);

      const spentAmount = result.length > 0 ? result[0].totalSpent : 0;
      
      const budgetObj = budget.toObject();
      budgetObj.spentAmount = spentAmount;

      return budgetObj;
    })
  );

  return enrichedBudgets;
};

/**
 * Update budget limit amount
 */
const updateBudget = async (userId, budgetId, limitAmount) => {
  const budget = await Budget.findById(budgetId);

  if (!budget) {
    throw new AppError('Budget rule not found', 404);
  }

  if (budget.user.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to edit this budget rule', 403);
  }

  budget.limitAmount = limitAmount;
  await budget.save();

  // Return budget enriched with its spentAmount
  const [enriched] = await Promise.all([
    getBudgets(userId).then((list) => list.find((b) => b._id.toString() === budgetId.toString())),
  ]);

  return enriched || budget;
};

/**
 * Remove budget rule
 */
const deleteBudget = async (userId, budgetId) => {
  const budget = await Budget.findById(budgetId);

  if (!budget) {
    throw new AppError('Budget rule not found', 404);
  }

  if (budget.user.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to delete this budget rule', 403);
  }

  await budget.deleteOne();
  return { message: 'Budget rule deleted successfully' };
};

module.exports = {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
};
