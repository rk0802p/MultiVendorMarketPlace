import app from '../src/app.js';
import { connectDatabase } from '../src/config/database.js';
import { getRedisClient } from '../src/config/redis.js';

/**
 * Vercel Serverless Function entry point wrapping the Express application.
 */
export default async function handler(req, res) {
  try {
    await connectDatabase({ exitOnError: false });
    await getRedisClient().catch(() => null);
  } catch (error) {
    // Allow health check endpoint to respond even before database environment variables are set
    if (!req.url?.startsWith('/health')) {
      console.error('[Vercel Serverless DB Error]:', error.message);
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please verify MONGODB_URI environment configuration.',
      });
    }
  }

  return app(req, res);
}
