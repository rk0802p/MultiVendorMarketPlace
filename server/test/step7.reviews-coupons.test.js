import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { config } from '../src/config/environment.js';
import { Review } from '../src/models/Review.js';
import { Coupon } from '../src/models/Coupon.js';
import { Order } from '../src/models/Order.js';
import { Product } from '../src/models/Product.js';
import { User } from '../src/models/User.js';
import { AnalyticsService } from '../src/modules/analytics/analytics.service.js';

describe('Step 7: Reviews, Coupons, PDF Invoices & Admin Analytics Tests', () => {
  const customerId = '653a1b2c3d4e5f6a7b8c9d01';
  const customerToken = jwt.sign(
    { id: customerId, role: 'customer', email: 'buyer@example.com', status: 'active' },
    config.jwt.secret,
    { expiresIn: '1h' }
  );

  const vendorId = '653a1b2c3d4e5f6a7b8c9d02';
  const vendorToken = jwt.sign(
    { id: vendorId, role: 'vendor', email: 'vendor@example.com', status: 'active' },
    config.jwt.secret,
    { expiresIn: '1h' }
  );

  const adminId = '653a1b2c3d4e5f6a7b8c9d03';
  const adminToken = jwt.sign(
    { id: adminId, role: 'admin', email: 'admin@techmart.local', status: 'active' },
    config.jwt.secret,
    { expiresIn: '1h' }
  );

  const testProductId = '653a1b2c3d4e5f6a7b8c1111';
  const testOrderId = '653a1b2c3d4e5f6a7b8c2222';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Verified Buyer Reviews Module (POST & GET /api/reviews)', () => {
    it('should reject review submission if customer did NOT purchase the product (403 Forbidden)', async () => {
      vi.spyOn(Product, 'findById').mockResolvedValue({ _id: testProductId, title: 'Gaming Mouse' });
      vi.spyOn(Review, 'findOne').mockResolvedValue(null);
      // No qualifying order found
      vi.spyOn(Order, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .post(`/api/reviews/product/${testProductId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          rating: 5,
          comment: 'Best product ever!',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Verified Buyer Required/i);
    });

    it('should allow review submission when customer has a verified purchase (201 Created)', async () => {
      vi.spyOn(Product, 'findById').mockResolvedValue({ _id: testProductId, title: 'Gaming Mouse' });
      vi.spyOn(Review, 'findOne').mockResolvedValue(null);
      vi.spyOn(Order, 'findOne').mockResolvedValue({
        _id: testOrderId,
        customerId,
        paymentStatus: 'paid',
        items: [{ productId: testProductId, title: 'Gaming Mouse' }],
      });

      const mockSavedReview = {
        _id: '653a1b2c3d4e5f6a7b8c3333',
        customerId: { _id: customerId, name: 'Raj Patel' },
        productId: testProductId,
        orderId: testOrderId,
        rating: 5,
        comment: 'Super fast delivery and crisp switches!',
        status: 'published',
        createdAt: new Date(),
      };

      vi.spyOn(Review.prototype, 'save').mockResolvedValue(mockSavedReview);
      vi.spyOn(Review, 'aggregate').mockResolvedValue([
        { _id: new mongoose.Types.ObjectId(testProductId), avgRating: 5, count: 1 },
      ]);
      vi.spyOn(Product, 'findByIdAndUpdate').mockResolvedValue({
        _id: testProductId,
        averageRating: 5,
        reviewCount: 1,
      });
      vi.spyOn(Review, 'findById').mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(mockSavedReview),
        }),
      });

      const res = await request(app)
        .post(`/api/reviews/product/${testProductId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          rating: 5,
          comment: 'Super fast delivery and crisp switches!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.review.rating).toBe(5);
    });

    it('should reject duplicate review by the same customer for the same product (409 Conflict)', async () => {
      vi.spyOn(Product, 'findById').mockResolvedValue({ _id: testProductId, title: 'Gaming Mouse' });
      vi.spyOn(Review, 'findOne').mockResolvedValue({
        _id: 'existing_rev_id',
        customerId,
        productId: testProductId,
      });

      const res = await request(app)
        .post(`/api/reviews/product/${testProductId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          rating: 4,
          comment: 'Trying to review again',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already submitted a review/i);
    });

    it('GET /api/reviews/product/:productId should return published reviews and rating breakdown', async () => {
      const mockReviews = [
        {
          _id: 'rev_1',
          rating: 5,
          comment: 'Exceptional quality',
          customerId: { name: 'Customer One' },
          createdAt: new Date(),
        },
      ];

      vi.spyOn(Review, 'find').mockReturnValue({
        sort: vi.fn().mockReturnValue({
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              populate: vi.fn().mockReturnValue({
                lean: vi.fn().mockResolvedValue(mockReviews),
              }),
            }),
          }),
        }),
      });
      vi.spyOn(Review, 'countDocuments').mockResolvedValue(1);
      vi.spyOn(Review, 'aggregate').mockResolvedValue([{ _id: 5, count: 1 }]);

      const res = await request(app).get(`/api/reviews/product/${testProductId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reviews).toHaveLength(1);
      expect(res.body.data.stats.totalReviews).toBe(1);
      expect(res.body.data.stats.averageRating).toBe(5);
      expect(res.body.data.stats.breakdown['5']).toBe(1);
    });

    it('GET /api/reviews/product/:productId/eligibility should check customer purchase status', async () => {
      vi.spyOn(Review, 'findOne').mockResolvedValue(null);
      vi.spyOn(Order, 'findOne').mockResolvedValue({
        _id: testOrderId,
        paymentStatus: 'paid',
      });

      const res = await request(app)
        .get(`/api/reviews/product/${testProductId}/eligibility`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.canReview).toBe(true);
      expect(res.body.data.hasReviewed).toBe(false);
    });
  });

  describe('Promotional Coupons Module (POST /api/coupons/validate & CRUD)', () => {
    it('should validate percentage discount coupon and calculate discount correctly', async () => {
      const mockCoupon = new Coupon({
        code: 'SAVE10',
        type: 'percentage',
        value: 10,
        minCartValue: 1000,
        maxDiscount: 500,
        expiry: new Date(Date.now() + 864000000), // future date
        isActive: true,
      });

      vi.spyOn(Coupon, 'findOne').mockResolvedValue(mockCoupon);

      const res = await request(app)
        .post('/api/coupons/validate')
        .send({
          code: 'SAVE10',
          cartSubtotal: 3000,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('SAVE10');
      expect(res.body.data.discountCalculated).toBe(300); // 10% of 3000
      expect(res.body.data.newGrandTotal).toBe(2700);
    });

    it('should reject coupon if cart subtotal is below minimum spend threshold', async () => {
      const mockCoupon = new Coupon({
        code: 'BIGSAVER',
        type: 'fixed',
        value: 500,
        minCartValue: 5000,
        expiry: new Date(Date.now() + 864000000),
        isActive: true,
      });

      vi.spyOn(Coupon, 'findOne').mockResolvedValue(mockCoupon);

      const res = await request(app)
        .post('/api/coupons/validate')
        .send({
          code: 'BIGSAVER',
          cartSubtotal: 2000, // less than 5000
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Minimum cart value/i);
    });

    it('should allow admin to create a new promo coupon (201 Created)', async () => {
      vi.spyOn(Coupon, 'findOne').mockResolvedValue(null);
      vi.spyOn(Coupon.prototype, 'save').mockImplementation(async function () {
        this._id = '653a1b2c3d4e5f6a7b8c4444';
        return this;
      });

      const futureDate = new Date(Date.now() + 864000000).toISOString();

      const res = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'WINTER25',
          type: 'percentage',
          value: 25,
          minCartValue: 2000,
          expiry: futureDate,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.coupon.code).toBe('WINTER25');
    });

    it('should reject non-admin from creating promotional coupons (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          code: 'HACKER100',
          type: 'percentage',
          value: 100,
          expiry: new Date(Date.now() + 864000000).toISOString(),
        });

      expect(res.status).toBe(403);
    });
  });

  describe('PDF Tax Invoice Generation (GET /api/orders/:id/invoice)', () => {
    it('should generate and stream PDF invoice for an authorized customer order', async () => {
      const mockOrder = {
        _id: '653a1b2c3d4e5f6a7b8c5555',
        orderNumber: 'ORD-99887766-1234',
        createdAt: new Date(),
        customerId: { _id: customerId, name: 'Raj Patel', email: 'raj@example.com' },
        shippingAddress: {
          fullName: 'Raj Patel',
          addressLine1: '42 MG Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
          phone: '9876543210',
        },
        items: [
          {
            title: 'Mechanical Keyboard',
            storeId: { name: 'Alpha Tech Store' },
            quantity: 1,
            price: 2500,
            itemSubtotal: 2500,
          },
        ],
        totals: {
          subtotal: 2500,
          discount: 250,
          shipping: 0,
          tax: 0,
          grandTotal: 2250,
        },
        appliedCoupon: {
          code: 'SAVE10',
          discountAmount: 250,
        },
        paymentStatus: 'paid',
      };

      vi.spyOn(Order, 'findOne').mockReturnValue({
        populate: vi.fn().mockReturnValue({
          populate: vi.fn().mockResolvedValue(mockOrder),
        }),
      });

      const res = await request(app)
        .get(`/api/orders/${mockOrder._id}/invoice`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toMatch(/invoice-ORD-99887766-1234\.pdf/);
      expect(res.body).toBeInstanceOf(Buffer);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('Marketplace Admin Analytics & Oversight (GET /api/admin/*)', () => {
    it('should return aggregated platform KPIs, top products, and recent orders', async () => {
      vi.spyOn(AnalyticsService, 'getMarketplaceAnalytics').mockResolvedValue({
        metrics: {
          grossSales: 450000,
          platformCommissionRevenue: 45000,
          vendorPayouts: 405000,
          totalOrders: 180,
          activeVendors: 22,
          pendingVendorApplications: 2,
          totalProducts: 65,
          totalCustomers: 310,
          totalDiscountGiven: 15000,
        },
        topSellingProducts: [
          { productId: testProductId, title: 'Mechanical Keyboard', unitsSold: 45, revenue: 112500 },
        ],
        recentOrders: [],
      });

      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics.grossSales).toBe(450000);
      expect(res.body.data.metrics.platformCommissionRevenue).toBe(45000);
      expect(res.body.data.metrics.vendorPayouts).toBe(405000);
      expect(res.body.data.topSellingProducts).toHaveLength(1);
    });

    it('GET /api/admin/orders should return platform orders for admin oversight', async () => {
      vi.spyOn(AnalyticsService, 'getAdminOrders').mockResolvedValue({
        orders: [
          {
            _id: testOrderId,
            orderNumber: 'ORD-12345678-0001',
            customerId: { name: 'Customer Test', email: 'test@example.com' },
            totals: { grandTotal: 2500 },
          },
        ],
        pagination: { page: 1, limit: 15, totalOrders: 1, totalPages: 1 },
      });

      const res = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orders).toHaveLength(1);
    });

    it('GET /api/admin/users should return platform user directory for admin oversight', async () => {
      vi.spyOn(AnalyticsService, 'getAdminUsers').mockResolvedValue({
        users: [
          {
            _id: customerId,
            name: 'Customer Test',
            email: 'test@example.com',
            role: 'customer',
          },
        ],
        pagination: { page: 1, limit: 20, totalUsers: 1, totalPages: 1 },
      });

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users).toHaveLength(1);
    });
  });
});
