import { createClient } from 'redis';
import { config } from './environment.js';

let redisClient = null;

export const getRedisClient = async () => {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = createClient({
    url: config.redis.url,
  });

  redisClient.on('error', (err) => {
    console.warn('[Redis] Connection warning/error:', err.message);
  });

  redisClient.on('connect', () => {
    console.log('[Redis] Connected successfully');
  });

  try {
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn(`[Redis] Could not connect to Redis at ${config.redis.url}: ${error.message}`);
    return null;
  }
};

export const closeRedisConnection = async () => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
  }
};
