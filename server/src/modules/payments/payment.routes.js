import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { PaymentController } from './payment.controller.js';

const router = Router();

/**
 * @route   POST /api/payments/create-order
 * @desc    Initialize payment provider order (e.g., Razorpay order)
 * @access  Private / Optional Auth
 */
router.post('/create-order', optionalAuthenticate, PaymentController.createOrder);

/**
 * @route   POST /api/payments/verify
 * @desc    Verify payment cryptographic signature and process platform/vendor splits
 * @access  Private / Optional Auth
 */
router.post('/verify', optionalAuthenticate, PaymentController.verify);

/**
 * @route   POST /api/payments/webhook
 * @desc    Receive and idempotently process provider webhook events
 * @access  Public (Signature-Verified via HMAC-SHA256)
 */
router.post('/webhook', PaymentController.webhook);

/**
 * @route   GET /api/payments/ledger
 * @desc    Retrieve platform commission ledger and vendor payout distributions
 * @access  Private (Admin only)
 */
router.get('/ledger', authenticate, authorize('admin'), PaymentController.getLedger);

export default router;
