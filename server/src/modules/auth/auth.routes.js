import { Router } from 'express';
import { ApiResponse } from '../../utils/apiResponse.js';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new customer account
 * @access  Public
 */
router.post('/register', (req, res) => {
  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'User registered successfully (Contract Defined)',
    data: {
      user: {
        id: 'mock_user_id',
        name: req.body.name || 'Sample User',
        email: req.body.email || 'user@example.com',
        role: 'customer',
      },
      token: 'jwt_token_sample',
    },
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & issue JWT
 * @access  Public
 */
router.post('/login', (req, res) => {
  return ApiResponse.success(res, {
    message: 'User authenticated successfully (Contract Defined)',
    data: {
      user: {
        id: 'mock_user_id',
        email: req.body.email || 'user@example.com',
        role: 'customer',
      },
      token: 'jwt_token_sample',
    },
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Retrieve current authenticated user profile
 * @access  Private (Authenticated)
 */
router.get('/me', (req, res) => {
  return ApiResponse.success(res, {
    message: 'Profile retrieved successfully (Contract Defined)',
    data: {
      user: {
        id: 'mock_user_id',
        name: 'Sample User',
        email: 'user@example.com',
        role: 'customer',
      },
    },
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user & clear cookie
 * @access  Private (Authenticated)
 */
router.post('/logout', (req, res) => {
  return ApiResponse.success(res, {
    message: 'User logged out successfully (Contract Defined)',
  });
});

export default router;
