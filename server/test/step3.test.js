import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { Store } from '../src/models/Store.js';
import { Product } from '../src/models/Product.js';
import { User } from '../src/models/User.js';
import { ProductSearchService } from '../src/modules/products/product.search.service.js';
import { config } from '../src/config/environment.js';

describe('Step 3: Vendor Onboarding, Product CRUD & S3 Upload Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(ProductSearchService, 'indexProduct').mockResolvedValue(true);
    vi.spyOn(ProductSearchService, 'removeProductFromIndex').mockResolvedValue(true);
  });

  const vendorId1 = '653a1b2c3d4e5f6a7b8c9d11';
  const vendorId2 = '653a1b2c3d4e5f6a7b8c9d22';
  const customerId = '653a1b2c3d4e5f6a7b8c9d33';
  const adminId = '653a1b2c3d4e5f6a7b8c9d99';

  const customerToken = jwt.sign({ id: customerId, role: 'customer', status: 'active' }, config.jwt.secret);
  const vendor1Token = jwt.sign({ id: vendorId1, role: 'vendor', status: 'active' }, config.jwt.secret);
  const vendor2Token = jwt.sign({ id: vendorId2, role: 'vendor', status: 'active' }, config.jwt.secret);
  const adminToken = jwt.sign({ id: adminId, role: 'admin', status: 'active' }, config.jwt.secret);

  describe('Vendor Onboarding & Store Approval', () => {
    it('Customer should successfully apply for a vendor store (status: pending)', async () => {
      vi.spyOn(Store, 'findOne').mockResolvedValue(null);
      vi.spyOn(Store.prototype, 'save').mockImplementation(async function () {
        this._id = 'store_mock_01';
        return this;
      });

      const res = await request(app)
        .post('/api/vendors/apply')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'ElectroTech Solutions',
          slug: 'electrotech-solutions',
          description: 'Premium gaming gear and electronics',
          contactEmail: 'contact@electrotech.com',
          contactPhone: '9876543210',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.store.approvalStatus).toBe('pending');
      expect(res.body.data.store.slug).toBe('electrotech-solutions');
    });

    it('Duplicate store application or duplicate slug should be rejected (409 Conflict)', async () => {
      vi.spyOn(Store, 'findOne').mockResolvedValue({ _id: 'existing_store' });

      const res = await request(app)
        .post('/api/vendors/apply')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'ElectroTech Solutions',
          slug: 'electrotech-solutions',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('Admin should be able to approve a pending store application', async () => {
      const mockStore = {
        _id: 'store_mock_01',
        ownerId: vendorId1,
        name: 'ElectroTech Solutions',
        approvalStatus: 'pending',
        save: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(Store, 'findById').mockResolvedValue(mockStore);
      vi.spyOn(User, 'findByIdAndUpdate').mockResolvedValue({});

      const res = await request(app)
        .patch('/api/admin/vendors/store_mock_01/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockStore.approvalStatus).toBe('approved');
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(vendorId1, { role: 'vendor' });
    });
  });

  describe('S3 Presigned Upload URL Generation', () => {
    it('Vendor should receive presigned upload URL for JPEG/PNG image', async () => {
      const res = await request(app)
        .post('/api/uploads/presigned-url')
        .set('Authorization', `Bearer ${vendor1Token}`)
        .send({
          fileName: 'keyboard-front.png',
          fileType: 'image/png',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.uploadUrl).toBeDefined();
      expect(res.body.data.fileUrl).toContain('.png');
      expect(res.body.data.expiresIn).toBe(300);
    });

    it('Upload request should reject invalid MIME type (e.g., PDF or EXE) with 400', async () => {
      const res = await request(app)
        .post('/api/uploads/presigned-url')
        .set('Authorization', `Bearer ${vendor1Token}`)
        .send({
          fileName: 'document.pdf',
          fileType: 'application/pdf',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Unsupported image type');
    });
  });

  describe('Product Management & Ownership Verification', () => {
    it('Unapproved vendor should be blocked from creating products (403 Forbidden)', async () => {
      // Mock store with pending status
      vi.spyOn(Store, 'findOne').mockResolvedValue({
        _id: 'store_pending',
        ownerId: vendorId1,
        approvalStatus: 'pending',
      });

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${vendor1Token}`)
        .send({
          title: 'Gaming Mouse',
          description: 'High DPI optical gaming mouse with RGB',
          category: 'Electronics',
          price: 1499,
          stock: 20,
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Only approved vendors can create and publish products');
    });

    it('Approved vendor should successfully create a product listing', async () => {
      vi.spyOn(Store, 'findOne').mockResolvedValue({
        _id: 'store_approved_01',
        ownerId: vendorId1,
        approvalStatus: 'approved',
      });

      vi.spyOn(Product.prototype, 'save').mockImplementation(async function () {
        this._id = 'prod_001';
        return this;
      });

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${vendor1Token}`)
        .send({
          title: 'RGB Mechanical Keyboard',
          description: 'Tactile blue switches with programmable macros',
          category: 'Electronics',
          price: 2999,
          stock: 15,
          images: ['https://bucket.s3.amazonaws.com/keyboard.jpg'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product.price).toBe(2999);
      expect(res.body.data.product.stock).toBe(15);
    });

    it('Vendor should be able to update their own product inventory/price', async () => {
      const mockProduct = {
        _id: 'prod_001',
        vendorId: vendorId1,
        title: 'RGB Mechanical Keyboard',
        price: 2999,
        stock: 15,
        save: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(Product, 'findById').mockResolvedValue(mockProduct);

      const res = await request(app)
        .patch('/api/products/prod_001')
        .set('Authorization', `Bearer ${vendor1Token}`)
        .send({
          price: 2699,
          stock: 30,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockProduct.price).toBe(2699);
      expect(mockProduct.stock).toBe(30);
    });

    it('Vendor A should be FORBIDDEN from updating Vendor B product (403 Forbidden)', async () => {
      // Product owned by Vendor 2
      const mockProduct = {
        _id: 'prod_002',
        vendorId: vendorId2,
        title: 'Ergonomic Desk Mat',
        price: 899,
        save: vi.fn(),
      };

      vi.spyOn(Product, 'findById').mockResolvedValue(mockProduct);

      // Vendor 1 attempts to update Vendor 2's product
      const res = await request(app)
        .patch('/api/products/prod_002')
        .set('Authorization', `Bearer ${vendor1Token}`)
        .send({ price: 100 });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('only modify products belonging to your store');
      expect(mockProduct.save).not.toHaveBeenCalled();
    });

    it('Vendor should successfully archive their own product', async () => {
      const mockProduct = {
        _id: 'prod_001',
        vendorId: vendorId1,
        status: 'active',
        save: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(Product, 'findById').mockResolvedValue(mockProduct);

      const res = await request(app)
        .delete('/api/products/prod_001')
        .set('Authorization', `Bearer ${vendor1Token}`);

      expect(res.status).toBe(200);
      expect(mockProduct.status).toBe('archived');
    });
  });
});
