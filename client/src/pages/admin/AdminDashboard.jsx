import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { vendorService, paymentService } from '../../services/api.js';
import { ShieldCheck, Users, Store, DollarSign, Activity, Check, X, AlertCircle, ArrowUpRight } from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [pendingStores, setPendingStores] = useState([]);
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [storeRes, ledgerRes] = await Promise.all([
        vendorService.getStores({ status: 'pending' }),
        paymentService.getCommissionLedger().catch(() => null),
      ]);

      if (storeRes.success && storeRes.data.stores) {
        setPendingStores(storeRes.data.stores);
      }
      if (ledgerRes && ledgerRes.success && ledgerRes.data) {
        setLedger(ledgerRes.data);
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

  const metrics = ledger?.metrics || {
    totalGtv: 0,
    totalCommissionEarned: 0,
    totalVendorPayouts: 0,
    capturedPaymentsCount: 0,
    platformCommissionRate: 10,
  };

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
            Superuser: <strong className="text-slate-700">{user?.email}</strong>. Global commission management, vendor store approvals, and financial ledger monitoring.
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
            <p className="text-xl font-bold text-slate-900">₹{metrics.totalGtv.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Commission ({metrics.platformCommissionRate}%)</span>
            <p className="text-xl font-bold text-slate-900">₹{metrics.totalCommissionEarned.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vendor Net Payouts</span>
            <p className="text-xl font-bold text-slate-900">₹{metrics.totalVendorPayouts.toLocaleString('en-IN')}</p>
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

      {/* Admin Actions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Platform Commission Rules & Payouts</h2>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-sm text-slate-600">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span>Standard Platform Commission:</span>
              <strong className="text-slate-900 font-bold">{metrics.platformCommissionRate}.00%</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span>Payout Accounting:</span>
              <strong className="text-slate-900 font-bold">Automated at Checkout</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span>Captured Transactions:</span>
              <strong className="text-slate-900 font-bold">{metrics.capturedPaymentsCount} Payments</strong>
            </div>
            <div className="flex justify-between items-center py-1">
              <span>Payment Gateway:</span>
              <strong className="text-slate-900 font-bold">Razorpay Route (Test Mode)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
