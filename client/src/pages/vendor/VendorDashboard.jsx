import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { vendorService, productService, orderService } from '../../services/api.js';
import {
  Store,
  Package,
  TrendingUp,
  Plus,
  Clock,
  Settings,
  AlertCircle,
  Truck,
  Loader2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';

export const VendorDashboard = () => {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [productsCount, setProductsCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [grossSales, setGrossSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasNoStore, setHasNoStore] = useState(false);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const storeRes = await vendorService.getMyStore();
        if (storeRes.success && storeRes.data.store) {
          setStore(storeRes.data.store);
          setHasNoStore(false);

          // Fetch products
          const prodRes = await productService.getMyProducts();
          if (prodRes.success && prodRes.data.products) {
            setProductsCount(prodRes.data.products.length);
          }

          // Fetch vendor order items
          const orderRes = await orderService.getVendorOrderItems();
          if (orderRes.success && orderRes.data.items) {
            const items = orderRes.data.items;
            const pending = items.filter((r) => ['placed', 'packed'].includes(r.item.fulfillmentStatus)).length;
            setPendingOrdersCount(pending);
            const totalSales = items.reduce((sum, r) => sum + (r.item.itemSubtotal || 0), 0);
            setGrossSales(totalSales);
          }
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setHasNoStore(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-main animate-spin" />
      </div>
    );
  }

  // If user has not created/applied for a store yet
  if (hasNoStore) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-card bg-surface-2 text-main border border-border flex items-center justify-center mx-auto shadow-xs">
          <Store className="w-10 h-10" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h1 className="text-2xl font-extrabold text-main">Set Up Your Vendor Store</h1>
          <p className="text-xs sm:text-sm text-muted">
            You're signed in as a vendor. Please submit your store application to get approved and begin listing products.
          </p>
        </div>
        <div>
          <Link
            to="/vendor/apply"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-inverse hover:bg-primary-hover rounded-control text-sm font-semibold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for Storefront</span>
          </Link>
        </div>
      </div>
    );
  }

  const isApproved = store?.approvalStatus === 'approved';
  const isPending = store?.approvalStatus === 'pending';
  const isRejected = store?.approvalStatus === 'rejected';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Approval Status Banner */}
      {isPending && (
        <div className="p-4 bg-surface-2 border border-border-strong rounded-control flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-main flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-main">Store Application Pending Review</h4>
              <p className="text-xs text-muted">
                Your store "<strong>{store?.name}</strong>" is currently awaiting admin approval. Product creation will unlock as soon as your store is verified.
              </p>
            </div>
          </div>
          <StatusBadge status="pending" />
        </div>
      )}

      {isRejected && (
        <div className="p-4 bg-surface-2 border border-border-strong rounded-control flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-main flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-main">Store Application Rejected</h4>
            <p className="text-xs text-muted">
              Reason: {store?.rejectionReason || 'Does not meet marketplace onboarding requirements.'} Please update your application or contact support.
            </p>
          </div>
        </div>
      )}

      {/* Header Info */}
      <Card className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-main">{store?.name}</h1>
            <StatusBadge status={store?.approvalStatus} />
          </div>
          <p className="text-xs text-muted mt-1">
            Store Slug: <code className="bg-surface-2 text-main border border-border px-1.5 py-0.5 rounded text-xs">{store?.slug}</code> · Vendor Account: <strong className="text-main">{user?.email}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/vendor/setup"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 border border-border hover:bg-surface-2 text-main rounded-control text-xs font-semibold transition"
          >
            <Settings className="w-4 h-4" />
            <span>Store Settings</span>
          </Link>

          {isApproved && (
            <Link
              to="/vendor/products/new"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary text-inverse hover:bg-primary-hover rounded-control text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Link>
          )}
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Store}
          label="Store Status"
          value={<StatusBadge status={store?.approvalStatus} />}
        />
        <StatCard
          to="/vendor/products"
          icon={Package}
          label="Active Products"
          value={productsCount}
        />
        <StatCard
          to="/vendor/orders"
          icon={Clock}
          label="Pending Orders"
          value={pendingOrdersCount}
        />
        <StatCard
          icon={TrendingUp}
          label="Gross Sales"
          value={`₹${grossSales.toLocaleString('en-IN')}`}
        />
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-main">Store Products</h2>
            <Link to="/vendor/products" className="text-xs font-semibold text-main underline hover:text-muted">
              View ({productsCount})
            </Link>
          </div>
          <p className="text-xs text-muted">
            Manage your pricing, update inventory stock levels, and upload S3 product photos.
          </p>
          <div className="pt-2">
            <Link
              to="/vendor/products"
              className="inline-block px-4 py-2 bg-surface-2 hover:bg-surface-3 text-main rounded-control text-xs font-semibold border border-border transition"
            >
              Open Inventory Manager
            </Link>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-main">Order Fulfillment</h2>
            <Link to="/vendor/orders" className="text-xs font-semibold text-main underline hover:text-muted">
              Orders ({pendingOrdersCount} pending)
            </Link>
          </div>
          <p className="text-xs text-muted">
            Package items, assign carrier tracking numbers, and fulfill orders containing your products.
          </p>
          <div className="pt-2">
            <Link
              to="/vendor/orders"
              className="inline-block px-4 py-2 bg-surface-2 hover:bg-surface-3 text-main rounded-control text-xs font-semibold border border-border transition"
            >
              Fulfill Customer Orders
            </Link>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-main">Store Profile & Branding</h2>
          <p className="text-xs text-muted">
            Customize your store banner, logo, customer contact details, and view your public marketplace URL.
          </p>
          <div className="pt-2">
            <Link
              to="/vendor/setup"
              className="inline-block px-4 py-2 bg-surface-2 hover:bg-surface-3 text-main rounded-control text-xs font-semibold border border-border transition"
            >
              Edit Store Profile
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboard;
