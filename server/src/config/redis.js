import { createClient } from 'redis';
import { config } from './environment.js';

let redisClient = null;

export const getRedisClient = async () => {
  // In unit test environment, return null so tests cleanly use CartService in-memory fallback
  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = createClient({
    url: config.redis.url,
    socket: {
      reconnectStrategy: (retries) => (retries > 1 ? new Error('Redis connection limit reached') : 500),
      connectTimeout: 1000,
    },
  });

  redisClient.on('error', (err) => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[Redis] Connection warning/error:', err.message);
    }
  });

  redisClient.on('connect', () => {
    console.log('[Redis] Connected successfully');
  });

  try {
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[Redis] Could not connect to Redis at ${config.redis.url}: ${error.message}`);
    }
    return null;
  }
};

export const closeRedisConnection = async () => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
};
