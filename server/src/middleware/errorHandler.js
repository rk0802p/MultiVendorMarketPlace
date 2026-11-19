import { ApiResponse } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  // Handle offline MongoDB errors gracefully when database is not connected
  const isDbOffline =
    err?.name === 'MongooseError' ||
    err?.name === 'MongoNetworkError' ||
    err?.name === 'MongoServerSelectionError' ||
    err?.message?.includes('buffering timed out') ||
    err?.message?.includes('before initial connection is complete') ||
    err?.message?.includes('Client must be connected');

  if (isDbOffline) {
    console.warn('[AI Studio] Database offline — returning fallback response for', req.method, req.path);
    if (req.method === 'GET') {
      if (req.path.includes('/products')) {
        return ApiResponse.success(res, {
          message: 'Database offline — returning empty catalogue',
          data: {
            products: [],
            pagination: { page: 1, limit: 12, total: 0, pages: 1 },
            facets: { categories: [], priceStats: null },
            source: 'offline-fallback',
          },
        });
      }
      return ApiResponse.success(res, {
        message: 'Database offline — returning empty result',
        data: req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {},
      });
    }
    return ApiResponse.error(res, {
      statusCode: 503,
      message: 'Service temporarily unavailable (database offline)',
    });
  }

  console.error('[Error Details]:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'Validation failed',
      errors,
    });
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return ApiResponse.error(res, {
      statusCode: 409,
      message: `A record with this ${field} already exists.`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, {
      statusCode: 401,
      message: 'Invalid authorization token',
    });
  }
  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, {
      statusCode: 401,
      message: 'Authorization token has expired',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : (process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message);

  return ApiResponse.error(res, {
    statusCode,
    message,
    errors: err.errors || null,
  });
};
