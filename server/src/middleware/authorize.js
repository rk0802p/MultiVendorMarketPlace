import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Role-Based Access Control (RBAC) middleware
 * Ensures the authenticated user has one of the required roles.
 * @param  {...string} allowedRoles - E.g. 'admin', 'vendor', 'customer'
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, {
        statusCode: 401,
        message: 'Authentication required before role authorization.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.error(res, {
        statusCode: 403,
        message: `Forbidden: Access requires one of the following roles: [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
};

/**
 * Self or Admin Ownership Check
 * Ensures a customer or user can only access/modify their own resource,
 * while allowing administrators override access.
 * @param {string} paramKey - Route param containing the target user ID (e.g. 'userId' or 'id')
 */
export const requireSelfOrAdmin = (paramKey = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, {
        statusCode: 401,
        message: 'Authentication required.',
      });
    }

    const targetUserId = req.params[paramKey] || req.body[paramKey];

    if (req.user.role === 'admin' || req.user.id === targetUserId) {
      return next();
    }

    return ApiResponse.error(res, {
      statusCode: 403,
      message: 'Forbidden: You do not have permission to access or modify another user’s resource.',
    });
  };
};

/**
 * Vendor Resource Ownership Middleware
 * Verifies that the authenticated vendor owns the product or store being modified.
 * @param {Function} getResourceOwnerId - Async callback (req) => Promise<string|null>
 */
export const requireResourceOwner = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return ApiResponse.error(res, {
          statusCode: 401,
          message: 'Authentication required.',
        });
      }

      // Admins have full oversight access
      if (req.user.role === 'admin') {
        return next();
      }

      const ownerId = await getResourceOwnerId(req);

      if (!ownerId) {
        return ApiResponse.error(res, {
          statusCode: 404,
          message: 'Target resource not found.',
        });
      }

      if (ownerId.toString() !== req.user.id.toString()) {
        return ApiResponse.error(res, {
          statusCode: 403,
          message: 'Forbidden: You do not have ownership of this resource.',
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Multi-Vendor Order Line Item Fulfillment Authorization
 * Guarantees that a vendor can only update the fulfillment status of an item they own.
 * Prevents Cross-Vendor fulfillment pollution.
 * @param {Object} order - Order document
 * @param {string} itemId - ID of the order item
 * @param {Object} user - Authenticated user object
 */
export const verifyOrderItemOwnership = (order, itemId, user) => {
  if (user.role === 'admin') return { allowed: true };

  const item = order.items.find((i) => i._id.toString() === itemId.toString());

  if (!item) {
    return { allowed: false, statusCode: 404, message: 'Order item not found.' };
  }

  if (item.vendorId.toString() !== user.id.toString()) {
    return {
      allowed: false,
      statusCode: 403,
      message: 'Forbidden: You can only update fulfillment status for items sold by your store.',
    };
  }

  return { allowed: true, item };
};
