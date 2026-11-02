import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { OrderController } from './order.controller.js';

const router = Router();

/**
 * @route   POST /api/orders
 * @desc    Validate cart, perform concurrency-safe atomic checkout, calculate 10% platform commission & split
 * @access  Private (Customer / Guest / Admin)
 */
router.post('/', optionalAuthenticate, OrderController.checkout);

/**
 * @route   GET /api/orders/my
 * @desc    Retrieve authenticated customer's order history
 * @access  Private (Customer / Admin)
 */
router.get('/my', authenticate, authorize('customer', 'admin'), OrderController.getMyOrders);

/**
 * @route   GET /api/orders/vendor/items
 * @desc    Retrieve order items belonging to authenticated vendor's store
 * @access  Private (Vendor / Admin)
 */
router.get('/vendor/items', authenticate, authorize('vendor', 'admin'), OrderController.getVendorItems);

/**
 * @route   PATCH /api/orders/vendor/:orderId/items/:itemId/status
 * @desc    Advance fulfillment status of an owned order item (placed -> packed -> shipped -> delivered)
 * @access  Private (Vendor Owner / Admin)
 */
router.patch(
  '/vendor/:orderId/items/:itemId/status',
  authenticate,
  authorize('vendor', 'admin'),
  OrderController.updateVendorItemStatus
);

/**
 * @route   GET /api/orders/:id/invoice
 * @desc    Generate and stream PDF tax invoice
 * @access  Private (Customer / Admin)
 */
router.get('/:id/invoice', optionalAuthenticate, OrderController.getInvoice);

/**
 * @route   GET /api/orders/:id
 * @desc    Retrieve single order details (Customer, Vendor, Admin)
 * @access  Private
 */
router.get('/:id', optionalAuthenticate, OrderController.getOrderById);

export default router;
