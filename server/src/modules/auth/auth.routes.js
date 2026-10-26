import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { registerSchema, loginSchema, validateRequest } from './auth.validation.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new customer or vendor account
 * @access  Public
 */
router.post('/register', validateRequest(registerSchema), AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & issue JWT
 * @access  Public
 */
router.post('/login', validateRequest(loginSchema), AuthController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Retrieve current authenticated user profile
 * @access  Private (Authenticated)
 */
router.get('/me', authenticate, AuthController.getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user & clear cookie
 * @access  Private (Authenticated)
 */
router.post('/logout', authenticate, AuthController.logout);

export default router;
