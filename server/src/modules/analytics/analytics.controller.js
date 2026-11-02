import { AnalyticsService } from './analytics.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class AnalyticsController {
  /**
   * GET /api/admin/analytics
   * Retrieve platform sales, commission, and marketplace KPIs
   */
  static async getAnalytics(req, res, next) {
    try {
      const data = await AnalyticsService.getMarketplaceAnalytics();
      return ApiResponse.success(res, {
        message: 'Marketplace analytics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/orders
   * Platform-wide order oversight
   */
  static async getOrders(req, res, next) {
    try {
      const result = await AnalyticsService.getAdminOrders(req.query);
      return ApiResponse.success(res, {
        message: 'Marketplace orders retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/users
   * User account management & role inspection
   */
  static async getUsers(req, res, next) {
    try {
      const result = await AnalyticsService.getAdminUsers(req.query);
      return ApiResponse.success(res, {
        message: 'User directory retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
