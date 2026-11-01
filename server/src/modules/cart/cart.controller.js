import { CartService } from './cart.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

const getUserId = (req) => {
  return req.user?._id || req.user?.id || req.headers['x-guest-id'] || 'guest_default_session';
};

export class CartController {
  /**
   * GET /api/cart
   */
  static async getCart(req, res, next) {
    try {
      const userId = getUserId(req);
      const cart = await CartService.getCart(userId);
      return ApiResponse.success(res, {
        message: 'Cart retrieved successfully',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cart/items
   */
  static async addItem(req, res, next) {
    try {
      const userId = getUserId(req);
      const { productId, quantity } = req.body;
      const cart = await CartService.addItem(userId, { productId, quantity });
      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Item added to cart successfully',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/cart/items/:productId
   */
  static async updateQuantity(req, res, next) {
    try {
      const userId = getUserId(req);
      const { productId } = req.params;
      const { quantity } = req.body;
      const cart = await CartService.updateQuantity(userId, productId, quantity);
      return ApiResponse.success(res, {
        message: 'Cart item quantity updated',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/cart/items/:productId
   */
  static async removeItem(req, res, next) {
    try {
      const userId = getUserId(req);
      const { productId } = req.params;
      const cart = await CartService.removeItem(userId, productId);
      return ApiResponse.success(res, {
        message: 'Item removed from cart',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/cart
   */
  static async clearCart(req, res, next) {
    try {
      const userId = getUserId(req);
      const cart = await CartService.clearCart(userId);
      return ApiResponse.success(res, {
        message: 'Cart cleared successfully',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }
}
