import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { Payment } from '../src/models/Payment.js';
import { Order } from '../src/models/Order.js';
import { config } from '../src/config/environment.js';

describe('Step 6: Payment Gateway, Signature Verification & Commission Ledger Tests', () => {
  const customerId = '653a1b2c3d4e5f6a7b8c9d33';
  const vendor1Id = '653a1b2c3d4e5f6a7b8c9d11';
  const vendor2Id = '653a1b2c3d4e5f6a7b8c9d22';
  const adminId = '653a1b2c3d4e5f6a7b8c9d99';

  const customerToken = jwt.sign({ id: customerId, role: 'customer', status: 'active' }, config.jwt.secret);
  const adminToken = jwt.sign({ id: adminId, role: 'admin', status: 'active' }, config.jwt.secret);

  const mockOrder = {
    _id: '653a1b2c3d4e5f6a7b8c8801',
    orderNumber: 'ORD-20261026-8801',
    customerId,
    totals: {
      subtotal: 3000,
      grandTotal: 3000,
    },
    paymentStatus: 'pending',
    save: vi.fn().mockResolvedValue(true),
  };

  const mockPayment = {
    _id: 'payment_mock_01',
    orderId: mockOrder._id,
    customerId,
    provider: 'razorpay',
    providerOrderId: 'order_rzp_mock_12345',
    amount: 3000,
    currency: 'INR',
    platformCommissionPercentage: 10,
    totalCommissionAmount: 300,
    transfers: [
      {
        vendorId: vendor1Id,
        grossAmount: 2000,
        commissionRate: 10,
        commissionAmount: 200,
        netPayout: 1800,
        transferStatus: 'pending',
      },
      {
        vendorId: vendor2Id,
        grossAmount: 1000,
        commissionRate: 10,
        commissionAmount: 100,
        netPayout: 900,
        transferStatus: 'pending',
      },
    ],
    status: 'created',
    processedWebhookEvents: [],
    save: vi.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Razorpay Order Creation & Currency Conversion', () => {
    it('should create Razorpay order with amount converted to paise (₹3,000 -> 300,000 paise)', async () => {
      vi.spyOn(Order, 'findOne').mockResolvedValue(mockOrder);
      vi.spyOn(Payment, 'findOne').mockResolvedValue(mockPayment);

      const res = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ orderId: mockOrder._id });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(300000); // 3000 * 100
      expect(res.body.data.currency).toBe('INR');
      expect(res.body.data.providerOrderId).toMatch(/^order_rzp_/);
    });

    it('should return 404 if order does not exist during order initialization', async () => {
      vi.spyOn(Order, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ orderId: '653a1b2c3d4e5f6a7b8c9999' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Order not found');
    });
  });

  describe('Cryptographic Signature Verification & 10% Commission Ledger', () => {
    it('should verify valid HMAC-SHA256 signature, mark order paid, and complete vendor transfers', async () => {
      const orderId = 'order_rzp_mock_12345';
      const paymentId = 'pay_rzp_mock_67890';
      const secret = config.razorpay.keySecret || 'dev_razorpay_secret_test_key';

      // Compute valid HMAC-SHA256 signature
      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      vi.spyOn(Payment, 'findOne').mockResolvedValue(mockPayment);
      vi.spyOn(Order, 'findById').mockResolvedValue(mockOrder);

      const res = await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId: mockOrder._id,
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: validSignature,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentStatus).toBe('paid');
      expect(res.body.data.providerPaymentId).toBe(paymentId);

      // Verify 10% commission calculation snapshot
      expect(res.body.data.commission.platformRate).toBe(10);
      expect(res.body.data.commission.platformCommission).toBe(300);

      // Verify vendor payouts
      const vendorShares = res.body.data.commission.vendorGrossShares;
      expect(vendorShares.length).toBe(2);
      expect(vendorShares[0].amount).toBe(2000);
      expect(vendorShares[0].netPayout).toBe(1800);
      expect(vendorShares[1].amount).toBe(1000);
      expect(vendorShares[1].netPayout).toBe(900);

      expect(mockOrder.paymentStatus).toBe('paid');
      expect(mockPayment.status).toBe('captured');
      expect(mockPayment.transfers[0].transferStatus).toBe('completed');
    });

    it('should reject tampered or invalid signature with 400 Bad Request', async () => {
      const orderId = 'order_rzp_mock_12345';
      const paymentId = 'pay_rzp_mock_67890';
      const tamperedSignature = 'invalid_tampered_signature_hex_123456';

      const res = await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId: mockOrder._id,
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: tamperedSignature,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('signature verification failed');
    });
  });

  describe('Idempotent Webhook Processing', () => {
    it('should process payment.captured webhook and transition payment & order to paid', async () => {
      vi.spyOn(Payment, 'findOne')
        .mockResolvedValueOnce(null) // Not yet in processedWebhookEvents
        .mockResolvedValueOnce(mockPayment); // Found payment by providerOrderId

      vi.spyOn(Order, 'findByIdAndUpdate').mockResolvedValue(true);

      const webhookPayload = {
        event: 'payment.captured',
        event_id: 'evt_test_1001',
        payload: {
          payment: {
            entity: {
              id: 'pay_rzp_live_9988',
              order_id: 'order_rzp_mock_12345',
              amount: 300000,
              status: 'captured',
            },
          },
        },
      };

      const res = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', 'test_valid_webhook_signature')
        .send(webhookPayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.received).toBe(true);
      expect(res.body.data.alreadyProcessed).toBe(false);
      expect(mockPayment.status).toBe('captured');
      expect(mockPayment.processedWebhookEvents.length).toBe(1);
      expect(mockPayment.processedWebhookEvents[0].eventId).toBe('evt_test_1001');
    });

    it('should handle duplicate webhook delivery idempotently without re-processing', async () => {
      // Mock existing processed webhook event
      vi.spyOn(Payment, 'findOne').mockResolvedValueOnce({
        _id: 'payment_already_done',
        processedWebhookEvents: [{ eventId: 'evt_test_duplicate_99' }],
      });

      const duplicatePayload = {
        event: 'payment.captured',
        event_id: 'evt_test_duplicate_99',
        payload: {
          payment: {
            entity: {
              id: 'pay_rzp_live_9988',
              order_id: 'order_rzp_mock_12345',
            },
          },
        },
      };

      const res = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', 'test_valid_webhook_signature')
        .send(duplicatePayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.received).toBe(true);
      expect(res.body.data.alreadyProcessed).toBe(true);
      expect(res.body.data.message).toContain('already been processed');
    });

    it('should handle payment.failed webhook event and update status to failed', async () => {
      vi.spyOn(Payment, 'findOne')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockPayment);

      vi.spyOn(Order, 'findByIdAndUpdate').mockResolvedValue(true);

      const failedPayload = {
        event: 'payment.failed',
        event_id: 'evt_test_fail_01',
        payload: {
          payment: {
            entity: {
              id: 'pay_fail_01',
              order_id: 'order_rzp_mock_12345',
            },
          },
        },
      };

      const res = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', 'test_valid_webhook_signature')
        .send(failedPayload);

      expect(res.status).toBe(200);
      expect(res.body.data.received).toBe(true);
      expect(mockPayment.status).toBe('failed');
    });
  });

  describe('Admin Commission Ledger Oversight', () => {
    it('Admin should retrieve commission ledger with platform commission totals', async () => {
      const mockCapturedPayments = [
        {
          _id: 'pay_1',
          amount: 3000,
          totalCommissionAmount: 300,
          transfers: [
            { grossAmount: 2000, netPayout: 1800 },
            { grossAmount: 1000, netPayout: 900 },
          ],
        },
      ];

      vi.spyOn(Payment, 'find').mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockCapturedPayments),
      });

      const res = await request(app)
        .get('/api/payments/ledger')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics.totalGtv).toBe(3000);
      expect(res.body.data.metrics.totalCommissionEarned).toBe(300);
      expect(res.body.data.metrics.totalVendorPayouts).toBe(2700);
      expect(res.body.data.metrics.platformCommissionRate).toBe(10);
    });

    it('Customer should be FORBIDDEN (403) from accessing admin commission ledger', async () => {
      const res = await request(app)
        .get('/api/payments/ledger')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
