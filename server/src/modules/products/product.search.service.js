import { getElasticClient } from '../../config/elasticsearch.js';
import { config } from '../../config/environment.js';

export class ProductSearchService {
  static outbox = []; // In-memory retry queue for failed index updates
  static isProcessingOutbox = false;

  /**
   * Format a Mongoose Product document into an Elasticsearch search document
   */
  static formatDocument(product, store = {}) {
    return {
      id: product._id ? product._id.toString() : product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      category: product.category,
      price: Number(product.price),
      stock: Number(product.stock),
      images: product.images || [],
      status: product.status || 'active',
      averageRating: Number(product.averageRating || 0),
      reviewCount: Number(product.reviewCount || 0),
      storeId: (product.storeId?._id || product.storeId || store._id || '').toString(),
      storeName: product.storeId?.name || store.name || '',
      storeSlug: product.storeId?.slug || store.slug || '',
      vendorId: (product.vendorId?._id || product.vendorId || '').toString(),
      createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString(),
    };
  }

  /**
   * Build Elasticsearch Boolean DSL Query
   */
  static buildSearchQuery({
    q,
    category,
    minPrice,
    maxPrice,
    storeId,
    inStockOnly,
    sort = 'newest',
    page = 1,
    limit = 12,
  }) {
    const filterClauses = [
      { term: { status: 'active' } }, // Exclude inactive / draft / archived products
    ];

    // Category filter
    if (category && category !== 'All Categories') {
      filterClauses.push({ term: { category } });
    }

    // Store filter
    if (storeId) {
      filterClauses.push({ term: { storeId } });
    }

    // Availability filter (stock > 0)
    if (inStockOnly === true || inStockOnly === 'true') {
      filterClauses.push({ range: { stock: { gt: 0 } } });
    }

    // Price range filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceRange = {};
      if (minPrice !== undefined && minPrice !== '') priceRange.gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') priceRange.lte = Number(maxPrice);
      if (Object.keys(priceRange).length > 0) {
        filterClauses.push({ range: { price: priceRange } });
      }
    }

    // Full-text keyword search across title (weight 3x) and description (weight 1x)
    let queryClause;
    if (q && q.trim().length > 0) {
      queryClause = {
        bool: {
          must: [
            {
              multi_match: {
                query: q.trim(),
                fields: ['title^3', 'title.keyword^2', 'description', 'storeName^1.5'],
                fuzziness: 'AUTO',
                operator: 'or',
              },
            },
          ],
          filter: filterClauses,
        },
      };
    } else {
      queryClause = {
        bool: {
          must: [{ match_all: {} }],
          filter: filterClauses,
        },
      };
    }

    // Sorting definition
    let sortClause = [];
    switch (sort) {
      case 'price_asc':
        sortClause = [{ price: { order: 'asc' } }, { createdAt: { order: 'desc' } }];
        break;
      case 'price_desc':
        sortClause = [{ price: { order: 'desc' } }, { createdAt: { order: 'desc' } }];
        break;
      case 'rating':
        sortClause = [{ averageRating: { order: 'desc' } }, { reviewCount: { order: 'desc' } }];
        break;
      case 'relevance':
        sortClause = q ? [{ _score: { order: 'desc' } }, { createdAt: { order: 'desc' } }] : [{ createdAt: { order: 'desc' } }];
        break;
      case 'newest':
      default:
        sortClause = [{ createdAt: { order: 'desc' } }];
        break;
    }

    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
    const from = (safePage - 1) * safeLimit;

