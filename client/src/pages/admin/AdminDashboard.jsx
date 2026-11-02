import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { vendorService, paymentService, adminService, couponService } from '../../services/api.js';
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
  Package,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';

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
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            Platform Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Marketplace Control Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Superuser: <strong className="text-slate-700">{user?.email}</strong>. Global commission management, vendor store approvals, and marketplace analytics.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-purple-50 text-purple-700 px-3.5 py-1.5 rounded-lg border border-purple-200 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Full Admin Access Granted</span>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-2 text-sm text-emerald-700">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Admin KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Platform GMV</span>
            <p className="text-xl font-bold text-slate-900">₹{metrics.grossSales?.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Platform Commission (10%)</span>
            <p className="text-xl font-bold text-slate-900">₹{metrics.platformCommissionRevenue?.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vendor Net Payouts</span>
            <p className="text-xl font-bold text-slate-900">₹{metrics.vendorPayouts?.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Approvals</span>
            <p className="text-xl font-bold text-slate-900">{pendingStores.length}</p>
          </div>
        </div>
      </div>

      {/* Vendor Store Applications & Promotional Coupons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vendor Applications Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Vendor Store Applications</h2>
            <span className="text-xs text-slate-400">{pendingStores.length} Pending</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">Loading applications...</div>
          ) : pendingStores.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500 border-2 border-dashed border-slate-100 rounded-xl">
              No pending vendor applications at this time.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingStores.map((store) => (
                <div key={store._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{store.name}</h4>
                    <p className="text-xs text-slate-500">
                      Slug: {store.slug} · Owner: {store.ownerId?.email || 'N/A'}
                    </p>
                    {store.description && (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">{store.description}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(store._id, 'approved', store.name)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-sm transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(store._id, 'rejected', store.name)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coupons Management Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tag className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Promo Coupons</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowCouponModal(!showCouponModal)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Coupon</span>
            </button>
          </div>

          {/* Coupon Form Modal / Inline */}
          {showCouponModal && (
            <form onSubmit={handleCreateCoupon} className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800">New Coupon Setup</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. FESTIVE20"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Type</label>
                  <select
                    value={couponForm.type}
                    onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Value ({couponForm.type === 'percentage' ? '%' : '₹'})
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={couponForm.value}
                    onChange={(e) => setCouponForm({ ...couponForm, value: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Min Spend (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={couponForm.minCartValue}
                    onChange={(e) => setCouponForm({ ...couponForm, minCartValue: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-600 font-semibold mb-1">Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={couponForm.expiry}
                    onChange={(e) => setCouponForm({ ...couponForm, expiry: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCoupon}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm disabled:opacity-50"
                >
                  {creatingCoupon ? 'Creating...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          )}

          {coupons.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No promo coupons created yet. Click above to create one.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {coupons.map((c) => (
                <div
                  key={c._id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-blue-700">{c.code}</span>
                      <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                        {c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Min spend: ₹{c.minCartValue} · Used: {c.usageCount} time(s)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleCoupon(c._id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      c.isActive
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Products & Recent Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Top Selling Products</h2>
          </div>

          {topProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              Sales performance metrics will appear as customers place orders.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {topProducts.map((p, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{p.title}</p>
                    <p className="text-slate-400">{p.unitsSold} units purchased</p>
                  </div>
                  <span className="font-bold text-slate-900">
                    ₹{p.revenue?.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Platform Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Recent Platform Orders</h2>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              Recent order activity will be listed here.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {recentOrders.map((o) => (
                <div key={o.orderId} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-blue-600">{o.orderNumber}</span>
                    <p className="text-slate-400">
                      {o.customerName} · {o.itemCount} item(s) · {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">₹{o.grandTotal?.toLocaleString('en-IN')}</span>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">
                      {o.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
