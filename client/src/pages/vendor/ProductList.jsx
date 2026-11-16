import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/api.js';
import { Plus, Edit, Archive, Package, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/Table.jsx';

export const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await productService.getMyProducts();
      if (res.success && res.data.products) {
        setProducts(res.data.products);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load store products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleArchive = async (id, title) => {
    if (window.confirm(`Are you sure you want to archive "${title}"? It will no longer appear in the customer catalogue.`)) {
      try {
        await productService.archiveProduct(id);
        fetchProducts();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to archive product.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-main animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-main bg-surface-2 px-2.5 py-1 rounded-pill border border-border">
            Inventory Management
          </span>
          <h1 className="text-2xl font-bold text-main mt-2">Store Product Listings</h1>
          <p className="text-xs sm:text-sm text-muted">
            Manage your pricing, stock inventory, and listing status across the marketplace.
          </p>
        </div>

        <Link
          to="/vendor/products/new"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary text-inverse hover:bg-primary-hover rounded-control text-sm font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {error && (
        <div className="p-3.5 bg-surface-2 border border-border-strong rounded-control flex items-center space-x-2 text-xs text-main">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products listed yet"
          description="Add your first product to start selling on TechMart. Once published, items appear immediately in the customer catalogue."
          action={
            <Link
              to="/vendor/products/new"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary text-inverse hover:bg-primary-hover rounded-control text-xs font-semibold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Product</span>
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-control bg-surface-2 overflow-hidden border border-border flex-shrink-0 flex items-center justify-center">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-muted" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-main line-clamp-1">{product.title}</div>
                        <div className="text-xs text-muted">Slug: {product.slug}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted">{product.category}</TableCell>
                  <TableCell className="font-semibold text-main">
                    ₹{product.price.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={product.stock > 10 ? 'in_stock' : product.stock > 0 ? 'low_stock' : 'out_of_stock'}
                      label={`${product.stock} units`}
                    />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={product.status} />
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Link
                      to={`/vendor/products/edit/${product._id}`}
                      className="p-1.5 text-muted hover:text-main hover:bg-surface-2 rounded-control inline-block transition"
                      title="Edit Product"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleArchive(product._id, product.title)}
                      className="p-1.5 text-muted hover:text-main hover:bg-surface-2 rounded-control inline-block transition"
                      title="Archive Product"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default ProductList;
