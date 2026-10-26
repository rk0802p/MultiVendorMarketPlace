import { Router } from 'express';
import { ApiResponse } from '../../utils/apiResponse.js';

const router = Router();

/**
 * @route   POST /api/coupons/validate
 * @desc    Validate coupon code against current cart subtotal
 * @access  Private (Customer)
 */
router.post('/validate', (req, res) => {
  return ApiResponse.success(res, {
    message: 'Coupon is valid (Contract Defined)',
    data: {
      code: req.body.code || 'SAVE10',
      type: 'percentage',
      value: 10,
      discountCalculated: 300,
    },
  });
});

/**
 * @route   GET /api/coupons
 * @desc    List marketplace coupons
 * @access  Private (Admin)
 */
router.get('/', (req, res) => {
  return ApiResponse.success(res, {
    message: 'Coupons retrieved (Contract Defined)',
    data: {
      coupons: [],
    },
  });
});

/**
 * @route   POST /api/coupons
 * @desc    Create promotional coupon
 * @access  Private (Admin)
 */
router.post('/', (req, res) => {
  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'Coupon created successfully (Contract Defined)',
    data: {
      coupon: {
        code: req.body.code || 'FESTIVE20',
        type: req.body.type || 'percentage',
        value: req.body.value || 20,
        isActive: true,
      },
    },
  });
});

export default router;
