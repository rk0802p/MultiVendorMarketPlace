import { OrderService } from './order.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class OrderController {
  /**
   * POST /api/orders
   * Concurrency-safe atomic checkout and order creation
   */
  static async checkout(req, res, next) {
    try {
      const customerId = req.user?._id || req.user?.id || '653a1b2c3d4e5f6a7b8c9d33';
      const result = await OrderService.checkoutOrder(customerId, req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Order placed successfully',
        data: {
          orderId: result.order._id,
          orderNumber: result.order.orderNumber,
          totals: result.order.totals,
          paymentStatus: result.order.paymentStatus,
          overallStatus: result.order.overallStatus,
          items: result.order.items,
          payment: result.payment,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/my
   * Customer retrieves own order history
   */
  static async getMyOrders(req, res, next) {
    try {
      const customerId = req.user._id || req.user.id;
      const orders = await OrderService.getCustomerOrders(customerId);
      return ApiResponse.success(res, {
        message: 'Customer order history retrieved successfully',
        data: { orders },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/:id
   * Single order details (Customer / Vendor / Admin)
   */
  static async getOrderById(req, res, next) {
    try {
      const user = req.user || { role: 'customer', id: 'guest' };
      const order = await OrderService.getOrderById(req.params.id, user);
      return ApiResponse.success(res, {
        message: 'Order details retrieved successfully',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/vendor/items
   * Vendor retrieves order line items belonging to their store
   */
  static async getVendorItems(req, res, next) {
    try {
      const vendorUserId = req.user._id || req.user.id;
      const items = await OrderService.getVendorOrderItems(vendorUserId, req.query);
      return ApiResponse.success(res, {
        message: 'Vendor order items retrieved successfully',
        data: { items },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/orders/vendor/:orderId/items/:itemId/status
   * Vendor updates status of an owned line item
   */
  static async updateVendorItemStatus(req, res, next) {
    try {
      const vendorUserId = req.user._id || req.user.id;
      const { orderId, itemId } = req.params;
      const { status, trackingNumber } = req.body;

      const result = await OrderService.updateVendorItemStatus(
        vendorUserId,
        orderId,
        itemId,
        { status, trackingNumber }
      );

      return ApiResponse.success(res, {
        message: 'Order item fulfillment status updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
