import app from './app.js';
import { config } from './config/environment.js';
import { connectDatabase } from './config/database.js';
import { getRedisClient, closeRedisConnection } from './config/redis.js';
import { checkElasticConnection, ensureProductIndex, closeElasticConnection } from './config/elasticsearch.js';

const startServer = async () => {
  try {
    // Connect to primary MongoDB database (non-fatal if offline)
    await connectDatabase({ exitOnError: false });

    // Initialize Redis cache client (in-memory fallback)
    await getRedisClient();

    // Initialize Elasticsearch search engine (skipped if unconfigured)
    await checkElasticConnection();
    await ensureProductIndex();

    // Start listening on 0.0.0.0 for AI Studio preview accessibility
    const server = app.listen(config.port, '0.0.0.0', () => {
      console.log(`[Server] Multi-Vendor Marketplace API running on http://0.0.0.0:${config.port} in ${config.env} mode`);
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
