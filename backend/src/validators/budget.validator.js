const { z } = require('zod');

// Schema for budget creation
const createBudgetSchema = z.object({
  body: z.object({
    category: z
      .string({ required_error: 'Category is required' })
      .trim()
      .min(1, 'Category cannot be empty'),
    limitAmount: z
      .number({ required_error: 'Limit amount is required' })
      .positive('Limit must be a positive number'),
    period: z
      .string()
      .optional()
      .refine((val) => val === undefined || ['monthly', 'yearly'].includes(val), {
        message: 'Period must be monthly or yearly',
      }),
  }),
});

// Schema for budget updates
const updateBudgetSchema = z.object({
  body: z.object({
    limitAmount: z
      .number({ required_error: 'Limit amount is required' })
      .positive('Limit must be a positive number'),
  }),
});

module.exports = {
  createBudgetSchema,
  updateBudgetSchema,
};
