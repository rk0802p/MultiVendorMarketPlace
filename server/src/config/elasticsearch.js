import { Client } from '@elastic/elasticsearch';
import { config } from './environment.js';

let esClient = null;
let isConnected = false;

/**
 * Get or initialize Elasticsearch client
 */
export const getElasticClient = () => {
  if (!process.env.ELASTICSEARCH_NODE) {
    return null;
  }
  if (esClient) return esClient;

  const clientOptions = {
    node: config.elasticsearch.node,
    maxRetries: process.env.NODE_ENV === 'test' ? 0 : 2,
    requestTimeout: process.env.NODE_ENV === 'test' ? 300 : 3000,
  };

  if (config.elasticsearch.username && config.elasticsearch.password) {
    clientOptions.auth = {
      username: config.elasticsearch.username,
      password: config.elasticsearch.password,
    };
  }

  try {
    esClient = new Client(clientOptions);
  } catch (error) {
    console.warn(`[Elasticsearch] Client initialization warning: ${error.message}`);
    return null;
  }

  return esClient;
};

/**
 * Check if Elasticsearch cluster is currently reachable
 */
export const checkElasticConnection = async () => {
  const client = getElasticClient();
  if (!client) {
    isConnected = false;
    return false;
  }

  try {
    const health = await client.cluster.health({ timeout: '2s' });
    isConnected = ['green', 'yellow'].includes(health.status);
    console.log(`[Elasticsearch] Connected successfully. Cluster status: ${health.status}`);
    return isConnected;
  } catch (error) {
    isConnected = false;
    console.warn(`[Elasticsearch] Cluster unreachable at ${config.elasticsearch.node}: ${error.message}. Running in MongoDB-backed search fallback mode.`);
    return false;
  }
};

/**
 * Product Index Mapping Definition
 */
export const PRODUCT_INDEX_MAPPING = {
  mappings: {
    properties: {
      id: { type: 'keyword' },
      title: {
        type: 'text',
        analyzer: 'standard',
        fields: {
          keyword: { type: 'keyword', ignore_above: 256 },
        },
      },
      slug: { type: 'keyword' },
      description: {
        type: 'text',
        analyzer: 'standard',
      },
      category: { type: 'keyword' },
      price: { type: 'double' },
      stock: { type: 'integer' },
      images: { type: 'keyword', index: false },
      status: { type: 'keyword' }, // 'active', 'draft', 'archived'
      averageRating: { type: 'double' },
      reviewCount: { type: 'integer' },
      storeId: { type: 'keyword' },
      storeName: {
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
        },
      },
      storeSlug: { type: 'keyword' },
      vendorId: { type: 'keyword' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
    },
  },
};

/**
 * Ensure the product index exists with proper schema
 */
export const ensureProductIndex = async () => {
  const client = getElasticClient();
  if (!client) return false;

  const indexName = config.elasticsearch.index;

  try {
    const exists = await client.indices.exists({ index: indexName });

    if (!exists) {
      await client.indices.create({
        index: indexName,
        ...PRODUCT_INDEX_MAPPING,
      });
      console.log(`[Elasticsearch] Created index: ${indexName}`);
    }
    return true;
  } catch (error) {
    console.warn(`[Elasticsearch] Index verification notice: ${error.message}`);
    return false;
  }
};

export const closeElasticConnection = async () => {
  if (esClient) {
    await esClient.close();
    esClient = null;
    isConnected = false;
  }
};
