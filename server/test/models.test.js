import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { User, Store, Product, Order, Payment, Review, Coupon } from '../src/models/index.js';

describe('Mongoose Models Schema Verification', () => {
  it('User model should require name and email', () => {
    const user = new User();
    const err = user.validateSync();
    expect(err.errors.name).toBeDefined();
    expect(err.errors.email).toBeDefined();
  });

  it('Store model should require ownerId, name, and slug', () => {
    const store = new Store();
    const err = store.validateSync();
    expect(err.errors.ownerId).toBeDefined();
    expect(err.errors.name).toBeDefined();
    expect(err.errors.slug).toBeDefined();
    expect(store.approvalStatus).toBe('pending');
  });

  it('Product model should require price, stock, category and storeId', () => {
    const product = new Product({ price: -10, stock: 2.5 });
    const err = product.validateSync();
    expect(err.errors.title).toBeDefined();
    expect(err.errors.category).toBeDefined();
    expect(err.errors.price).toBeDefined(); // must be >= 0
    expect(err.errors.stock).toBeDefined(); // must be integer
  });

  it('Order model should validate items and calculate overall status', () => {
    const order = new Order({
      orderNumber: 'ORD-TEST-001',
      customerId: new mongoose.Types.ObjectId(),
      items: [
        {
          productId: new mongoose.Types.ObjectId(),
          storeId: new mongoose.Types.ObjectId(),
          vendorId: new mongoose.Types.ObjectId(),
          title: 'Mechanical Keyboard',
          price: 2000,
          quantity: 1,
          itemSubtotal: 2000,
          fulfillmentStatus: 'placed',
        },
      ],
      shippingAddress: {
        fullName: 'Raj Patel',
        addressLine1: '123 Tech Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
        phone: '9876543210',
      },
      totals: {
        subtotal: 2000,
        discount: 0,
        shipping: 0,
        tax: 0,
        grandTotal: 2000,
      },
    });

    const err = order.validateSync();
    expect(err).toBeUndefined();

    // Test overall status derivation
    order.items[0].fulfillmentStatus = 'delivered';
    order.recalculateOverallStatus();
    expect(order.overallStatus).toBe('completed');
  });

  it('Payment model should require provider, providerOrderId, and amount', () => {
    const payment = new Payment({
      orderId: new mongoose.Types.ObjectId(),
      customerId: new mongoose.Types.ObjectId(),
      providerOrderId: 'order_test_123',
      amount: 3000,
      platformCommissionPercentage: 10,
      totalCommissionAmount: 300,
    });
    const err = payment.validateSync();
    expect(err).toBeUndefined();
    expect(payment.currency).toBe('INR');
  });

  it('Review model should require rating between 1 and 5 and orderId link', () => {
    const invalidReview = new Review({ rating: 6 });
    const err = invalidReview.validateSync();
    expect(err.errors.rating).toBeDefined();
    expect(err.errors.customerId).toBeDefined();
    expect(err.errors.productId).toBeDefined();
    expect(err.errors.orderId).toBeDefined();
  });

  it('Coupon model isValidForCart should accurately check active, expiry, and minCartValue', () => {
    const coupon = new Coupon({
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      minCartValue: 500,
      expiry: new Date(Date.now() + 86400000), // tomorrow
      isActive: true,
    });

    // Subtotal below minCartValue
    expect(coupon.isValidForCart(400).valid).toBe(false);
    // Subtotal meeting minCartValue
    expect(coupon.isValidForCart(1000).valid).toBe(true);

    // Inactive coupon
    coupon.isActive = false;
    expect(coupon.isValidForCart(1000).valid).toBe(false);
  });
});
