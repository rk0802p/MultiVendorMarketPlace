import { VendorService } from './vendor.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class VendorController {
  /**
   * Apply for a vendor store
   */
  static async apply(req, res, next) {
    try {
      const store = await VendorService.applyForStore(req.user.id, req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Vendor application submitted successfully. Pending admin review.',
        data: { store },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get authenticated vendor's store
   */
  static async getMe(req, res, next) {
    try {
      const store = await VendorService.getVendorStore(req.user.id);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Store profile retrieved.',
        data: { store },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update authenticated vendor's store profile
   */
  static async updateMe(req, res, next) {
    try {
      const store = await VendorService.updateVendorStore(req.user.id, req.body);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Store profile updated successfully.',
        data: { store },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List stores (admin or public active)
   */
  static async listStores(req, res, next) {
    try {
      const stores = await VendorService.getStores(req.query);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Stores retrieved.',
        data: { stores },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single store by ID or slug
   */
  static async getStoreById(req, res, next) {
    try {
      const store = await VendorService.getPublicStore(req.params.idOrSlug);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Store details retrieved.',
        data: { store },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Approve/Reject vendor store
   */
  static async updateStatus(req, res, next) {
    try {
      const { status, rejectionReason } = req.body;
      const store = await VendorService.updateStoreStatus(req.params.id, status, rejectionReason);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: `Store status updated to ${status}.`,
        data: { store },
      });
    } catch (error) {
      next(error);
    }
  }
}
