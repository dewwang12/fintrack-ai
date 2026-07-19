/**
 * Services layer to call Transaction API endpoints.
 */
export const transactionService = {
  /**
   * Get all transactions with filter queries (using useAxiosPrivate instance passed from hook)
   */
  getAll: async (axiosPrivate, params) => {
    const response = await axiosPrivate.get('/transactions', { params });
    return response.data.data;
  },

  /**
   * Get a single transaction detail
   */
  getById: async (axiosPrivate, id) => {
    const response = await axiosPrivate.get(`/transactions/${id}`);
    return response.data.data.transaction;
  },

  /**
   * Create a transaction. Sends FormData for file upload support.
   */
  create: async (axiosPrivate, data) => {
    const formData = new FormData();
    formData.append('amount', data.amount);
    formData.append('type', data.type);
    formData.append('category', data.category);
    formData.append('date', data.date);
    formData.append('description', data.description || '');
    if (data.receipt) {
      formData.append('receipt', data.receipt);
    }

    const response = await axiosPrivate.post('/transactions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.transaction;
  },

  /**
   * Update a transaction. Sends FormData for file upload support.
   */
  update: async (axiosPrivate, id, data) => {
    const formData = new FormData();
    if (data.amount !== undefined) formData.append('amount', data.amount);
    if (data.type !== undefined) formData.append('type', data.type);
    if (data.category !== undefined) formData.append('category', data.category);
    if (data.date !== undefined) formData.append('date', data.date);
    if (data.description !== undefined) formData.append('description', data.description || '');
    if (data.receipt) {
      formData.append('receipt', data.receipt);
    }

    const response = await axiosPrivate.put(`/transactions/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.transaction;
  },

  /**
   * Delete a transaction
   */
  delete: async (axiosPrivate, id) => {
    const response = await axiosPrivate.delete(`/transactions/${id}`);
    return response.data;
  },

  /**
   * Scan receipt using Gemini AI.
   */
  scan: async (axiosPrivate, file) => {
    const formData = new FormData();
    formData.append('receipt', file);

    const response = await axiosPrivate.post('/transactions/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
};

export default transactionService;
