import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { ReviewController } from './review.controller.js';

const router = Router();

/**
 * @route   GET /api/reviews/product/:productId
 * @desc    Get verified customer reviews & stats for a product
 * @access  Public
 */
router.get('/product/:productId', ReviewController.getByProduct);

/**
 * @route   GET /api/reviews/product/:productId/eligibility
 * @desc    Check whether customer is eligible to write a review
 * @access  Private / Public (optional auth)
 */
router.get('/product/:productId/eligibility', optionalAuthenticate, ReviewController.checkEligibility);

/**
 * @route   POST /api/reviews/product/:productId
 * @desc    Submit verified-purchase review for a product
 * @access  Private (Verified Buyer Customer)
 */
router.post(
  '/product/:productId',
  authenticate,
  authorize('customer', 'admin'),
  ReviewController.create
);

export default router;
