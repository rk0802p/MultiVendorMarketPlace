import app from './app.js';
import { config } from './config/environment.js';
import { connectDatabase } from './config/database.js';
import { getRedisClient, closeRedisConnection } from './config/redis.js';
import { checkElasticConnection, ensureProductIndex, closeElasticConnection } from './config/elasticsearch.js';

const startServer = async () => {
  try {
    // Connect to primary MongoDB database
    await connectDatabase();

    // Initialize Redis cache client
    await getRedisClient();

    // Initialize Elasticsearch search engine
    await checkElasticConnection();
    await ensureProductIndex();

    // Start listening
    const server = app.listen(config.port, () => {
      console.log(`[Server] Multi-Vendor Marketplace API running on port ${config.port} in ${config.env} mode`);
      console.log(`[Server] Health check: http://localhost:${config.port}/health`);
      console.log(`[Server] API Base: http://localhost:${config.port}${config.apiPrefix}`);
    });

    // Graceful shutdown handling
    const shutdown = async () => {
      console.log('[Server] Gracefully shutting down...');
      await closeRedisConnection();
      await closeElasticConnection();
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('[Server Startup Error]:', error);
    process.exit(1);
  }
};

startServer();
