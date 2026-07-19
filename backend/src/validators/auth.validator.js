const { z } = require('zod');

// Schema for user registration requests
const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Please enter a valid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
  }),
});

// Schema for user login requests
const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Please enter a valid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password cannot be empty'),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
