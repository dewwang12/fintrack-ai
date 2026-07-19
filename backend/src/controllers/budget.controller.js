const budgetService = require('../services/budget.service');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Handle POST request to create a budget rule
 */
const create = asyncHandler(async (req, res, next) => {
  const budget = await budgetService.createBudget(req.user._id, req.body);

  res.status(201).json({
    success: true,
    data: { budget },
  });
});

/**
 * Handle GET request to retrieve user budgets
 */
const getAll = asyncHandler(async (req, res, next) => {
  const budgets = await budgetService.getBudgets(req.user._id);

  res.status(200).json({
    success: true,
    data: { budgets },
  });
});

/**
 * Handle PUT request to edit budget limits
 */
const update = asyncHandler(async (req, res, next) => {
  const budget = await budgetService.updateBudget(
    req.user._id,
    req.params.id,
    req.body.limitAmount
  );

  res.status(200).json({
    success: true,
    data: { budget },
  });
});

/**
 * Handle DELETE request to remove a budget rule
 */
const remove = asyncHandler(async (req, res, next) => {
  const result = await budgetService.deleteBudget(req.user._id, req.params.id);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

module.exports = {
  create,
  getAll,
  update,
  remove,
};
