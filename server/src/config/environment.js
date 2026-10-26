import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiPrefix: process.env.API_PREFIX || '/api',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/multivendor_marketplace',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    cartTtlSeconds: parseInt(process.env.REDIS_CART_TTL_SECONDS, 10) || 604800, // 7 days
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_super_secret_jwt_key_at_least_32_characters_long',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieExpiresInDays: parseInt(process.env.JWT_COOKIE_EXPIRES_IN_DAYS, 10) || 7,
  },

  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    username: process.env.ELASTICSEARCH_USERNAME || '',
    password: process.env.ELASTICSEARCH_PASSWORD || '',
    index: process.env.ELASTICSEARCH_INDEX || 'marketplace_products',
  },

  aws: {
    region: process.env.AWS_REGION || 'ap-south-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    bucketName: process.env.AWS_S3_BUCKET_NAME || 'multivendor-marketplace-images',
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  },

  marketplace: {
    platformCommissionPercentage: parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE) || 10,
  },
};
