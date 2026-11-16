import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService } from '../../services/api.js';
import {
  Search,
  Store,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Package,
  Loader2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Audio & Headphones',
  'Computers & Accessories',
  'Gaming Gear',
  'Mobile & Tablets',
  'Wearables',
  'Smart Home',
  'Fashion & Lifestyle',
];

export const ProductCatalogue = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [facets, setFacets] = useState({ categories: [], priceStats: null });
  const [searchSource, setSearchSource] = useState('elasticsearch');
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All Categories');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStockOnly') === 'true');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  const fetchProducts = async (pageToFetch = currentPage) => {
    setLoading(true);
    try {
      const params = {
        page: pageToFetch,
        limit: 12,
      };

      if (search.trim()) params.q = search.trim();
      if (selectedCategory && selectedCategory !== 'All Categories') params.category = selectedCategory;
      if (sortBy) params.sort = sortBy;
      if (minPrice !== '') params.minPrice = minPrice;
      if (maxPrice !== '') params.maxPrice = maxPrice;
      if (inStockOnly) params.inStockOnly = true;

      // Sync URL search params
      const urlParams = {};
      if (params.q) urlParams.q = params.q;
      if (params.category) urlParams.category = params.category;
      if (params.sort) urlParams.sort = params.sort;
      if (params.minPrice) urlParams.minPrice = params.minPrice;
      if (params.maxPrice) urlParams.maxPrice = params.maxPrice;
      if (params.inStockOnly) urlParams.inStockOnly = 'true';
      if (pageToFetch > 1) urlParams.page = pageToFetch;
      setSearchParams(urlParams, { replace: true });

      const res = await productService.getProducts(params);
      if (res.success && res.data) {
        setProducts(res.data.products || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
        if (res.data.facets) {
          setFacets(res.data.facets);
        }
        if (res.data.source) {
          setSearchSource(res.data.source);
        }
      }
    } catch (err) {
      console.error('Failed to load catalogue products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [selectedCategory, sortBy, inStockOnly, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1);
  };

  const handlePriceFilterApply = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1);
  };

  const handleClearAllFilters = () => {
    setSearch('');
    setSelectedCategory('All Categories');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSortBy('newest');
    setCurrentPage(1);
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters =
    search.trim() ||
    (selectedCategory && selectedCategory !== 'All Categories') ||
    minPrice !== '' ||
    maxPrice !== '' ||
    inStockOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-main tracking-tight">
              Marketplace Catalogue
            </h1>
            <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-pill text-[11px] font-semibold bg-surface-2 text-main border border-border">
              <Sparkles className="w-3 h-3 text-main" />
              <span>Elasticsearch Engine</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Full-text search, multi-faceted category filtering, price ranges, and multi-vendor storefronts.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, description, or seller..."
              className="w-full pl-9 pr-9 py-2 bg-surface text-main border border-border rounded-control text-sm placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-2.5 text-muted hover:text-main"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button type="submit" size="md">
            Search
          </Button>
        </form>
      </div>

      {/* Main Filter & Sort Controls Card */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Category Quick Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-pill text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-primary text-inverse shadow-xs'
                    : 'bg-surface-2 text-muted hover:text-main hover:bg-surface-3 border border-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-2 text-xs text-muted ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted" />
            <span className="font-semibold text-main">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-border rounded-control px-2.5 py-1.5 text-xs bg-surface text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest Listed</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </div>
        </div>

        {/* Secondary Filters Bar: Price Range & In-Stock Availability */}
        <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs">
          <form onSubmit={handlePriceFilterApply} className="flex items-center space-x-2 flex-wrap">
            <span className="font-semibold text-main">Price (₹):</span>
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min"
              className="w-20 px-2.5 py-1.5 bg-surface text-main border border-border rounded-control text-xs focus:ring-1 focus:ring-ring focus:border-primary focus:outline-none"
            />
            <span className="text-muted">–</span>
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max"
              className="w-20 px-2.5 py-1.5 bg-surface text-main border border-border rounded-control text-xs focus:ring-1 focus:ring-ring focus:border-primary focus:outline-none"
            />
            <Button type="submit" variant="secondary" size="sm">
              Apply
            </Button>
          </form>

          {/* Availability Checkbox */}
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center space-x-2 text-main cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="w-4 h-4 rounded-control border-border text-primary focus:ring-ring"
              />
              <span>In Stock Only</span>
            </label>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="text-main hover:text-muted font-semibold underline text-xs transition"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Results Header Count & Active Filter Pills */}
      <div className="flex items-center justify-between text-xs text-muted">
        <div>
          Showing <strong className="text-main">{products.length}</strong> of{' '}
          <strong className="text-main">{pagination.total}</strong> products
          {search && (
            <span>
              {' '}
              matching "<strong className="text-main">{search}</strong>"
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span>Source:</span>
          <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-control font-bold bg-surface-2 text-main border border-border">
            {searchSource}
          </span>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-main animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products match your criteria"
          description="Try adjusting your search keywords, broadening category selections, or clearing price limits."
          action={
            <Button onClick={handleClearAllFilters} size="sm">
              Clear Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product._id || product.id}
              to={`/product/${product._id || product.id}`}
              className="group bg-surface rounded-card border border-border overflow-hidden shadow-xs hover:shadow-md hover:border-border-strong transition flex flex-col"
            >
              {/* Product Thumbnail */}
              <div className="aspect-square bg-surface-2 overflow-hidden relative border-b border-border">
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted">
                    <Package className="w-12 h-12" />
                  </div>
                )}
                {product.stock <= 5 && product.stock > 0 && (
                  <div className="absolute top-2 right-2">
                    <StatusBadge status="low_stock" label={`Only ${product.stock} left`} />
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute top-2 right-2">
                    <StatusBadge status="out_of_stock" label="Out of Stock" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center space-x-1.5 text-xs text-muted mb-1">
                    <Store className="w-3.5 h-3.5 text-muted" />
                    <span className="font-medium text-main truncate">
                      {product.storeId?.name || product.storeName || 'Seller'}
                    </span>
                  </div>
                  <h3 className="font-bold text-main text-sm line-clamp-2 group-hover:text-muted transition">
                    {product.title}
                  </h3>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted uppercase tracking-wider block">Price</span>
                    <span className="text-lg font-extrabold text-main">
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-control bg-surface-2 text-main border border-border group-hover:bg-primary group-hover:text-inverse transition">
                    View
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={pagination.page <= 1}
            className="p-2 border border-border rounded-control bg-surface text-main hover:bg-surface-2 disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs text-main px-3 py-1 font-semibold">
            Page {pagination.page} of {pagination.pages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={pagination.page >= pagination.pages}
            className="p-2 border border-border rounded-control bg-surface text-main hover:bg-surface-2 disabled:opacity-40 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCatalogue;
