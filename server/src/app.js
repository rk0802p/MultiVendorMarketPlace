import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/environment.js';
import { ApiResponse } from './utils/apiResponse.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import vendorRoutes from './modules/vendors/vendor.routes.js';
import productRoutes from './modules/products/product.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import orderRoutes from './modules/orders/order.routes.js';
import paymentRoutes from './modules/payments/payment.routes.js';
import reviewRoutes from './modules/reviews/review.routes.js';
import couponRoutes from './modules/coupons/coupon.routes.js';
import adminRoutes from './modules/analytics/analytics.routes.js';
import uploadRoutes from './modules/uploads/upload.routes.js';

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiting Security Hardening
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    message: 'Too many requests from this client. Please retry after 15 minutes.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    message: 'Too many authentication attempts. Please retry after 15 minutes.',
  },
});

app.use(globalLimiter);
app.use(`${config.apiPrefix}/auth/login`, authLimiter);
app.use(`${config.apiPrefix}/auth/register`, authLimiter);

// Base healthcheck route
app.get('/health', (req, res) => {
  return ApiResponse.success(res, {
    message: 'Multi-Vendor Marketplace API is running healthy',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: config.env,
    },
  });
});

// Root API discovery & endpoint catalogue
app.get(`${config.apiPrefix}`, (req, res) => {
  return ApiResponse.success(res, {
    message: 'Welcome to Multi-Vendor E-Commerce Marketplace API',
    data: {
      version: '1.0.0',
      docs: `${config.apiPrefix}/docs`,
      endpoints: {
        auth: `${config.apiPrefix}/auth`,
        vendors: `${config.apiPrefix}/vendors`,
        products: `${config.apiPrefix}/products`,
        cart: `${config.apiPrefix}/cart`,
        orders: `${config.apiPrefix}/orders`,
        payments: `${config.apiPrefix}/payments`,
        reviews: `${config.apiPrefix}/reviews`,
        coupons: `${config.apiPrefix}/coupons`,
        admin: `${config.apiPrefix}/admin`,
        uploads: `${config.apiPrefix}/uploads`,
      },
    },
  });
});

// API Documentation index endpoint
app.get(`${config.apiPrefix}/docs`, (req, res) => {
  return ApiResponse.success(res, {
    message: 'Multi-Vendor Marketplace API Endpoint Catalog',
    data: {
      baseUrl: `${config.apiPrefix}`,
      modules: [
        {
          module: 'Auth',
          routes: [
            { method: 'POST', path: '/auth/register', auth: 'Public', role: 'Any' },
            { method: 'POST', path: '/auth/login', auth: 'Public', role: 'Any' },
            { method: 'GET', path: '/auth/me', auth: 'Bearer / Cookie', role: 'Any' },
            { method: 'POST', path: '/auth/logout', auth: 'Bearer / Cookie', role: 'Any' },
          ],
        },
        {
          module: 'Vendors',
          routes: [
            { method: 'POST', path: '/vendors/apply', auth: 'Bearer', role: 'Customer' },
            { method: 'GET', path: '/vendors/me', auth: 'Bearer', role: 'Vendor' },
            { method: 'PATCH', path: '/vendors/me', auth: 'Bearer', role: 'Vendor' },
          ],
        },
        {
          module: 'Products',
          routes: [
            { method: 'GET', path: '/products', auth: 'Public', role: 'Any' },
            { method: 'GET', path: '/products/:id', auth: 'Public', role: 'Any' },
            { method: 'POST', path: '/products', auth: 'Bearer', role: 'Vendor' },
            { method: 'PATCH', path: '/products/:id', auth: 'Bearer', role: 'Vendor' },
            { method: 'DELETE', path: '/products/:id', auth: 'Bearer', role: 'Vendor' },
          ],
        },
        {
          module: 'Cart',
          routes: [
            { method: 'GET', path: '/cart', auth: 'Bearer', role: 'Customer' },
            { method: 'POST', path: '/cart/items', auth: 'Bearer', role: 'Customer' },
            { method: 'PATCH', path: '/cart/items/:productId', auth: 'Bearer', role: 'Customer' },
            { method: 'DELETE', path: '/cart/items/:productId', auth: 'Bearer', role: 'Customer' },
            { method: 'DELETE', path: '/cart', auth: 'Bearer', role: 'Customer' },
          ],
        },
        {
          module: 'Orders',
          routes: [
            { method: 'POST', path: '/orders', auth: 'Bearer', role: 'Customer' },
            { method: 'GET', path: '/orders/my', auth: 'Bearer', role: 'Customer' },
            { method: 'GET', path: '/orders/:id', auth: 'Bearer', role: 'Customer / Admin / Vendor' },
            { method: 'GET', path: '/orders/:id/invoice', auth: 'Bearer', role: 'Customer / Admin' },
            { method: 'GET', path: '/orders/vendor/items', auth: 'Bearer', role: 'Vendor' },
            { method: 'PATCH', path: '/orders/vendor/:orderId/items/:itemId/status', auth: 'Bearer', role: 'Vendor' },
          ],
        },
        {
          module: 'Payments',
          routes: [
            { method: 'POST', path: '/payments/create-order', auth: 'Bearer', role: 'Customer' },
            { method: 'POST', path: '/payments/verify', auth: 'Bearer', role: 'Customer' },
            { method: 'POST', path: '/payments/webhook', auth: 'HMAC Signature', role: 'Payment Provider' },
          ],
        },
        {
          module: 'Reviews',
          routes: [
            { method: 'GET', path: '/reviews/product/:productId', auth: 'Public', role: 'Any' },
            { method: 'POST', path: '/reviews/product/:productId', auth: 'Bearer', role: 'Customer (Verified)' },
          ],
        },
        {
          module: 'Coupons',
          routes: [
            { method: 'POST', path: '/coupons/validate', auth: 'Bearer', role: 'Customer' },
            { method: 'GET', path: '/coupons', auth: 'Bearer', role: 'Admin' },
            { method: 'POST', path: '/coupons', auth: 'Bearer', role: 'Admin' },
          ],
        },
        {
          module: 'Admin',
          routes: [
            { method: 'GET', path: '/admin/analytics', auth: 'Bearer', role: 'Admin' },
            { method: 'PATCH', path: '/admin/vendors/:id/status', auth: 'Bearer', role: 'Admin' },
            { method: 'GET', path: '/admin/orders', auth: 'Bearer', role: 'Admin' },
            { method: 'GET', path: '/admin/users', auth: 'Bearer', role: 'Admin' },
          ],
        },
        {
          module: 'Uploads',
          routes: [
            { method: 'POST', path: '/uploads/presigned-url', auth: 'Bearer', role: 'Vendor / Admin' },
          ],
        },
      ],
    },
  });
});

// Mount module routes
app.use(`${config.apiPrefix}/auth`, authRoutes);
app.use(`${config.apiPrefix}/vendors`, vendorRoutes);
app.use(`${config.apiPrefix}/products`, productRoutes);
app.use(`${config.apiPrefix}/cart`, cartRoutes);
app.use(`${config.apiPrefix}/orders`, orderRoutes);
app.use(`${config.apiPrefix}/payments`, paymentRoutes);
app.use(`${config.apiPrefix}/reviews`, reviewRoutes);
app.use(`${config.apiPrefix}/coupons`, couponRoutes);
app.use(`${config.apiPrefix}/admin`, adminRoutes);
app.use(`${config.apiPrefix}/uploads`, uploadRoutes);

// 404 Handler
app.use((req, res) => {
  return ApiResponse.error(res, {
    statusCode: 404,
    message: `Resource not found at ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
