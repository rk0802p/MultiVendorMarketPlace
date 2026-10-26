import { Router } from 'express';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';

const router = Router();

/**
 * @route   POST /api/vendors/apply
 * @desc    Apply to become a marketplace vendor
 * @access  Private (Customer)
 */
router.post('/apply', authenticate, requireRole('customer'), (req, res) => {
  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'Vendor application submitted for review',
    data: {
      store: {
        id: 'mock_store_id',
        name: req.body.name || 'Sample Store',
        slug: req.body.slug || 'sample-store',
        approvalStatus: 'pending',
      },
    },
  });
});

/**
 * @route   GET /api/vendors/me
 * @desc    Get authenticated vendor's store details
 * @access  Private (Vendor / Admin)
 */
router.get('/me', authenticate, requireRole('vendor', 'admin'), (req, res) => {
  return ApiResponse.success(res, {
    message: 'Vendor store profile retrieved',
    data: {
      store: {
        id: 'mock_store_id',
        name: 'TechMart Electronics',
        slug: 'techmart-electronics',
        approvalStatus: 'approved',
      },
    },
  });
});

/**
 * @route   PATCH /api/vendors/me
 * @desc    Update authenticated vendor's store profile
 * @access  Private (Vendor / Admin)
 */
router.patch('/me', authenticate, requireRole('vendor', 'admin'), (req, res) => {
  return ApiResponse.success(res, {
    message: 'Store profile updated successfully',
    data: {
      store: {
        id: 'mock_store_id',
        name: req.body.name || 'TechMart Electronics',
        description: req.body.description || 'Updated description',
        approvalStatus: 'approved',
      },
    },
  });
});

export default router;
