import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { Product } from '../src/models/Product.js';
import { Order } from '../src/models/Order.js';
import { Payment } from '../src/models/Payment.js';
import { CartService } from '../src/modules/cart/cart.service.js';
import { OrderService } from '../src/modules/orders/order.service.js';
import { ProductSearchService } from '../src/modules/products/product.search.service.js';
import { config } from '../src/config/environment.js';

describe('Step 5: Redis Cart, Atomic Checkout & Multi-Vendor Order Lifecycle Tests', () => {
  const customerId = '653a1b2c3d4e5f6a7b8c9d33';
  const vendor1Id = '653a1b2c3d4e5f6a7b8c9d11';
  const vendor2Id = '653a1b2c3d4e5f6a7b8c9d22';
  const adminId = '653a1b2c3d4e5f6a7b8c9d99';

  const customerToken = jwt.sign({ id: customerId, role: 'customer', status: 'active' }, config.jwt.secret);
  const vendor1Token = jwt.sign({ id: vendor1Id, role: 'vendor', status: 'active' }, config.jwt.secret);
  const vendor2Token = jwt.sign({ id: vendor2Id, role: 'vendor', status: 'active' }, config.jwt.secret);
  const adminToken = jwt.sign({ id: adminId, role: 'admin', status: 'active' }, config.jwt.secret);

  const mockProduct1 = {
    _id: '653a1b2c3d4e5f6a7b8c0001',
    title: 'Mechanical Gaming Keyboard',
    slug: 'mechanical-gaming-keyboard',
    price: 2000,
    stock: 10,
    status: 'active',
    category: 'Keyboards',
    storeId: { _id: 'store_001', name: 'Apex Peripherals', slug: 'apex-peripherals' },
    vendorId: vendor1Id,
    images: ['https://s3.example.com/keyboard.jpg'],
  };

  const mockProduct2 = {
    _id: '653a1b2c3d4e5f6a7b8c0002',
    title: 'Ergonomic Mouse Pad',
    slug: 'ergonomic-mouse-pad',
    price: 1000,
    stock: 20,
    status: 'active',
    category: 'Accessories',
    storeId: { _id: 'store_002', name: 'DeskCraft Studio', slug: 'deskcraft-studio' },
    vendorId: vendor2Id,
    images: ['https://s3.example.com/mousepad.jpg'],
  };

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.spyOn(ProductSearchService, 'indexProduct').mockResolvedValue(true);
    await CartService.clearCart(customerId);
    await CartService.clearCart('guest_default_session');
  });

  describe('Shopping Cart Operations (Redis & In-Memory Fallback)', () => {
    it('should add an active product to cart and calculate correct hydrated totals', async () => {
      vi.spyOn(Product, 'findById').mockResolvedValue(mockProduct1);
      vi.spyOn(Product, 'find').mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([mockProduct1]),
      });

      const cart = await CartService.addItem(customerId, {
        productId: mockProduct1._id,
        quantity: 2,
      });

      expect(cart.items.length).toBe(1);
      expect(cart.items[0].title).toBe('Mechanical Gaming Keyboard');
      expect(cart.items[0].quantity).toBe(2);
      expect(cart.items[0].price).toBe(2000);
      expect(cart.items[0].itemSubtotal).toBe(4000);
      expect(cart.subtotal).toBe(4000);
      expect(cart.itemCount).toBe(2);
      expect(cart.hasUnavailableItems).toBe(false);
    });

    it('should reject adding quantity that exceeds product stock', async () => {
      vi.spyOn(Product, 'findById').mockResolvedValue(mockProduct1); // stock is 10

      await expect(
        CartService.addItem(customerId, {
          productId: mockProduct1._id,
          quantity: 15,
        })
      ).rejects.toThrow(/exceeds available stock/);
    });

    it('should update item quantity and remove item when quantity is 0', async () => {
      vi.spyOn(Product, 'findById').mockResolvedValue(mockProduct1);
      vi.spyOn(Product, 'find').mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([mockProduct1]),
      });

      // Add item first
      await CartService.addItem(customerId, { productId: mockProduct1._id, quantity: 1 });

      // Update to 3
      const updatedCart = await CartService.updateQuantity(customerId, mockProduct1._id, 3);
      expect(updatedCart.items[0].quantity).toBe(3);
      expect(updatedCart.subtotal).toBe(6000);

      // Update to 0 (should remove)
      const emptyCart = await CartService.updateQuantity(customerId, mockProduct1._id, 0);
      expect(emptyCart.items.length).toBe(0);
      expect(emptyCart.subtotal).toBe(0);
    });

    it('should flag unavailable or out-of-stock items during cart retrieval', async () => {
      const outOfStockProduct = { ...mockProduct1, stock: 0 };
      vi.spyOn(Product, 'findById').mockResolvedValue(mockProduct1);
      vi.spyOn(Product, 'find').mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([outOfStockProduct]),
      });

      await CartService.addItem(customerId, { productId: mockProduct1._id, quantity: 2 });
      const cart = await CartService.getCart(customerId);

      expect(cart.hasUnavailableItems).toBe(true);
      expect(cart.items[0].isAvailable).toBe(false);
      expect(cart.items[0].unavailableReason).toContain('Out of stock');
    });

    it('Cart API endpoints (GET, POST, PATCH, DELETE) should operate smoothly', async () => {
      vi.spyOn(Product, 'findById').mockResolvedValue(mockProduct2);
      vi.spyOn(Product, 'find').mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([mockProduct2]),
      });

      // 1. POST /api/cart/items
      const postRes = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: mockProduct2._id, quantity: 2 });
      expect(postRes.status).toBe(201);
      expect(postRes.body.data.itemCount).toBe(2);

      // 2. GET /api/cart
      const getRes = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.subtotal).toBe(2000);

      // 3. DELETE /api/cart/items/:id
      const delItemRes = await request(app)
        .delete(`/api/cart/items/${mockProduct2._id}`)
        .set('Authorization', `Bearer ${customerToken}`);
      expect(delItemRes.status).toBe(200);
      expect(delItemRes.body.data.items.length).toBe(0);
    });
  });

  describe('Atomic Checkout & Concurrency-Safe Stock Decrement', () => {
    it('should atomically decrement stock and create multi-vendor order with 10% platform commission', async () => {
      // Setup products from 2 vendors: Vendor A (₹2,000), Vendor B (₹1,000)
      const p1 = { ...mockProduct1, stock: 10 };
      const p2 = { ...mockProduct2, stock: 20 };

      // Mock atomic findOneAndUpdate for stock decrement
      vi.spyOn(Product, 'findOneAndUpdate')
        .mockReturnValueOnce({
          populate: vi.fn().mockResolvedValue({ ...p1, stock: 9 }),
        })
        .mockReturnValueOnce({
          populate: vi.fn().mockResolvedValue({ ...p2, stock: 19 }),
        });

      vi.spyOn(Order.prototype, 'save').mockImplementation(async function () {
        this._id = 'order_multi_vendor_01';
        return this;
      });

      vi.spyOn(Payment.prototype, 'save').mockImplementation(async function () {
        this._id = 'payment_multi_vendor_01';
        return this;
      });

      const checkoutPayload = {
        items: [
          { productId: p1._id, quantity: 1 },
          { productId: p2._id, quantity: 1 },
        ],
        shippingAddress: {
          fullName: 'Rajiv Sharma',
          addressLine1: '45 Indiranagar 100ft Rd',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
          phone: '9876543210',
        },
      };

      const result = await OrderService.checkoutOrder(customerId, checkoutPayload);

      // Assert Order totals and line items
      expect(result.order.orderNumber).toMatch(/^ORD-/);
      expect(result.order.totals.subtotal).toBe(3000);
      expect(result.order.totals.grandTotal).toBe(3000);
      expect(result.order.items.length).toBe(2);

      // Assert Marketplace 10% Commission Calculation
      // Subtotal = ₹3,000 -> Platform Commission = ₹300
      expect(result.payment.platformCommissionPercentage).toBe(10);
      expect(result.payment.totalCommissionAmount).toBe(300);

      // Vendor A (₹2,000 gross -> ₹200 commission -> ₹1,800 net payout)
      const transferA = result.payment.transfers.find((t) => t.vendorId.toString() === vendor1Id);
      expect(transferA).toBeDefined();
      expect(transferA.grossAmount).toBe(2000);
      expect(transferA.commissionAmount).toBe(200);
      expect(transferA.netPayout).toBe(1800);

      // Vendor B (₹1,000 gross -> ₹100 commission -> ₹900 net payout)
      const transferB = result.payment.transfers.find((t) => t.vendorId.toString() === vendor2Id);
      expect(transferB).toBeDefined();
      expect(transferB.grossAmount).toBe(1000);
      expect(transferB.commissionAmount).toBe(100);
      expect(transferB.netPayout).toBe(900);
    });

    it('should reject checkout and rollback already decremented items if any item has insufficient stock (409 Conflict)', async () => {
      const p1 = { ...mockProduct1, stock: 10 };
      const p2 = { ...mockProduct2, stock: 2 };

      // Product 1 decrements successfully
      vi.spyOn(Product, 'findOneAndUpdate')
        .mockReturnValueOnce({
          populate: vi.fn().mockResolvedValue({ ...p1, stock: 9 }),
        })
        // Product 2 fails atomic condition (stock < quantity)
        .mockReturnValueOnce(null);

      vi.spyOn(Product, 'findById').mockResolvedValue(p2);
      const rollbackSpy = vi.spyOn(Product, 'findByIdAndUpdate').mockResolvedValue(true);

      const checkoutPayload = {
        items: [
          { productId: p1._id, quantity: 1 },
          { productId: p2._id, quantity: 5 }, // requested 5, only 2 available
        ],
      };

      await expect(OrderService.checkoutOrder(customerId, checkoutPayload)).rejects.toThrow(
        /Insufficient stock/
      );

      // Verify Rollback: product 1 stock was restored
      expect(rollbackSpy).toHaveBeenCalledWith(p1._id, { $inc: { stock: 1 } });
    });
  });

  describe('Multi-Vendor Order Isolation & Fulfillment Lifecycle', () => {
    const mockOrderInstance = {
      _id: 'order_multi_01',
      orderNumber: 'ORD-20261026-1001',
      customerId: { _id: customerId, name: 'Rajiv Sharma', email: 'rajiv@example.com' },
      items: [
        {
          _id: 'item_01',
          productId: mockProduct1._id,
          storeId: 'store_001',
          vendorId: vendor1Id,
          title: 'Mechanical Gaming Keyboard',
          price: 2000,
          quantity: 1,
          itemSubtotal: 2000,
          fulfillmentStatus: 'placed',
          trackingNumber: '',
        },
        {
          _id: 'item_02',
          productId: mockProduct2._id,
          storeId: 'store_002',
          vendorId: vendor2Id,
          title: 'Ergonomic Mouse Pad',
          price: 1000,
          quantity: 1,
          itemSubtotal: 1000,
          fulfillmentStatus: 'placed',
          trackingNumber: '',
        },
      ],
      paymentStatus: 'paid',
      overallStatus: 'placed',
      shippingAddress: {
        fullName: 'Rajiv Sharma',
        addressLine1: 'Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
        phone: '9876543210',
      },
      recalculateOverallStatus() {
        const statuses = this.items.map((i) => i.fulfillmentStatus);
        if (statuses.every((s) => s === 'delivered')) {
          this.overallStatus = 'completed';
        } else if (statuses.some((s) => ['packed', 'shipped', 'delivered'].includes(s))) {
          this.overallStatus = 'in_progress';
        } else {
          this.overallStatus = 'placed';
        }
      },
      save: vi.fn().mockResolvedValue(true),
    };

    it('Vendor A should retrieve ONLY items belonging to their store', async () => {
      vi.spyOn(Order, 'find').mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([mockOrderInstance]),
      });

      const res = await request(app)
        .get('/api/orders/vendor/items')
        .set('Authorization', `Bearer ${vendor1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].item.title).toBe('Mechanical Gaming Keyboard');
      expect(res.body.data.items[0].item._id).toBe('item_01');
    });

    it('Vendor A should successfully advance fulfillment status of their own item (placed -> packed -> shipped)', async () => {
      const orderCopy = {
        ...mockOrderInstance,
        items: [
          { ...mockOrderInstance.items[0] },
          { ...mockOrderInstance.items[1] },
        ],
        save: vi.fn().mockResolvedValue(true),
      };
      orderCopy.items.id = (id) => orderCopy.items.find((i) => i._id === id);

      vi.spyOn(Order, 'findById').mockResolvedValue(orderCopy);

      const res = await request(app)
        .patch('/api/orders/vendor/order_multi_01/items/item_01/status')
        .set('Authorization', `Bearer ${vendor1Token}`)
        .send({ status: 'shipped', trackingNumber: 'BLUEDART-8823910' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fulfillmentStatus).toBe('shipped');
      expect(res.body.data.trackingNumber).toBe('BLUEDART-8823910');
      expect(res.body.data.overallStatus).toBe('in_progress');
    });

    it('Vendor A should be FORBIDDEN (403) from updating Vendor B order item status', async () => {
      const orderCopy = {
        ...mockOrderInstance,
        items: [
          { ...mockOrderInstance.items[0] },
          { ...mockOrderInstance.items[1] },
        ],
        save: vi.fn(),
      };
      orderCopy.items.id = (id) => orderCopy.items.find((i) => i._id === id);

      vi.spyOn(Order, 'findById').mockResolvedValue(orderCopy);

      // Vendor 1 attempts to update Vendor 2's item ('item_02')
      const res = await request(app)
        .patch('/api/orders/vendor/order_multi_01/items/item_02/status')
        .set('Authorization', `Bearer ${vendor1Token}`)
        .send({ status: 'packed' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('items belonging to your store');
      expect(orderCopy.save).not.toHaveBeenCalled();
    });

    it('Customer should retrieve order history via GET /api/orders/my', async () => {
      vi.spyOn(Order, 'find').mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([mockOrderInstance]),
      });

      const res = await request(app)
        .get('/api/orders/my')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orders.length).toBe(1);
      expect(res.body.data.orders[0].orderNumber).toBe('ORD-20261026-1001');
    });
  });
});
