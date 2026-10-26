import { z } from 'zod';

export const createProductSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200, 'Title cannot exceed 200 characters').trim(),
  description: z.string().min(10, 'Description must be at least 10 characters').trim(),
  category: z.string().min(2, 'Category is required').trim(),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  stock: z.number().int('Stock must be an integer').min(0, 'Stock cannot be negative'),
  images: z.array(z.string().url('Each image must be a valid URL')).optional().default([]),
  status: z.enum(['active', 'draft']).optional().default('active'),
});

export const updateProductSchema = z.object({
  title: z.string().min(2).max(200).trim().optional(),
  description: z.string().min(10).trim().optional(),
  category: z.string().min(2).trim().optional(),
  price: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.string().url()).optional(),
  status: z.enum(['active', 'draft', 'archived']).optional(),
});
