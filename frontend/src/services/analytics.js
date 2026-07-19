/**
 * Services layer to call Analytics API endpoints.
 */
export const analyticsService = {
  /**
   * Get overall summary, category split, and monthly trend data
   */
  getSummary: async (axiosPrivate) => {
    const response = await axiosPrivate.get('/analytics/summary');
    return response.data.data;
  },
};

export default analyticsService;
