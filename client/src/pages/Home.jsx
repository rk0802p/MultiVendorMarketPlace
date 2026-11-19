import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShoppingBag, Store, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';

export const Home = () => {
  const { user, isAuthenticated, loading } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Monochromatic Hero Section */}
      <div className="bg-gradient-to-br from-mono-900 via-mono-950 to-mono-900 text-white rounded-card p-8 sm:p-14 shadow-lg border border-mono-800/80 dark:border-mono-700/60 relative overflow-hidden">
        {/* Subtle geometric background overlay for tactile depth */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/10 text-mono-50 px-3.5 py-1.5 rounded-pill text-xs font-semibold backdrop-blur-sm border border-white/20">
            <span>TechMart Multi-Vendor Platform</span>
            <span className="opacity-60">•</span>
            <span>FS-01 Project</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
            One Marketplace. <br />
            <span className="text-mono-300">Multiple Independent Vendors.</span>
          </h1>

          <p className="text-mono-300 text-base sm:text-lg leading-relaxed">
            Customers purchase from multiple stores in a single cart. Vendors independently manage products and fulfillment. The platform automatically accounts for a 10% commission on every sale.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            {loading && !user ? (
              <div className="w-48 h-12 bg-white/10 animate-pulse rounded-control" />
            ) : !isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="px-6 py-3 bg-white text-mono-900 hover:bg-mono-100 rounded-control font-semibold text-sm transition shadow-xs flex items-center space-x-2"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-control font-semibold text-sm transition backdrop-blur-sm"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-mono-300">
                  Signed in as <strong className="text-white capitalize">{user.role}</strong> ({user.name})
                </span>
                {user.role === 'customer' && (
                  <Link
                    to="/customer/dashboard"
                    className="px-5 py-2.5 bg-white text-mono-900 hover:bg-mono-100 rounded-control text-sm font-semibold transition"
                  >
                    Go to Customer Portal
                  </Link>
                )}
                {user.role === 'vendor' && (
                  <Link
                    to="/vendor/dashboard"
                    className="px-5 py-2.5 bg-white text-mono-900 hover:bg-mono-100 rounded-control text-sm font-semibold transition"
                  >
                    Go to Vendor Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="px-5 py-2.5 bg-white text-mono-900 hover:bg-mono-100 rounded-control text-sm font-semibold transition"
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
        <Card className="p-6 space-y-4 hover:border-border-strong transition">
          <div className="w-12 h-12 rounded-control bg-surface-2 text-main border border-border flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-main">Customer Role</h3>
          <p className="text-sm text-muted leading-relaxed">
            Browse multiple vendors, search via Elasticsearch, persist items in Redis cart, and checkout in a single payment order.
          </p>
          <ul className="space-y-2 text-xs text-muted pt-2 border-t border-border">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-main flex-shrink-0" />
              <span>Multi-vendor unified shopping cart</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-main flex-shrink-0" />
              <span>Live order tracking & invoices</span>
            </li>
          </ul>
        </Card>

        <Card className="p-6 space-y-4 hover:border-border-strong transition">
          <div className="w-12 h-12 rounded-control bg-surface-2 text-main border border-border flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-main">Vendor Role</h3>
          <p className="text-sm text-muted leading-relaxed">
            Register store, manage product inventory with direct S3 uploads, and advance fulfillment exclusively for own line items.
          </p>
          <ul className="space-y-2 text-xs text-muted pt-2 border-t border-border">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-main flex-shrink-0" />
              <span>Self-managed product catalog & pricing</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-main flex-shrink-0" />
              <span>Isolated fulfillment lifecycle (placed → delivered)</span>
            </li>
          </ul>
        </Card>

        <Card className="p-6 space-y-4 hover:border-border-strong transition">
          <div className="w-12 h-12 rounded-control bg-surface-2 text-main border border-border flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-main">Admin Role</h3>
          <p className="text-sm text-muted leading-relaxed">
            Review and approve vendor applications, monitor marketplace gross sales, manage promo coupons, and audit commission splits.
          </p>
          <ul className="space-y-2 text-xs text-muted pt-2 border-t border-border">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-main flex-shrink-0" />
              <span>10% Platform commission ledger</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-main flex-shrink-0" />
              <span>Vendor approvals & platform analytics</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Home;
