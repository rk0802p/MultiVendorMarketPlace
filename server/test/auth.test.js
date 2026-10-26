import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { config } from '../src/config/environment.js';

describe('Step 2: Authentication & Role-Based Access Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('User Registration (POST /api/auth/register)', () => {
    it('should register a new customer account successfully', async () => {
      vi.spyOn(User, 'findOne').mockResolvedValue(null);
      vi.spyOn(User.prototype, 'save').mockImplementation(async function () {
        this._id = '653a1b2c3d4e5f6a7b8c9d01';
        this.createdAt = new Date();
        return this;
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Raj Patel',
          email: 'raj@example.com',
          password: 'Password123!',
          role: 'customer',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('raj@example.com');
      expect(res.body.data.user.role).toBe('customer');
      expect(res.body.data.token).toBeDefined();
      // Ensure passwordHash is NEVER returned in response
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.body.data.user.password).toBeUndefined();
      // Ensure HttpOnly cookie is set
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should register a new vendor account successfully', async () => {
      vi.spyOn(User, 'findOne').mockResolvedValue(null);
      vi.spyOn(User.prototype, 'save').mockImplementation(async function () {
        this._id = '653a1b2c3d4e5f6a7b8c9d02';
        this.createdAt = new Date();
        return this;
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Tech Seller',
          email: 'seller@example.com',
          password: 'Password123!',
          role: 'vendor',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('vendor');
    });

    it('should reject registration with duplicate email (409 Conflict)', async () => {
      vi.spyOn(User, 'findOne').mockResolvedValue({
        _id: 'existing_id',
        email: 'raj@example.com',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Raj Patel',
          email: 'raj@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('should reject registration with invalid email or weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'R',
          email: 'not-an-email',
          password: '123', // less than 6 chars
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('User Login (POST /api/auth/login)', () => {
    it('should log in successfully with correct credentials and issue JWT', async () => {
      const mockUser = {
        _id: '653a1b2c3d4e5f6a7b8c9d01',
        name: 'Raj Patel',
        email: 'raj@example.com',
        role: 'customer',
        status: 'active',
        comparePassword: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(User, 'findOne').mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'raj@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('raj@example.com');
      // Passwords never returned
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('should reject login with incorrect password (401)', async () => {
      const mockUser = {
        _id: '653a1b2c3d4e5f6a7b8c9d01',
        name: 'Raj Patel',
        email: 'raj@example.com',
        role: 'customer',
        status: 'active',
        comparePassword: vi.fn().mockResolvedValue(false),
      };

      vi.spyOn(User, 'findOne').mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'raj@example.com',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should reject login for non-existent email (401)', async () => {
      vi.spyOn(User, 'findOne').mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unknown@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject login for suspended accounts (403)', async () => {
      const suspendedUser = {
        _id: 'suspended_id',
        email: 'suspended@example.com',
        status: 'suspended',
      };

      vi.spyOn(User, 'findOne').mockReturnValue({
        select: vi.fn().mockResolvedValue(suspendedUser),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'suspended@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('suspended');
    });
  });

  describe('Session Profile & Logout (GET /api/auth/me & POST /api/auth/logout)', () => {
    it('should retrieve current user profile with valid Bearer token', async () => {
      const validToken = jwt.sign(
        { id: 'user_123', email: 'raj@example.com', role: 'customer', status: 'active' },
        config.jwt.secret
      );

      vi.spyOn(User, 'findById').mockResolvedValue({
        _id: 'user_123',
        name: 'Raj Patel',
        email: 'raj@example.com',
        role: 'customer',
        status: 'active',
        createdAt: new Date(),
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('raj@example.com');
    });

    it('should reject request with expired or invalid token (401)', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_garbage_token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should successfully log out and clear cookie', async () => {
      const validToken = jwt.sign(
        { id: 'user_123', role: 'customer', status: 'active' },
        config.jwt.secret
      );

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Logged out');
    });
  });

  describe('Role-Based Access Between Roles', () => {
    const customerToken = jwt.sign(
      { id: 'cust_1', role: 'customer', status: 'active' },
      config.jwt.secret
    );
    const vendorToken = jwt.sign(
      { id: 'vend_1', role: 'vendor', status: 'active' },
      config.jwt.secret
    );
    const adminToken = jwt.sign(
      { id: 'adm_1', role: 'admin', status: 'active' },
      config.jwt.secret
    );

    it('Customer CANNOT access Admin Analytics (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Forbidden');
    });

    it('Customer CANNOT access Vendor Store endpoints (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/vendors/me')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('Vendor CAN access Vendor Store endpoints', async () => {
      const res = await request(app)
        .get('/api/vendors/me')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(200);
    });

    it('Vendor CANNOT access Admin Analytics (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(403);
    });

    it('Admin CAN access Admin Analytics', async () => {
      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });
});
