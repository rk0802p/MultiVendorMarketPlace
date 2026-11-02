import { ReviewService } from './review.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class ReviewController {
  /**
   * POST /api/reviews/product/:productId
   * Customer submits verified-buyer review
   */
  static async create(req, res, next) {
    try {
      const customerId = req.user._id || req.user.id;
      const { productId } = req.params;
      const review = await ReviewService.createReview(customerId, productId, req.body);

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Verified review submitted successfully',
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reviews/product/:productId
   * Public retrieves published product reviews & rating stats
   */
  static async getByProduct(req, res, next) {
    try {
      const { productId } = req.params;
      const result = await ReviewService.getProductReviews(productId, req.query);

      return ApiResponse.success(res, {
        message: 'Product reviews retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reviews/product/:productId/eligibility
   * Customer checks whether they can write a review for this product
   */
  static async checkEligibility(req, res, next) {
    try {
      const customerId = req.user?._id || req.user?.id;
      const { productId } = req.params;
      const eligibility = await ReviewService.checkEligibility(customerId, productId);

      return ApiResponse.success(res, {
        message: 'Review eligibility checked',
        data: eligibility,
      });
    } catch (error) {
      next(error);
    }
  }
}
