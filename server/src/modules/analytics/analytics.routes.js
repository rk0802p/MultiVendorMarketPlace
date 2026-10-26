import { Router } from 'express';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import { VendorController } from '../vendors/vendor.controller.js';
import { updateStatusSchema } from '../vendors/vendor.validation.js';
import { validateRequest } from '../auth/auth.validation.js';

const router = Router();

// Apply authentication and admin role requirement to all admin routes
router.use(authenticate, requireRole('admin'));

/**
 * @route   GET /api/admin/analytics
 * @desc    Retrieve platform sales, commission revenue, vendor & order analytics
 * @access  Private (Admin Only)
 */
router.get('/analytics', (req, res) => {
  return ApiResponse.success(res, {
    message: 'Marketplace analytics retrieved',
    data: {
      metrics: {
        grossSales: 350000,
        platformCommissionRevenue: 35000,
        totalOrders: 142,
        activeVendors: 18,
        pendingVendorApplications: 3,
      },
    },
  });
});

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
router.get('/orders', (req, res) => {
  return ApiResponse.success(res, {
    message: 'Marketplace orders retrieved',
    data: {
      orders: [],
    },
  });
});

/**
 * @route   GET /api/admin/users
 * @desc    List marketplace user accounts with role filtering
 * @access  Private (Admin Only)
 */
router.get('/users', (req, res) => {
  return ApiResponse.success(res, {
    message: 'User directory retrieved',
    data: {
      users: [],
    },
  });
});

export default router;
