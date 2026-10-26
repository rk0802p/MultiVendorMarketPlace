import { z } from 'zod';

export const applyStoreSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters').max(120, 'Store name too long').trim(),
  slug: z.string().min(2, 'Slug must be at least 2 characters').max(120).trim().toLowerCase().regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens').optional(),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional().default(''),
  contactEmail: z.string().email('Please enter a valid contact email').trim().toLowerCase().optional(),
  contactPhone: z.string().min(8, 'Phone number must be at least 8 digits').max(20).optional(),
});

export const updateStoreSchema = z.object({
  name: z.string().min(2).max(120).trim().optional(),
  description: z.string().max(1000).optional(),
  logo: z.string().url('Logo must be a valid URL').optional().or(z.literal('')),
  banner: z.string().url('Banner must be a valid URL').optional().or(z.literal('')),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['approved', 'rejected', 'pending']),
  rejectionReason: z.string().optional(),
});
