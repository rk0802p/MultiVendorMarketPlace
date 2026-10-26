import { AuthService } from './auth.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { config } from '../../config/environment.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: 'lax',
  maxAge: config.jwt.cookieExpiresInDays * 24 * 60 * 60 * 1000,
};

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req, res, next) {
    try {
      const { user, token } = await AuthService.register(req.body);

      // Set HttpOnly authentication cookie
      res.cookie('jwt', token, COOKIE_OPTIONS);

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Account registered successfully.',
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Log in user
   */
  static async login(req, res, next) {
    try {
      const { user, token } = await AuthService.login(req.body);

      // Set HttpOnly authentication cookie
      res.cookie('jwt', token, COOKIE_OPTIONS);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Login successful.',
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current authenticated user profile
   */
  static async getMe(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.id);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Current profile retrieved.',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user and clear cookie
   */
  static async logout(req, res) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax',
    });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Logged out successfully.',
    });
  }
}
