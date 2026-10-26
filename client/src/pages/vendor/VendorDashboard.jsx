import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Store, Package, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export const VendorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Vendor Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Store Management — {user?.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Vendor Account: <strong className="text-slate-700">{user?.email}</strong>. Manage your store catalog, S3 media, and order fulfillments.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-lg border border-emerald-200 text-xs font-semibold">
          <CheckCircle className="w-4 h-4" />
          <span>Role Verified: Vendor</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Store Status</span>
            <p className="text-base font-bold text-emerald-600">Active / Pending</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Published Products</span>
            <p className="text-xl font-bold text-slate-900">0</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Fulfillment</span>
            <p className="text-xl font-bold text-slate-900">0</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Sales</span>
            <p className="text-xl font-bold text-slate-900">₹0.00</p>
          </div>
        </div>
      </div>

      {/* Product Management Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Your Store Listings</h2>
          <span className="text-xs font-medium text-slate-500">Step 3 will activate product creation</span>
        </div>
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <Store className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-600">Ready for Product Management</p>
          <p className="text-xs text-slate-400 mt-1">
            Vendor role authenticated. You will be able to add products, upload media to AWS S3, and fulfill orders in the upcoming step.
          </p>
        </div>
      </div>
    </div>
  );
};
