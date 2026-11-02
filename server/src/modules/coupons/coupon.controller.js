import { CouponService } from './coupon.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class CouponController {
  /**
   * POST /api/coupons/validate
   * Customer validates promo coupon against cart subtotal
   */
  static async validate(req, res, next) {
    try {
      const { code, cartSubtotal } = req.body;
      const result = await CouponService.validateCoupon(code, cartSubtotal);
      return ApiResponse.success(res, {
        message: 'Coupon is valid and applied',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/coupons
   * Admin creates a new promo coupon
   */
  static async create(req, res, next) {
    try {
      const coupon = await CouponService.createCoupon(req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Coupon created successfully',
        data: { coupon },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/coupons
   * Admin lists all promo coupons
   */
  static async list(req, res, next) {
    try {
      const coupons = await CouponService.getAllCoupons();
      return ApiResponse.success(res, {
        message: 'Coupons retrieved successfully',
        data: { coupons },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/coupons/:id/toggle
   * Admin toggles coupon active status
   */
  static async toggle(req, res, next) {
    try {
      const coupon = await CouponService.toggleCouponStatus(req.params.id);
      return ApiResponse.success(res, {
        message: `Coupon status updated to ${coupon.isActive ? 'active' : 'inactive'}`,
        data: { coupon },
      });
    } catch (error) {
      next(error);
    }
  }
}
