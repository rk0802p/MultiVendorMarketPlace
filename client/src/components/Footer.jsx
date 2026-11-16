import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Store, Lock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-surface text-main mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-control bg-primary text-inverse flex items-center justify-center font-bold text-sm shadow-xs">
                T
              </div>
              <span className="text-base font-extrabold tracking-tight text-main">
                Tech<span className="text-muted font-normal">Mart</span>
              </span>
            </Link>
            <p className="text-xs text-muted leading-relaxed">
              Curated multi-vendor marketplace connecting customers to verified independent electronics sellers.
            </p>
            <div className="pt-2 flex items-center space-x-3 text-xs text-muted">
              <span className="inline-flex items-center space-x-1 border border-border px-2 py-0.5 rounded-pill text-[10px] uppercase font-semibold">
                <Lock className="w-3 h-3 mr-0.5" />
                256-bit SSL
              </span>
              <span className="inline-flex items-center space-x-1 border border-border px-2 py-0.5 rounded-pill text-[10px] uppercase font-semibold">
                <ShieldCheck className="w-3 h-3 mr-0.5" />
                Verified Sellers
              </span>
            </div>
          </div>

          {/* Customer Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Customer Portal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/products" className="text-muted hover:text-main transition">
                  Browse Product Catalogue
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-muted hover:text-main transition">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-muted hover:text-main transition">
                  Order Tracking & History
                </Link>
              </li>
              <li>
                <Link to="/customer/dashboard" className="text-muted hover:text-main transition">
                  Account Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Vendor Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Vendor Hub</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/vendor/apply" className="text-muted hover:text-main transition">
                  Apply for Storefront
                </Link>
              </li>
              <li>
                <Link to="/vendor/dashboard" className="text-muted hover:text-main transition">
                  Vendor Dashboard
                </Link>
              </li>
              <li>
                <Link to="/vendor/products" className="text-muted hover:text-main transition">
                  Inventory Management
                </Link>
              </li>
              <li>
                <Link to="/vendor/orders" className="text-muted hover:text-main transition">
                  Order Fulfillment
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Governance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Platform Architecture</h4>
            <div className="space-y-2 text-xs text-muted leading-relaxed">
              <p>
                Engineered with Redis unified carts, Elasticsearch indexing, and atomic MongoDB transactions.
              </p>
              <div className="pt-2 border-t border-border">
                <Link to="/admin/dashboard" className="text-xs font-semibold text-muted hover:text-main transition flex items-center space-x-1">
                  <span>Superuser Admin Console</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
          <p>© {new Date().getFullYear()} TechMart Multi-Vendor Marketplace. Monochromatic Design System.</p>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>WCAG 2.1 AA Compliant</span>
            <span>•</span>
            <span>Atomic Multi-Vendor Checkout</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
