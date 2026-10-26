import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShoppingBag, Package, Heart, CreditCard } from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Logged in as <strong className="text-slate-700">{user?.email}</strong>. Manage your orders and shopping cart.
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Orders</span>
            <p className="text-xl font-bold text-slate-900">0</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cart Items</span>
            <p className="text-xl font-bold text-slate-900">0</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Wishlist</span>
            <p className="text-xl font-bold text-slate-900">0</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saved Cards</span>
            <p className="text-xl font-bold text-slate-900">0</p>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Recent Purchase Orders</h2>
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-600">No orders placed yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Browse our multi-vendor catalog to purchase products from multiple sellers in a single checkout.
          </p>
        </div>
      </div>
    </div>
  );
};