    return {
      query: queryClause,
      sort: sortClause,
      from,
      size: safeLimit,
      track_total_hits: true,
      aggs: {
        categories: {
          terms: { field: 'category', size: 20 },
        },
        price_stats: {
          stats: { field: 'price' },
        },
      },
    };
  }

  /**
   * Search products using Elasticsearch
   */
  static async search(params = {}) {
    const client = getElasticClient();
    if (!client) return null;

    const esQuery = this.buildSearchQuery(params);
    const indexName = config.elasticsearch.index;

    try {
      const response = await client.search({
        index: indexName,
        body: esQuery,
      });

      const totalHits =
        typeof response.hits.total === 'number'
          ? response.hits.total
          : response.hits.total?.value || 0;

      const page = Math.max(1, parseInt(params.page, 10) || 1);
      const limit = Math.max(1, Math.min(100, parseInt(params.limit, 10) || 12));

      const products = response.hits.hits.map((hit) => {
        const doc = hit._source;
        return {
          _id: doc.id || hit._id,
          id: doc.id || hit._id,
          title: doc.title,
          slug: doc.slug,
          description: doc.description,
          category: doc.category,
          price: doc.price,
          stock: doc.stock,
          images: doc.images,
          status: doc.status,
          averageRating: doc.averageRating,
          reviewCount: doc.reviewCount,
          storeId: {
            _id: doc.storeId,
            name: doc.storeName,
            slug: doc.storeSlug,
          },
          vendorId: doc.vendorId,
          createdAt: doc.createdAt,
          _score: hit._score,
        };
      });

      const facets = {
        categories: response.aggregations?.categories?.buckets || [],
        priceStats: response.aggregations?.price_stats || { min: 0, max: 0, avg: 0, count: 0 },
      };

      return {
        products,
        pagination: {
          page,
          limit,
          total: totalHits,
          pages: Math.ceil(totalHits / limit) || 1,
        },
        facets,
        source: 'elasticsearch',
      };
    } catch (error) {
      console.warn(`[Elasticsearch Search Error]: ${error.message}. Falling back to DB search.`);
      return null;
    }
  }

  /**
   * Index or re-index a single product document in Elasticsearch
   */
  static async indexProduct(product, store = {}) {
    const client = getElasticClient();
    const doc = this.formatDocument(product, store);
    const indexName = config.elasticsearch.index;

    if (!client) {
      this.enqueueOutbox('index', doc.id, doc);
      return false;
    }

    try {
      await client.index({
        index: indexName,
        id: doc.id,
        body: doc,
        refresh: 'wait_for',
      });
      return true;
    } catch (error) {
      console.warn(`[Elasticsearch Indexing Failed]: ${error.message}. Queuing to outbox.`);
      this.enqueueOutbox('index', doc.id, doc);
      return false;
    }
  }

  /**
   * Partially update a product in Elasticsearch
   */
  static async updateProductIndex(productId, partialUpdate) {
    const client = getElasticClient();
    const id = productId.toString();
    const indexName = config.elasticsearch.index;

    if (!client) {
      this.enqueueOutbox('update', id, partialUpdate);
      return false;
    }

    try {
      await client.update({
        index: indexName,
        id,
        body: {
          doc: {
            ...partialUpdate,
            updatedAt: new Date().toISOString(),
          },
        },
        refresh: 'wait_for',
      });
      return true;
    } catch (error) {
      console.warn(`[Elasticsearch Update Failed]: ${error.message}. Queuing to outbox.`);
      this.enqueueOutbox('update', id, partialUpdate);
      return false;
    }
  }

  /**
   * Remove or archive product from Elasticsearch
   */
  static async removeProductFromIndex(productId) {
    const client = getElasticClient();
    const id = productId.toString();
    const indexName = config.elasticsearch.index;

    if (!client) {
      this.enqueueOutbox('delete', id);
      return false;
    }

    try {
      await client.delete({
        index: indexName,
        id,
        refresh: 'wait_for',
      });
      return true;
    } catch (error) {
      // If doc already deleted (404), treat as success
      if (error.statusCode === 404 || error.meta?.statusCode === 404) {
        return true;
      }
      console.warn(`[Elasticsearch Delete Failed]: ${error.message}. Queuing to outbox.`);
      this.enqueueOutbox('delete', id);
      return false;
    }
  }

  /**
   * Queue action for asynchronous retry (Outbox Pattern)
   */
  static enqueueOutbox(action, productId, data = null) {
    this.outbox.push({
      action,
      productId,
      data,
      attempts: 0,
      timestamp: Date.now(),
    });
  }

  /**
   * Retry pending outbox operations
   */
  static async processOutbox() {
    if (this.isProcessingOutbox || this.outbox.length === 0) return;
    const client = getElasticClient();
    if (!client) return;

    this.isProcessingOutbox = true;
    const remaining = [];

    while (this.outbox.length > 0) {
      const item = this.outbox.shift();
      try {
        if (item.action === 'index') {
          await client.index({
            index: config.elasticsearch.index,
            id: item.productId,
            body: item.data,
          });
        } else if (item.action === 'update') {
          await client.update({
            index: config.elasticsearch.index,
            id: item.productId,
            body: { doc: item.data },
          });
        } else if (item.action === 'delete') {
          await client.delete({
            index: config.elasticsearch.index,
            id: item.productId,
          });
        }
      } catch (err) {
        item.attempts += 1;
        if (item.attempts < 5) {
          remaining.push(item);
        }
      }
    }

    this.outbox = remaining;
    this.isProcessingOutbox = false;
  }
}
