import { Router } from 'express';
import { ApiResponse } from '../../utils/apiResponse.js';

const router = Router();

/**
 * @route   GET /api/cart
 * @desc    Retrieve customer's active shopping cart (from Redis with fresh Mongo prices)
 * @access  Private (Customer)
 */
router.get('/', (req, res) => {
  return ApiResponse.success(res, {
    message: 'Cart retrieved successfully (Contract Defined)',
    data: {
      items: [],
      subtotal: 0,
      itemCount: 0,
    },
  });
});

/**
 * @route   POST /api/cart/items
 * @desc    Add item to customer's cart
 * @access  Private (Customer)
 */
router.post('/items', (req, res) => {
  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'Item added to cart (Contract Defined)',
    data: {
      productId: req.body.productId,
      quantity: req.body.quantity || 1,
    },
  });
});

/**
 * @route   PATCH /api/cart/items/:productId
 * @desc    Update quantity of product in cart
 * @access  Private (Customer)
 */
router.patch('/items/:productId', (req, res) => {
  return ApiResponse.success(res, {
    message: 'Cart item quantity updated (Contract Defined)',
    data: {
      productId: req.params.productId,
      quantity: req.body.quantity,
    },
  });
});

/**
 * @route   DELETE /api/cart/items/:productId
 * @desc    Remove an item from cart
 * @access  Private (Customer)
 */
router.delete('/items/:productId', (req, res) => {
  return ApiResponse.success(res, {
    message: 'Item removed from cart (Contract Defined)',
    data: {
      removedProductId: req.params.productId,
    },
  });
});

/**
 * @route   DELETE /api/cart
 * @desc    Clear entire cart
 * @access  Private (Customer)
 */
router.delete('/', (req, res) => {
  return ApiResponse.success(res, {
    message: 'Cart cleared successfully (Contract Defined)',
  });
});

export default router;
