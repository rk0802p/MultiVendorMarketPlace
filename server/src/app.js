import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config/environment.js';
import { ApiResponse } from './utils/apiResponse.js';
import { errorHandler } from './middleware/errorHandler.js';

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

// Root API greeting
app.get(`${config.apiPrefix}`, (req, res) => {
  return ApiResponse.success(res, {
    message: 'Welcome to Multi-Vendor E-Commerce Marketplace API',
    data: {
      version: '1.0.0',
      docs: '/api/docs',
    },
  });
});

// Module routes will be mounted here in upcoming steps:
// app.use(`${config.apiPrefix}/auth`, authRoutes);
// app.use(`${config.apiPrefix}/vendors`, vendorRoutes);
// app.use(`${config.apiPrefix}/products`, productRoutes);
// app.use(`${config.apiPrefix}/cart`, cartRoutes);
// app.use(`${config.apiPrefix}/orders`, orderRoutes);
// app.use(`${config.apiPrefix}/payments`, paymentRoutes);
// app.use(`${config.apiPrefix}/reviews`, reviewRoutes);
// app.use(`${config.apiPrefix}/coupons`, couponRoutes);
// app.use(`${config.apiPrefix}/admin`, adminRoutes);

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
