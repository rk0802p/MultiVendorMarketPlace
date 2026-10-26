import { Router } from 'express';
import { ProductController } from './product.controller.js';
import { createProductSchema, updateProductSchema } from './product.validation.js';
import { validateRequest } from '../auth/auth.validation.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';

const router = Router();

/**
 * @route   GET /api/products
 * @desc    Browse, search, filter, and sort active products
 * @access  Public
 */
router.get('/', ProductController.list);

/**
 * @route   GET /api/products/vendor/my-products
 * @desc    Retrieve all products listed by the authenticated vendor
 * @access  Private (Vendor / Admin)
 */
router.get('/vendor/my-products', authenticate, requireRole('vendor', 'admin'), ProductController.listVendorProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Retrieve product details by ID or slug
 * @access  Public
 */
router.get('/:id', ProductController.getById);

/**
 * @route   POST /api/products
 * @desc    Create a new product listing (Approved Vendor only)
 * @access  Private (Vendor / Admin)
 */
router.post(
  '/',
  authenticate,
  requireRole('vendor', 'admin'),
  validateRequest(createProductSchema),
  ProductController.create
);

/**
 * @route   PATCH /api/products/:id
 * @desc    Update owned product listing
 * @access  Private (Vendor Owner / Admin)
 */
router.patch(
  '/:id',
  authenticate,
  requireRole('vendor', 'admin'),
  validateRequest(updateProductSchema),
  ProductController.update
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Archive/soft-delete owned product
 * @access  Private (Vendor Owner / Admin)
 */
router.delete(
  '/:id',
  authenticate,
  requireRole('vendor', 'admin'),
  ProductController.archive
);

export default router;
