/**
 * Services layer to call Budget API endpoints.
 */
export const budgetService = {
  /**
   * Retrieve all category budgets (with spentAmount aggregated)
   */
  getAll: async (axiosPrivate) => {
    const response = await axiosPrivate.get('/budgets');
    return response.data.data.budgets;
  },

  /**
   * Define/Create a new category budget limit
   */
  create: async (axiosPrivate, data) => {
    const response = await axiosPrivate.post('/budgets', data);
    return response.data.data.budget;
  },

  /**
   * Update budget limit amount
   */
  update: async (axiosPrivate, id, limitAmount) => {
    const response = await axiosPrivate.put(`/budgets/${id}`, { limitAmount });
    return response.data.data.budget;
  },

  /**
   * Remove a budget rule
   */
  delete: async (axiosPrivate, id) => {
    const response = await axiosPrivate.delete(`/budgets/${id}`);
    return response.data;
  },
};

export default budgetService;
