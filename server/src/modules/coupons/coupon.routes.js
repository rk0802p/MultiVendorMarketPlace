import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { CouponController } from './coupon.controller.js';

const router = Router();

/**
 * @route   POST /api/coupons/validate
 * @desc    Validate coupon code against current cart subtotal
 * @access  Public / Customer
 */
router.post('/validate', optionalAuthenticate, CouponController.validate);

/**
 * @route   GET /api/coupons
 * @desc    List marketplace coupons
 * @access  Private (Admin Only)
 */
router.get('/', authenticate, authorize('admin'), CouponController.list);

/**
 * @route   POST /api/coupons
 * @desc    Create promotional coupon
 * @access  Private (Admin Only)
 */
router.post('/', authenticate, authorize('admin'), CouponController.create);

/**
 * @route   PATCH /api/coupons/:id/toggle
 * @desc    Toggle coupon active status
 * @access  Private (Admin Only)
 */
router.patch('/:id/toggle', authenticate, authorize('admin'), CouponController.toggle);

export default router;
