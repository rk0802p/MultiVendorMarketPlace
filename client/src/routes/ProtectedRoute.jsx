import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldAlert, Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-main animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-surface p-8 rounded-card shadow-md border border-border text-center space-y-4">
          <div className="w-12 h-12 rounded-control bg-surface-2 text-main border border-border-strong flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-main">Access Restricted</h2>
          <p className="text-xs text-muted leading-relaxed">
            Your current role (<strong className="capitalize text-main font-semibold">{user.role}</strong>) does not have authorization to view this resource.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-block px-5 py-2.5 bg-primary text-inverse rounded-control text-xs font-semibold hover:bg-primary-hover transition shadow-xs"
            >
              Return to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};
