import { Router } from 'express';
import { ApiResponse } from '../../utils/apiResponse.js';

const router = Router();

/**
 * @route   GET /api/reviews/product/:productId
 * @desc    Get verified customer reviews for a product
 * @access  Public
 */
router.get('/product/:productId', (req, res) => {
  return ApiResponse.success(res, {
    message: 'Product reviews retrieved (Contract Defined)',
    data: {
      productId: req.params.productId,
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
    },
  });
});

/**
 * @route   POST /api/reviews/product/:productId
 * @desc    Submit verified-purchase review for a product
 * @access  Private (Verified Buyer Customer)
 */
router.post('/product/:productId', (req, res) => {
  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'Verified review submitted successfully (Contract Defined)',
    data: {
      review: {
        id: 'mock_review_id',
        productId: req.params.productId,
        rating: req.body.rating || 5,
        comment: req.body.comment || 'Excellent product!',
      },
    },
  });
});

export default router;
