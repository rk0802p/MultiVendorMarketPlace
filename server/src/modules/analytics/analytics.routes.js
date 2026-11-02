import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import { VendorController } from '../vendors/vendor.controller.js';
import { updateStatusSchema } from '../vendors/vendor.validation.js';
import { validateRequest } from '../auth/auth.validation.js';
import { AnalyticsController } from './analytics.controller.js';

const router = Router();

// Apply authentication and admin role requirement to all admin routes
router.use(authenticate, requireRole('admin'));

/**
 * @route   GET /api/admin/analytics
 * @desc    Retrieve platform sales, commission revenue, vendor & order analytics
 * @access  Private (Admin Only)
 */
router.get('/analytics', AnalyticsController.getAnalytics);

/**
 * @route   PATCH /api/admin/vendors/:id/status
 * @desc    Approve or reject a vendor application
 * @access  Private (Admin Only)
 */
router.patch('/vendors/:id/status', validateRequest(updateStatusSchema), VendorController.updateStatus);

/**
 * @route   GET /api/admin/orders
 * @desc    Retrieve all marketplace orders with vendor breakdowns
 * @access  Private (Admin Only)
 */
router.get('/orders', AnalyticsController.getOrders);

/**
 * @route   GET /api/admin/users
 * @desc    List marketplace user accounts with role filtering
 * @access  Private (Admin Only)
 */
router.get('/users', AnalyticsController.getUsers);

export default router;
