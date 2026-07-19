const analyticsService = require('../services/analytics.service');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Handle GET request for dashboard summary metrics
 */
const getSummary = asyncHandler(async (req, res, next) => {
  const summary = await analyticsService.getDashboardSummary(req.user._id);
  const categoryBreakdown = await analyticsService.getCategoryBreakdown(req.user._id);
  const monthlyTrends = await analyticsService.getMonthlyTrends(req.user._id);

  res.status(200).json({
    success: true,
    data: {
      summary,
      categoryBreakdown,
      monthlyTrends,
    },
  });
});

module.exports = {
  getSummary,
};
