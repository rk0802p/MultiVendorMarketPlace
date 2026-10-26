import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShoppingBag, Store, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Home = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-14 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border border-blue-400/30">
            <span>TechMart Multi-Vendor Platform</span>
            <span>•</span>
            <span>FS-01 Project</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            One Marketplace. <br />
            <span className="text-blue-400">Multiple Independent Vendors.</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Customers purchase from multiple stores in a single cart. Vendors independently manage products and fulfillment. The platform automatically accounts for a 10% commission on every sale.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition shadow-lg shadow-blue-600/30 flex items-center space-x-2"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold text-sm transition backdrop-blur-sm"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-slate-300">
                  Signed in as <strong className="text-white capitalize">{user.role}</strong> ({user.name})
                </span>
                {user.role === 'customer' && (
                  <Link
                    to="/customer/dashboard"
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 transition"
                  >
                    Go to Customer Portal
                  </Link>
                )}
                {user.role === 'vendor' && (
                  <Link
                    to="/vendor/dashboard"
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-500 transition"
                  >
                    Go to Vendor Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-500 transition"
                  >
                    Go to Admin Dashboard
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3 Roles Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-blue-300 transition">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Customer Role</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Browse multiple vendors, search via Elasticsearch, persist items in Redis cart, and checkout in a single payment order.
          </p>
          <ul className="space-y-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span>Multi-vendor unified shopping cart</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span>Live order tracking & invoices</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-emerald-300 transition">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Vendor Role</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Register store, manage product inventory with direct S3 uploads, and advance fulfillment exclusively for own line items.
          </p>
          <ul className="space-y-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Self-managed product catalog & pricing</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Isolated fulfillment lifecycle (placed → delivered)</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-purple-300 transition">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Admin Role</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Review and approve vendor applications, monitor marketplace gross sales, manage promo coupons, and audit commission splits.
          </p>
          <ul className="space-y-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span>10% Platform commission ledger</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span>Vendor approvals & platform analytics</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
