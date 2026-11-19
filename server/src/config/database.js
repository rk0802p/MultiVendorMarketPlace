import mongoose from 'mongoose';
import { config } from './environment.js';

// Fail fast instead of hanging when MongoDB is offline
mongoose.set('bufferCommands', false);

let cachedPromise = null;

/**
 * Connect to MongoDB with connection caching and graceful offline fallback.
 */
export const connectDatabase = async ({ exitOnError = false } = {}) => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URI) {
    console.warn('[Database] MONGODB_URI not configured — running in offline fallback mode.');
    return null;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  try {
    cachedPromise = mongoose.connect(config.mongodb.uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 3000,
    });
    const conn = await cachedPromise;
    console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    cachedPromise = null;
    console.warn(`[Database] MongoDB not connected — running in offline fallback mode: ${error.message}`);
    if (exitOnError) {
      process.exit(1);
    }
    return null;
  }
};
