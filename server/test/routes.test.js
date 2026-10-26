import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { AuthService } from '../src/modules/auth/auth.service.js';
import { ProductService } from '../src/modules/products/product.service.js';
import { config } from '../src/config/environment.js';

describe('API Route Inventory & Contract Verification', () => {
  const adminToken = jwt.sign(
    { id: 'admin_test_1', role: 'admin', status: 'active' },
    config.jwt.secret
  );

  it('GET /health should return 200 and healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.uptime).toBeDefined();
  });

  it('GET /api should return 200 and endpoint catalog links', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.endpoints.auth).toBe('/api/auth');
    expect(res.body.data.endpoints.products).toBe('/api/products');
    expect(res.body.data.endpoints.orders).toBe('/api/orders');
  });

  it('GET /api/docs should return 200 with all documented modules', async () => {
    const res = await request(app).get('/api/docs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.modules.length).toBeGreaterThanOrEqual(10);
  });

  it('POST /api/auth/register should respond with 201 created envelope', async () => {
    vi.spyOn(AuthService, 'register').mockResolvedValueOnce({
      user: {
        id: 'mock_user_id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
        status: 'active',
      },
      token: 'mock_jwt_token',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'Password123!' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('test@example.com');
  });

  it('GET /api/products should return 200 with catalog structure', async () => {
    vi.spyOn(ProductService, 'getProducts').mockResolvedValueOnce({
      products: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    });

    const res = await request(app).get('/api/products?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pagination).toBeDefined();
  });

  it('GET /api/cart should return 200 with cart subtotal envelope', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toBeDefined();
  });

  it('POST /api/orders should return 201 with order placement envelope', async () => {
    const res = await request(app).post('/api/orders').send({});
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toBeDefined();
  });

  it('POST /api/payments/create-order should return 201 with payment provider details', async () => {
    const res = await request(app).post('/api/payments/create-order').send({ amount: 3000 });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.currency).toBe('INR');
  });

  it('GET /api/admin/analytics should reject unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/admin/analytics');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/admin/analytics should return 200 when authenticated as admin', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.metrics.grossSales).toBeDefined();
  });

  it('POST /api/uploads/presigned-url should return 201 with S3 presigned URL structure', async () => {
    const res = await request(app)
      .post('/api/uploads/presigned-url')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fileName: 'laptop.jpg', fileType: 'image/jpeg' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.uploadUrl).toContain('s3');
  });

  it('Unknown route should return standard 404 error envelope', async () => {
    const res = await request(app).get('/api/unknown-non-existent-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
