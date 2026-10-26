import { Router } from 'express';
import { ApiResponse } from '../../utils/apiResponse.js';

const router = Router();

/**
 * @route   POST /api/vendors/apply
 * @desc    Apply to become a marketplace vendor
 * @access  Private (Customer)
 */
router.post('/apply', (req, res) => {
  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'Vendor application submitted for review (Contract Defined)',
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
 * @access  Private (Vendor)
 */
router.get('/me', (req, res) => {
  return ApiResponse.success(res, {
    message: 'Vendor store profile retrieved (Contract Defined)',
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
 * @access  Private (Vendor)
 */
router.patch('/me', (req, res) => {
  return ApiResponse.success(res, {
    message: 'Store profile updated successfully (Contract Defined)',
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
