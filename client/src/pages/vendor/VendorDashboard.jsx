import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { vendorService, productService } from '../../services/api.js';
import { Store, Package, TrendingUp, Plus, Clock, Settings, AlertCircle, CheckCircle } from 'lucide-react';

export const VendorDashboard = () => {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [productsCount, setProductsCount] = useState(0);
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
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user has not created/applied for a store yet
  if (hasNoStore) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <Store className="w-10 h-10" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900">Set Up Your Vendor Store</h1>
          <p className="text-sm text-slate-500">
            You're signed in as a vendor. Please submit your store application to get approved and begin listing products.
          </p>
        </div>
        <div>
          <Link
            to="/vendor/apply"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition shadow"
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
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">Store Application Pending Review</h4>
              <p className="text-xs text-amber-700">
                Your store "<strong>{store?.name}</strong>" is currently awaiting admin approval. Product creation will unlock as soon as your store is verified.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider bg-amber-200/80 text-amber-800 px-3 py-1 rounded-full">
            Pending
          </span>
        </div>
      )}

      {isRejected && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-red-900">Store Application Rejected</h4>
            <p className="text-xs text-red-700">
              Reason: {store?.rejectionReason || 'Application did not meet marketplace requirements.'}
            </p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Vendor Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {store?.name || 'Your Store'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Store Slug: <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-xs">{store?.slug}</code> · Vendor Account: <strong className="text-slate-700">{user?.email}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/vendor/setup"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <Settings className="w-4 h-4" />
            <span>Store Settings</span>
          </Link>

          {isApproved && (
            <Link
              to="/vendor/products/new"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Link>
          )}
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
            <p className="text-base font-bold capitalize text-emerald-600">{store?.approvalStatus}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Products</span>
            <p className="text-xl font-bold text-slate-900">{productsCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Orders</span>
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

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Store Products</h2>
            <Link to="/vendor/products" className="text-xs font-semibold text-emerald-600 hover:underline">
              View All ({productsCount})
            </Link>
          </div>
          <p className="text-xs text-slate-500">
            Manage your pricing, update inventory stock levels, and upload S3 product photos.
          </p>
          <div className="pt-2">
            <Link
              to="/vendor/products"
              className="inline-block px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
            >
              Open Inventory Manager
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Store Profile & Branding</h2>
          <p className="text-xs text-slate-500">
            Customize your store banner, logo, customer contact details, and view your public marketplace URL.
          </p>
          <div className="pt-2">
            <Link
              to="/vendor/setup"
              className="inline-block px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
            >
              Edit Store Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
