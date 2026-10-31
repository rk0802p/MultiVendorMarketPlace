import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { ProductSearchService } from '../src/modules/products/product.search.service.js';
import { ProductService } from '../src/modules/products/product.service.js';
import { Product } from '../src/models/Product.js';
import * as elasticConfig from '../src/config/elasticsearch.js';

describe('Step 4: Elasticsearch Search, Filters & Sorting Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Elasticsearch Query Builder Logic', () => {
    it('should build keyword multi_match query boosting title and description', () => {
      const query = ProductSearchService.buildSearchQuery({
        q: 'wireless headphones',
        page: 1,
        limit: 10,
      });

      expect(query.query.bool.must[0].multi_match).toBeDefined();
      expect(query.query.bool.must[0].multi_match.query).toBe('wireless headphones');
      expect(query.query.bool.must[0].multi_match.fields).toContain('title^3');
      expect(query.query.bool.must[0].multi_match.fields).toContain('description');
    });

    it('should strictly exclude inactive/archived products via status: active filter', () => {
      const query = ProductSearchService.buildSearchQuery({});
      const statusFilter = query.query.bool.filter.find((f) => f.term && f.term.status === 'active');
      expect(statusFilter).toBeDefined();
    });

    it('should apply category, storeId, and price range filters correctly', () => {
      const query = ProductSearchService.buildSearchQuery({
        category: 'Electronics',
        storeId: 'store_123',
        minPrice: 1000,
        maxPrice: 5000,
      });

      const filters = query.query.bool.filter;
      const categoryFilter = filters.find((f) => f.term && f.term.category === 'Electronics');
      const storeFilter = filters.find((f) => f.term && f.term.storeId === 'store_123');
      const priceFilter = filters.find((f) => f.range && f.range.price);

      expect(categoryFilter).toBeDefined();
      expect(storeFilter).toBeDefined();
      expect(priceFilter.range.price.gte).toBe(1000);
      expect(priceFilter.range.price.lte).toBe(5000);
    });

    it('should apply availability filter when inStockOnly is true', () => {
      const query = ProductSearchService.buildSearchQuery({ inStockOnly: true });
      const stockFilter = query.query.bool.filter.find((f) => f.range && f.range.stock);
      expect(stockFilter).toBeDefined();
      expect(stockFilter.range.stock.gt).toBe(0);
    });

    it('should handle sorting options correctly (price_asc, price_desc, newest, relevance)', () => {
      const sortAsc = ProductSearchService.buildSearchQuery({ sort: 'price_asc' });
      expect(sortAsc.sort[0].price.order).toBe('asc');

      const sortDesc = ProductSearchService.buildSearchQuery({ sort: 'price_desc' });
      expect(sortDesc.sort[0].price.order).toBe('desc');

      const sortNewest = ProductSearchService.buildSearchQuery({ sort: 'newest' });
      expect(sortNewest.sort[0].createdAt.order).toBe('desc');

      const sortRelevance = ProductSearchService.buildSearchQuery({ q: 'mouse', sort: 'relevance' });
      expect(sortRelevance.sort[0]._score.order).toBe('desc');
    });

    it('should calculate pagination from and size offsets correctly', () => {
      const page2 = ProductSearchService.buildSearchQuery({ page: 2, limit: 12 });
      expect(page2.from).toBe(12);
      expect(page2.size).toBe(12);

      const page3 = ProductSearchService.buildSearchQuery({ page: 3, limit: 10 });
      expect(page3.from).toBe(20);
      expect(page3.size).toBe(10);
    });
  });

  describe('Document Formatting and Index Synchronization', () => {
    it('should format product and store details into Elasticsearch document', () => {
      const mockProduct = {
        _id: 'prod_01',
        title: 'Gaming Keyboard',
        slug: 'gaming-keyboard',
        description: 'Mechanical keyboard with blue switches',
        category: 'Gaming Gear',
        price: 2499,
        stock: 15,
        status: 'active',
        storeId: 'store_99',
        vendorId: 'vendor_88',
        createdAt: new Date('2026-10-26'),
      };

      const doc = ProductSearchService.formatDocument(mockProduct, { name: 'Apex Gear', slug: 'apex-gear' });
      expect(doc.id).toBe('prod_01');
      expect(doc.title).toBe('Gaming Keyboard');
      expect(doc.price).toBe(2499);
      expect(doc.storeName).toBe('Apex Gear');
      expect(doc.status).toBe('active');
    });

    it('should enqueue to outbox if Elasticsearch is unreachable during indexing', async () => {
      vi.spyOn(elasticConfig, 'getElasticClient').mockReturnValue(null);
      ProductSearchService.outbox = [];

      const result = await ProductSearchService.indexProduct({
        id: 'prod_fail',
        title: 'Test',
        category: 'Test',
        price: 100,
        stock: 5,
      });

      expect(result).toBe(false);
      expect(ProductSearchService.outbox.length).toBe(1);
      expect(ProductSearchService.outbox[0].action).toBe('index');
      expect(ProductSearchService.outbox[0].productId).toBe('prod_fail');
    });

    it('should successfully index product when Elasticsearch client is connected', async () => {
      const mockEsClient = {
        index: vi.fn().mockResolvedValue({ result: 'created' }),
      };
      vi.spyOn(elasticConfig, 'getElasticClient').mockReturnValue(mockEsClient);

      const result = await ProductSearchService.indexProduct({
        id: 'prod_ok',
        title: 'USB-C Cable',
        description: 'Fast charging',
        category: 'Electronics',
        price: 499,
        stock: 100,
      });

      expect(result).toBe(true);
      expect(mockEsClient.index).toHaveBeenCalled();
    });

    it('should remove product from index when archived or deleted', async () => {
      const mockEsClient = {
        delete: vi.fn().mockResolvedValue({ result: 'deleted' }),
      };
      vi.spyOn(elasticConfig, 'getElasticClient').mockReturnValue(mockEsClient);

      const result = await ProductSearchService.removeProductFromIndex('prod_to_remove');
      expect(result).toBe(true);
      expect(mockEsClient.delete).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'prod_to_remove' })
      );
    });
  });

  describe('Search Execution and Fallback Mechanism', () => {
    it('should execute search query and return formatted results and facets from Elasticsearch', async () => {
      const mockEsResponse = {
        hits: {
          total: { value: 1 },
          hits: [
            {
              _id: 'prod_es_1',
              _score: 2.5,
              _source: {
                id: 'prod_es_1',
                title: 'Noise Cancelling Headphones',
                slug: 'noise-cancelling-headphones',
                description: 'Over-ear headphones with ANC',
                category: 'Audio & Headphones',
                price: 4999,
                stock: 25,
                status: 'active',
                storeId: 'store_audio',
                storeName: 'Audio Haven',
                storeSlug: 'audio-haven',
                createdAt: new Date().toISOString(),
              },
            },
          ],
        },
        aggregations: {
          categories: {
            buckets: [{ key: 'Audio & Headphones', doc_count: 1 }],
          },
          price_stats: { min: 4999, max: 4999, avg: 4999, count: 1 },
        },
      };

      const mockEsClient = {
        search: vi.fn().mockResolvedValue(mockEsResponse),
      };
      vi.spyOn(elasticConfig, 'getElasticClient').mockReturnValue(mockEsClient);

      const result = await ProductSearchService.search({
        q: 'headphones',
        category: 'Audio & Headphones',
        page: 1,
        limit: 12,
      });

      expect(result).toBeDefined();
      expect(result.source).toBe('elasticsearch');
      expect(result.products.length).toBe(1);
      expect(result.products[0].title).toBe('Noise Cancelling Headphones');
      expect(result.facets.categories.length).toBe(1);
      expect(result.pagination.total).toBe(1);
    });

    it('GET /api/products should serve search results via Express endpoint', async () => {
      vi.spyOn(ProductSearchService, 'search').mockResolvedValueOnce({
        products: [
          {
            _id: 'es_prod_1',
            title: 'Wireless Headphones',
            category: 'Electronics',
            price: 2999,
            stock: 10,
            status: 'active',
            storeId: { name: 'Tech Store' },
          },
        ],
        pagination: { page: 1, limit: 12, total: 1, pages: 1 },
        facets: { categories: [{ key: 'Electronics', doc_count: 1 }], priceStats: { min: 2999, max: 2999 } },
        source: 'elasticsearch',
      });

      const res = await request(app)
        .get('/api/products')
        .query({
          q: 'wireless headphones',
          category: 'Electronics',
          minPrice: 1000,
          maxPrice: 5000,
          sort: 'price_asc',
          page: 1,
          limit: 12,
          inStockOnly: 'true',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBe(1);
      expect(res.body.data.source).toBe('elasticsearch');
      expect(res.body.data.pagination.total).toBe(1);
    });

    it('GET /api/products should fallback to DB search when Elasticsearch returns null', async () => {
      vi.spyOn(ProductSearchService, 'search').mockResolvedValueOnce(null);

      const mockQueryChain = {
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            _id: 'db_prod_1',
            title: 'Mechanical Keyboard',
            price: 1999,
            stock: 10,
            status: 'active',
            storeId: { name: 'Key Chron' },
          },
        ]),
      };
      vi.spyOn(Product, 'find').mockReturnValue(mockQueryChain);
      vi.spyOn(Product, 'countDocuments').mockResolvedValue(1);

      const res = await request(app)
        .get('/api/products')
        .query({ q: 'keyboard', page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.source).toBe('mongodb_fallback');
      expect(res.body.data.products.length).toBe(1);
      expect(res.body.data.products[0].title).toBe('Mechanical Keyboard');
    });
  });
});
