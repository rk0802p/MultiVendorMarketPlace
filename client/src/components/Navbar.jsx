import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useTheme } from '../hooks/useTheme.js';
import { RoleBadge } from './ui/RoleBadge.jsx';
import {
  Store,
  ShoppingBag,
  ShieldAlert,
  LogOut,
  ShoppingCart,
  Package,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" onClick={closeMenu} className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-control bg-primary text-inverse flex items-center justify-center font-bold text-base shadow-xs group-hover:bg-primary-hover transition">
            T
          </div>
          <span className="text-lg font-extrabold tracking-tight text-main">
            Tech<span className="text-muted font-normal">Mart</span>
          </span>
        </Link>

        {/* Dynamic Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className="text-xs font-semibold uppercase tracking-wider text-muted hover:text-main transition"
          >
            Home
          </Link>

          <Link
            to="/products"
            className="text-xs font-semibold uppercase tracking-wider text-muted hover:text-main transition"
          >
            Browse Products
          </Link>

          {isAuthenticated && user?.role === 'customer' && (
            <>
              <Link
                to="/orders"
                className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-muted hover:text-main transition"
              >
                <Package className="w-3.5 h-3.5" />
                <span>My Orders</span>
              </Link>
              <Link
                to="/customer/dashboard"
                className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-muted hover:text-main transition"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Customer Portal</span>
              </Link>
            </>
          )}

          {isAuthenticated && (user?.role === 'vendor' || user?.role === 'admin') && (
            <>
              <Link
                to="/vendor/dashboard"
                className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-muted hover:text-main transition"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Vendor Dashboard</span>
              </Link>
              <Link
                to="/vendor/orders"
                className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-muted hover:text-main transition"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Vendor Orders</span>
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-muted hover:text-main transition"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </Link>
          )}
        </nav>

        {/* Right Section: Theme Toggle, Cart & User Auth Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Monochromatic Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-muted hover:text-main hover:bg-surface-2 rounded-control border border-transparent hover:border-border transition"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle monochromatic color theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Shopping Cart Button with Count Badge */}
          <Link
            to="/cart"
            className="relative p-2 text-muted hover:text-main hover:bg-surface-2 rounded-control border border-transparent hover:border-border transition flex items-center"
            title="View Cart"
            aria-label={`Shopping cart with ${itemCount} items`}
          >
            <ShoppingCart className="w-4 h-4" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-inverse font-bold text-[10px] w-4 h-4 rounded-pill flex items-center justify-center shadow-xs">
                {itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="hidden sm:flex items-center space-x-3 pl-2 border-l border-border">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-main leading-tight truncate max-w-[120px]">
                  {user.name}
                </span>
                <span className="text-[10px] text-muted truncate max-w-[120px]">{user.email}</span>
              </div>
              <RoleBadge role={user.role} />
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-2 text-muted hover:text-main hover:bg-surface-2 rounded-control border border-transparent hover:border-border transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-main hover:bg-surface-2 rounded-control border border-transparent hover:border-border transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-semibold text-inverse bg-primary hover:bg-primary-hover rounded-control shadow-xs transition"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted hover:text-main hover:bg-surface-2 rounded-control border border-transparent hover:border-border transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 pt-3 pb-6 space-y-4">
          <nav className="flex flex-col space-y-2">
            <Link
              to="/"
              onClick={closeMenu}
              className="px-3 py-2 rounded-control text-sm font-medium text-main hover:bg-surface-2 transition"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={closeMenu}
              className="px-3 py-2 rounded-control text-sm font-medium text-main hover:bg-surface-2 transition"
            >
              Browse Products
            </Link>

            {isAuthenticated && user?.role === 'customer' && (
              <>
                <Link
                  to="/orders"
                  onClick={closeMenu}
                  className="px-3 py-2 rounded-control text-sm font-medium text-main hover:bg-surface-2 flex items-center space-x-2 transition"
                >
                  <Package className="w-4 h-4 text-muted" />
                  <span>My Orders</span>
                </Link>
                <Link
                  to="/customer/dashboard"
                  onClick={closeMenu}
                  className="px-3 py-2 rounded-control text-sm font-medium text-main hover:bg-surface-2 flex items-center space-x-2 transition"
                >
                  <ShoppingBag className="w-4 h-4 text-muted" />
                  <span>Customer Portal</span>
                </Link>
              </>
            )}

            {isAuthenticated && (user?.role === 'vendor' || user?.role === 'admin') && (
              <>
                <Link
                  to="/vendor/dashboard"
                  onClick={closeMenu}
                  className="px-3 py-2 rounded-control text-sm font-medium text-main hover:bg-surface-2 flex items-center space-x-2 transition"
                >
                  <Store className="w-4 h-4 text-muted" />
                  <span>Vendor Dashboard</span>
                </Link>
                <Link
                  to="/vendor/orders"
                  onClick={closeMenu}
                  className="px-3 py-2 rounded-control text-sm font-medium text-main hover:bg-surface-2 flex items-center space-x-2 transition"
                >
                  <Package className="w-4 h-4 text-muted" />
                  <span>Vendor Orders</span>
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                onClick={closeMenu}
                className="px-3 py-2 rounded-control text-sm font-medium text-main hover:bg-surface-2 flex items-center space-x-2 transition"
              >
                <ShieldAlert className="w-4 h-4 text-muted" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          <div className="pt-4 border-t border-border">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-main">{user.name}</p>
                    <p className="text-xs text-muted">{user.email}</p>
                  </div>
                  <RoleBadge role={user.role} />
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-3 text-xs font-semibold text-main bg-surface-2 hover:bg-surface-3 rounded-control border border-border flex items-center justify-center space-x-2 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="py-2 text-center text-xs font-semibold text-main bg-surface-2 hover:bg-surface-3 rounded-control border border-border transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="py-2 text-center text-xs font-semibold text-inverse bg-primary hover:bg-primary-hover rounded-control shadow-xs transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
