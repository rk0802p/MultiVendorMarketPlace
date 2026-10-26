import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { authenticate } from '../src/middleware/authenticate.js';
import {
  requireRole,
  requireSelfOrAdmin,
  verifyOrderItemOwnership,
} from '../src/middleware/authorize.js';
import { config } from '../src/config/environment.js';

// Mock Express response helper
const createMockRes = () => {
  const res = {};
  res.statusCode = 200;
  res.body = null;
  res.status = function (code) {
    this.statusCode = code;
    return this;
  };
  res.json = function (payload) {
    this.body = payload;
    return this;
  };
  return res;
};

describe('Step 1.3: Authorization & RBAC Middleware Verification', () => {
  describe('Authentication Middleware (authenticate)', () => {
    it('should reject requests without token with 401', async () => {
      const req = { headers: {}, cookies: {} };
      const res = createMockRes();
      let nextCalled = false;

      await authenticate(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No token provided');
    });

    it('should authenticate valid JWT and populate req.user', async () => {
      const userPayload = { id: 'user_123', email: 'test@example.com', role: 'customer', status: 'active' };
      const token = jwt.sign(userPayload, config.jwt.secret);

      const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} };
      const res = createMockRes();
      let nextCalled = false;

      await authenticate(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
      expect(req.user.id).toBe('user_123');
      expect(req.user.role).toBe('customer');
    });

    it('should reject suspended user with 403', async () => {
      const suspendedPayload = { id: 'user_999', role: 'customer', status: 'suspended' };
      const token = jwt.sign(suspendedPayload, config.jwt.secret);

      const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} };
      const res = createMockRes();
      let nextCalled = false;

      await authenticate(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('suspended');
    });
  });

  describe('Role-Based Authorization (requireRole)', () => {
    it('should allow user if role matches requirement', () => {
      const req = { user: { id: 'admin_1', role: 'admin' } };
      const res = createMockRes();
      let nextCalled = false;

      const middleware = requireRole('admin');
      middleware(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
    });

    it('should block customer from accessing admin role with 403', () => {
      const req = { user: { id: 'customer_1', role: 'customer' } };
      const res = createMockRes();
      let nextCalled = false;

      const middleware = requireRole('admin');
      middleware(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Forbidden');
    });

    it('should block vendor from accessing customer-only role with 403', () => {
      const req = { user: { id: 'vendor_1', role: 'vendor' } };
      const res = createMockRes();
      let nextCalled = false;

      const middleware = requireRole('customer');
      middleware(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      expect(res.statusCode).toBe(403);
    });
  });

  describe('Resource Ownership (requireSelfOrAdmin)', () => {
    it('should allow user to access their own resource', () => {
      const req = { user: { id: 'user_123', role: 'customer' }, params: { id: 'user_123' }, body: {} };
      const res = createMockRes();
      let nextCalled = false;

      const middleware = requireSelfOrAdmin('id');
      middleware(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
    });

    it('should forbid user from accessing another user’s resource', () => {
      const req = { user: { id: 'user_123', role: 'customer' }, params: { id: 'user_999' }, body: {} };
      const res = createMockRes();
      let nextCalled = false;

      const middleware = requireSelfOrAdmin('id');
      middleware(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      expect(res.statusCode).toBe(403);
    });

    it('should allow admin override access to any user’s resource', () => {
      const req = { user: { id: 'admin_1', role: 'admin' }, params: { id: 'user_999' }, body: {} };
      const res = createMockRes();
      let nextCalled = false;

      const middleware = requireSelfOrAdmin('id');
      middleware(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
    });
  });

  describe('Multi-Vendor Order Item Isolation (verifyOrderItemOwnership)', () => {
    const mockOrder = {
      _id: 'order_1',
      items: [
        { _id: 'item_A', vendorId: 'vendor_alpha', title: 'Keyboard', price: 2000 },
        { _id: 'item_B', vendorId: 'vendor_beta', title: 'Mouse Pad', price: 1000 },
      ],
    };

    it('should allow Vendor Alpha to update their own item', () => {
      const vendorUser = { id: 'vendor_alpha', role: 'vendor' };
      const check = verifyOrderItemOwnership(mockOrder, 'item_A', vendorUser);
      expect(check.allowed).toBe(true);
      expect(check.item.title).toBe('Keyboard');
    });

    it('should strictly block Vendor Alpha from updating Vendor Beta’s item', () => {
      const vendorUser = { id: 'vendor_alpha', role: 'vendor' };
      const check = verifyOrderItemOwnership(mockOrder, 'item_B', vendorUser);
      expect(check.allowed).toBe(false);
      expect(check.statusCode).toBe(403);
      expect(check.message).toContain('only update fulfillment status for items sold by your store');
    });

    it('should allow Admin to oversee and update any vendor’s item', () => {
      const adminUser = { id: 'admin_boss', role: 'admin' };
      const check = verifyOrderItemOwnership(mockOrder, 'item_B', adminUser);
      expect(check.allowed).toBe(true);
    });
  });
});
