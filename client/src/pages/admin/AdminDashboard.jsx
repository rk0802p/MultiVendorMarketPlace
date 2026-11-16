import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { vendorService, adminService, couponService } from '../../services/api.js';
import {
  ShieldCheck,
  Users,
  Store,
  DollarSign,
  Activity,
  Check,
  X,
  AlertCircle,
  Tag,
  Plus,
  ShoppingBag,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [pendingStores, setPendingStores] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [error, setError] = useState('');

  // Coupon Creation Form State
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percentage',
    value: 10,
    minCartValue: 1000,
    maxDiscount: 500,
    expiry: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    usageLimit: 500,
  });
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [storeRes, analyticsRes, couponsRes] = await Promise.all([
        vendorService.getStores({ status: 'pending' }).catch(() => ({ success: false })),
        adminService.getAnalytics().catch(() => null),
        couponService.getAllCoupons().catch(() => ({ data: { coupons: [] } })),
      ]);

      if (storeRes.success && storeRes.data.stores) {
        setPendingStores(storeRes.data.stores);
      }
      if (analyticsRes && analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }
      if (couponsRes && couponsRes.data) {
        setCoupons(couponsRes.data.coupons || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleStatusUpdate = async (storeId, status, name) => {
    setError('');
    setActionMessage('');
    try {
      const res = await vendorService.updateStoreStatus(storeId, status);
      if (res.success) {
        setActionMessage(`Store "${name}" has been ${status}!`);
        fetchAdminData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update store status.');
    }
  };

  const handleToggleCoupon = async (couponId) => {
    try {
      const res = await couponService.toggleCoupon(couponId);
      if (res.success) {
        setActionMessage('Coupon status updated successfully.');
        fetchAdminData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle coupon status.');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setCreatingCoupon(true);
    setError('');
    try {
      const res = await couponService.createCoupon(couponForm);
      if (res.success) {
        setActionMessage(`Promo coupon "${couponForm.code}" created successfully!`);
        setShowCouponModal(false);
        setCouponForm({
          code: '',
          type: 'percentage',
          value: 10,
          minCartValue: 1000,
          maxDiscount: 500,
          expiry: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
          usageLimit: 500,
        });
        fetchAdminData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create coupon.');
    } finally {
      setCreatingCoupon(false);
    }
  };

  const metrics = analytics?.metrics || {
    grossSales: 0,
    platformCommissionRevenue: 0,
    vendorPayouts: 0,
    totalOrders: 0,
    activeVendors: 0,
    pendingVendorApplications: pendingStores.length,
    totalProducts: 0,
    totalCustomers: 0,
  };

  const topProducts = analytics?.topSellingProducts || [];
  const recentOrders = analytics?.recentOrders || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <Card className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-main bg-surface-2 px-2.5 py-1 rounded-pill border border-border">
            Platform Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-main mt-2">
            Marketplace Control Center
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Superuser: <strong className="text-main">{user?.email}</strong>. Global commission management, vendor store approvals, and marketplace analytics.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-surface-2 text-main px-3.5 py-1.5 rounded-control border border-border text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-main" />
          <span>Full Admin Access Granted</span>
        </div>
      </Card>

      {actionMessage && (
        <div className="p-3.5 bg-surface-2 border border-border-strong rounded-control flex items-center space-x-2 text-xs text-main">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-surface-2 border border-border-strong rounded-control flex items-center space-x-2 text-xs text-main">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Admin KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Gross Platform GMV"
          value={`₹${metrics.grossSales?.toLocaleString('en-IN')}`}
        />
        <StatCard
          icon={Activity}
          label="Platform Commission (10%)"
          value={`₹${metrics.platformCommissionRevenue?.toLocaleString('en-IN')}`}
        />
        <StatCard
          icon={Store}
          label="Vendor Net Payouts"
          value={`₹${metrics.vendorPayouts?.toLocaleString('en-IN')}`}
        />
        <StatCard
          icon={Users}
          label="Pending Approvals"
          value={pendingStores.length}
        />
      </div>

      {/* Vendor Store Applications & Promotional Coupons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vendor Applications Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-main">Vendor Store Applications</h2>
            <span className="text-xs text-muted font-medium">{pendingStores.length} Pending</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-muted flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-main" />
              <span>Loading applications...</span>
            </div>
          ) : pendingStores.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted border-2 border-dashed border-border rounded-control">
              No pending vendor applications at this time.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingStores.map((store) => (
                <div key={store._id} className="p-4 bg-surface-2 rounded-control border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-main text-sm">{store.name}</h4>
                    <p className="text-xs text-muted">
                      Slug: {store.slug} · Owner: {store.ownerId?.email || 'N/A'}
                    </p>
                    {store.description && (
                      <p className="text-xs text-muted mt-1 line-clamp-1">{store.description}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(store._id, 'approved', store.name)}
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      <span>Approve</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStatusUpdate(store._id, 'rejected', store.name)}
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      <span>Reject</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Coupons Management Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tag className="w-5 h-5 text-main" />
              <h2 className="text-lg font-bold text-main">Promo Coupons</h2>
            </div>
            <Button
              size="sm"
              onClick={() => setShowCouponModal(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Create Coupon</span>
            </Button>
          </div>

          {coupons.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted border border-dashed border-border rounded-control">
              No promo coupons created yet. Click above to create one.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {coupons.map((c) => (
                <div
                  key={c._id}
                  className="p-3 bg-surface-2 rounded-control border border-border flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-main">{c.code}</span>
                      <span className="bg-surface text-main border border-border px-1.5 py-0.5 rounded text-[10px]">
                        {c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted mt-0.5">
                      Min spend: ₹{c.minCartValue} · Used: {c.usageCount} time(s)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleCoupon(c._id)}
                    className={`px-2.5 py-1 rounded-control text-[11px] font-bold transition border ${
                      c.isActive
                        ? 'bg-surface text-main border-border-strong'
                        : 'bg-surface-2 text-muted border-border'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Top Products & Recent Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Products */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-main" />
            <h2 className="text-lg font-bold text-main">Top Selling Products</h2>
          </div>

          {topProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted border border-dashed border-border rounded-control">
              Sales performance metrics will appear as customers place orders.
            </div>
          ) : (
            <div className="divide-y divide-border text-xs">
              {topProducts.map((p, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-main">{p.title}</p>
                    <p className="text-muted">{p.unitsSold} units purchased</p>
                  </div>
                  <span className="font-bold text-main">
                    ₹{p.revenue?.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Platform Orders */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-main" />
            <h2 className="text-lg font-bold text-main">Recent Platform Orders</h2>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted border border-dashed border-border rounded-control">
              Recent order activity will be listed here.
            </div>
          ) : (
            <div className="divide-y divide-border text-xs">
              {recentOrders.map((o) => (
                <div key={o.orderId} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-main">{o.orderNumber}</span>
                    <p className="text-muted">
                      {o.customerName} · {o.itemCount} item(s) · {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-main">₹{o.grandTotal?.toLocaleString('en-IN')}</span>
                    <div className="mt-0.5">
                      <StatusBadge status={o.paymentStatus} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Modal for Coupon Creation */}
      <Modal
        isOpen={showCouponModal}
        onClose={() => setShowCouponModal(false)}
        title="Create New Promo Coupon"
      >
        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-muted font-semibold mb-1">Coupon Code</label>
              <input
                type="text"
                required
                value={couponForm.code}
                onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                placeholder="e.g. FESTIVE20"
                className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-control text-main uppercase focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-muted font-semibold mb-1">Type</label>
              <select
                value={couponForm.type}
                onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-control text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-muted font-semibold mb-1">
                Value ({couponForm.type === 'percentage' ? '%' : '₹'})
              </label>
              <input
                type="number"
                min="1"
                required
                value={couponForm.value}
                onChange={(e) => setCouponForm({ ...couponForm, value: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-control text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-muted font-semibold mb-1">Min Spend (₹)</label>
              <input
                type="number"
                min="0"
                value={couponForm.minCartValue}
                onChange={(e) => setCouponForm({ ...couponForm, minCartValue: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-control text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-muted font-semibold mb-1">Expiration Date</label>
              <input
                type="date"
                required
                value={couponForm.expiry}
                onChange={(e) => setCouponForm({ ...couponForm, expiry: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-control text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowCouponModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={creatingCoupon}
              loading={creatingCoupon}
            >
              Save Coupon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
