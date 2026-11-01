import { Router } from 'express';
import { optionalAuthenticate } from '../../middleware/authenticate.js';
import { CartController } from './cart.controller.js';

const router = Router();

// Apply optional authentication so registered users have persistence across devices
router.use(optionalAuthenticate);

/**
 * @route   GET /api/cart
 * @desc    Retrieve active shopping cart hydrated with fresh prices & stock
 * @access  Public / Private
 */
router.get('/', CartController.getCart);

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart
 * @access  Public / Private
 */
router.post('/items', CartController.addItem);

/**
 * @route   PATCH /api/cart/items/:productId
 * @desc    Update quantity of product in cart
 * @access  Public / Private
 */
router.patch('/items/:productId', CartController.updateQuantity);

/**
 * @route   DELETE /api/cart/items/:productId
 * @desc    Remove an item from cart
 * @access  Public / Private
 */
router.delete('/items/:productId', CartController.removeItem);

/**
 * @route   DELETE /api/cart
 * @desc    Clear entire cart
 * @access  Public / Private
 */
router.delete('/', CartController.clearCart);

export default router;
