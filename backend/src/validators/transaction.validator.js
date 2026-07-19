const { z } = require('zod');

// Schema for transaction creation request validation
const createTransactionSchema = z.object({
  body: z.object({
    amount: z
      .string({ required_error: 'Amount is required' })
      .transform((val) => Number(val))
      .refine((val) => !isNaN(val) && val > 0, {
        message: 'Amount must be a positive number',
      }),
    type: z
      .string({ required_error: 'Type is required' })
      .refine((val) => ['income', 'expense'].includes(val), {
        message: "Type must be either 'income' or 'expense'",
      }),
    category: z
      .string({ required_error: 'Category is required' })
      .trim()
      .min(1, 'Category cannot be empty'),
    date: z
      .string()
      .optional()
      .transform((val) => (val ? new Date(val) : new Date()))
      .refine((val) => !isNaN(val.getTime()), {
        message: 'Invalid date format',
      }),
    description: z
      .string()
      .optional()
      .default(''),
  }),
});

// Schema for transaction updating request validation (all fields optional)
const updateTransactionSchema = z.object({
  body: z.object({
    amount: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : undefined))
      .refine((val) => val === undefined || (!isNaN(val) && val > 0), {
        message: 'Amount must be a positive number',
      }),
    type: z
      .string()
      .optional()
      .refine((val) => val === undefined || ['income', 'expense'].includes(val), {
        message: "Type must be either 'income' or 'expense'",
      }),
    category: z
      .string()
      .optional()
      .transform((val) => (val ? val.trim() : undefined))
      .refine((val) => val === undefined || val.length > 0, {
        message: 'Category cannot be empty',
      }),
    date: z
      .string()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined))
      .refine((val) => val === undefined || !isNaN(val.getTime()), {
        message: 'Invalid date format',
      }),
    description: z
      .string()
      .optional(),
  }),
});

module.exports = {
  createTransactionSchema,
  updateTransactionSchema,
};
