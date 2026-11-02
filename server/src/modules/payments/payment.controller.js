import { PaymentService } from './payment.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class PaymentController {
  /**
   * POST /api/payments/create-order
   * Initialize a Razorpay test mode payment provider order
   */
  static async createOrder(req, res, next) {
    try {
      const customerId = req.user?._id || req.user?.id;
      const result = await PaymentService.createPaymentOrder(customerId, req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Payment provider order created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payments/verify
   * Verify HMAC-SHA256 signature and finalize commission ledger
   */
  static async verify(req, res, next) {
    try {
      const customerId = req.user?._id || req.user?.id;
      const result = await PaymentService.verifyPayment(customerId, req.body);
      return ApiResponse.success(res, {
        message: 'Payment verified and commission recorded successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payments/webhook
   * Process Razorpay webhooks idempotently
   */
  static async webhook(req, res, next) {
    try {
      const result = await PaymentService.handleWebhook(
        req.headers,
        req.body,
        req.rawBody || req.body
      );
      return ApiResponse.success(res, {
        message: 'Webhook processed idempotently',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payments/ledger
   * Retrieve platform commission ledger (Admin only)
   */
  static async getLedger(req, res, next) {
    try {
      const ledger = await PaymentService.getCommissionLedger(req.query);
      return ApiResponse.success(res, {
        message: 'Marketplace commission ledger retrieved successfully',
        data: ledger,
      });
    } catch (error) {
      next(error);
    }
  }
}
