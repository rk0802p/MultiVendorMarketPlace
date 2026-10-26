import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Store, ShoppingBag, ShieldAlert, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'vendor':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            T
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Tech<span className="text-blue-600">Mart</span>
          </span>
        </Link>

        {/* Dynamic Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className="text-sm font-medium text-slate-600 hover:text-blue-600 transition"
          >
            Home
          </Link>

          <Link
            to="/products"
            className="text-sm font-medium text-slate-600 hover:text-blue-600 transition"
          >
            Browse Products
          </Link>

          {isAuthenticated && user?.role === 'customer' && (
            <Link
              to="/customer/dashboard"
              className="flex items-center space-x-1 text-sm font-medium text-slate-600 hover:text-blue-600 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Customer Portal</span>
            </Link>
          )}

          {isAuthenticated && (user?.role === 'vendor' || user?.role === 'admin') && (
            <Link
              to="/vendor/dashboard"
              className="flex items-center space-x-1 text-sm font-medium text-slate-600 hover:text-emerald-600 transition"
            >
              <Store className="w-4 h-4" />
              <span>Vendor Dashboard</span>
            </Link>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              className="flex items-center space-x-1 text-sm font-medium text-slate-600 hover:text-purple-600 transition"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Console</span>
            </Link>
          )}
        </nav>

        {/* User / Auth Controls */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-800 leading-tight">
                  {user.name}
                </span>
                <span className="text-xs text-slate-400 capitalize">{user.email}</span>
              </div>
              <span
                className={`text-xs uppercase font-bold px-2.5 py-0.5 rounded-full border ${getRoleBadge(
                  user.role
                )}`}
              >
                {user.role}
              </span>
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
