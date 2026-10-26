import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    const result = await login({ email, password });
    setIsSubmitting(false);

    if (result.success) {
      // Direct user according to their role if no specific redirect was requested
      if (redirectPath === '/') {
        if (result.user.role === 'admin') navigate('/admin/dashboard');
        else if (result.user.role === 'vendor') navigate('/vendor/dashboard');
        else navigate('/customer/dashboard');
      } else {
        navigate(redirectPath);
      }
    } else {
      setFormError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  // Demo auto-fill helper
  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setFormError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-1">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h2>
          <p className="text-sm text-slate-500">Sign in to your TechMart account</p>
        </div>

        {formError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Demo Roles Quick Fill */}
        <div className="pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider block mb-2 text-center">
            Quick Fill Demo Accounts
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('customer@example.com', 'Password123!')}
              className="px-2 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md font-medium border border-blue-200 transition text-center"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('vendor@example.com', 'Password123!')}
              className="px-2 py-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md font-medium border border-emerald-200 transition text-center"
            >
              Vendor
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@example.com', 'Password123!')}
              className="px-2 py-1.5 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md font-medium border border-purple-200 transition text-center"
            >
              Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
