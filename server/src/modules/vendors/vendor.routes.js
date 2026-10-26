import { Router } from 'express';
import { VendorController } from './vendor.controller.js';
import { applyStoreSchema, updateStoreSchema, updateStatusSchema } from './vendor.validation.js';
import { validateRequest } from '../auth/auth.validation.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';

const router = Router();

/**
 * @route   POST /api/vendors/apply
 * @desc    Apply to become a marketplace vendor
 * @access  Private (Authenticated User / Customer)
 */
router.post('/apply', authenticate, validateRequest(applyStoreSchema), VendorController.apply);

/**
 * @route   GET /api/vendors/me
 * @desc    Get authenticated vendor's store details
 * @access  Private (Vendor / Admin)
 */
router.get('/me', authenticate, requireRole('vendor', 'admin'), VendorController.getMe);

/**
 * @route   PATCH /api/vendors/me
 * @desc    Update authenticated vendor's store profile
 * @access  Private (Vendor / Admin)
 */
router.patch('/me', authenticate, requireRole('vendor', 'admin'), validateRequest(updateStoreSchema), VendorController.updateMe);

/**
 * @route   GET /api/vendors
 * @desc    List marketplace stores
 * @access  Public
 */
router.get('/', VendorController.listStores);

/**
 * @route   GET /api/vendors/:idOrSlug
 * @desc    Get public store profile by ID or slug
 * @access  Public
 */
router.get('/:idOrSlug', VendorController.getStoreById);

export default router;
