import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization Bearer header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2. Check HttpOnly cookie
    else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return ApiResponse.error(res, {
        statusCode: 401,
        message: 'Authentication required. No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Check account status
    if (decoded.status && decoded.status === 'suspended') {
      return ApiResponse.error(res, {
        statusCode: 403,
        message: 'Account has been suspended. Please contact administrator.',
      });
    }

    req.user = decoded;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(res, {
        statusCode: 401,
        message: 'Session expired. Please log in again.',
      });
    }
    return ApiResponse.error(res, {
      statusCode: 401,
      message: 'Invalid authorization token.',
    });
  }
};
