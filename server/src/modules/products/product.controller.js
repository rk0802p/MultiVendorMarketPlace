import { ProductService } from './product.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class ProductController {
  /**
   * Create product (Vendor only)
   */
  static async create(req, res, next) {
    try {
      const product = await ProductService.createProduct(req.user.id, req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Product created successfully.',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update product (Vendor owner or Admin)
   */
  static async update(req, res, next) {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.user, req.body);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Product updated successfully.',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Archive product (Vendor owner or Admin)
   */
  static async archive(req, res, next) {
    try {
      const product = await ProductService.archiveProduct(req.params.id, req.user);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Product archived successfully.',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single product by ID or slug
   */
  static async getById(req, res, next) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Product details retrieved.',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Browse products (Public customer catalog)
   */
  static async list(req, res, next) {
    try {
      const result = await ProductService.getProducts(req.query);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Products catalog retrieved.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get products for authenticated vendor
   */
  static async listVendorProducts(req, res, next) {
    try {
      const products = await ProductService.getVendorProducts(req.user.id, req.query);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Vendor products retrieved.',
        data: { products },
      });
    } catch (error) {
      next(error);
    }
  }
}
