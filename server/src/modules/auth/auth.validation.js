import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters').trim(),
  email: z.string().email('Please enter a valid email address').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password is too long'),
  role: z.enum(['customer', 'vendor']).optional().default('customer'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }
  };
};
