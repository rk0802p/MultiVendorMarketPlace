import mongoose from 'mongoose';
import { config } from './environment.js';

let cachedPromise = null;

/**
 * Connect to MongoDB with connection caching for both standard servers and serverless handlers.
 */
export const connectDatabase = async ({ exitOnError = true } = {}) => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  try {
    cachedPromise = mongoose.connect(config.mongodb.uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });
    const conn = await cachedPromise;
    console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    cachedPromise = null;
    console.error(`[Database Error] Connection failed: ${error.message}`);
    if (exitOnError) {
      process.exit(1);
    }
    throw error;
  }
};
