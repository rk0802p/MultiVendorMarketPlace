import jwt from 'jsonwebtoken';
import { User } from '../../models/User.js';
import { config } from '../../config/environment.js';

export class AuthService {
  /**
   * Generate signed JWT token
   */
  static generateToken(user) {
    return jwt.sign(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  /**
   * Register a new user
   */
  static async register({ name, email, password, role = 'customer' }) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('A user with this email address already exists.');
      error.statusCode = 409;
      error.isOperational = true;
      throw error;
    }

    // Role safety: public registration can only create 'customer' or 'vendor'
    const assignedRole = ['customer', 'vendor'].includes(role) ? role : 'customer';

    const user = new User({
      name,
      email,
      passwordHash: password, // Will be hashed by pre-save hook in User model
      role: assignedRole,
      status: 'active',
    });

    await user.save();

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Authenticate user with email and password
   */
  static async login({ email, password }) {
    // Explicitly select passwordHash as it is excluded by default in schema
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }

    // Check account status
    if (user.status === 'suspended') {
      const error = new Error('Your account has been suspended. Please contact administrator.');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      token,
    };
  }

  /**
   * Retrieve user profile by ID
   */
  static async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };
  }
}
