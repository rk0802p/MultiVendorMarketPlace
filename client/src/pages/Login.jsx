import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';

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

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setFormError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full p-8 space-y-6 shadow-md border-border">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-control bg-surface-2 text-main border border-border mb-1">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-main">Welcome back</h2>
          <p className="text-xs text-muted">Sign in to your TechMart account</p>
        </div>

        {formError && (
          <div className="p-3.5 bg-surface-2 border border-border-strong rounded-control flex items-center space-x-2 text-xs text-main">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-control text-sm text-main placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-control text-sm text-main placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring transition"
              />
            </div>
          </div>

          <Button
            type="submit"
            loading={isSubmitting}
            className="w-full py-2.5 font-semibold text-sm"
          >
            <span>Sign In</span>
            {!isSubmitting && <ArrowRight className="w-4 h-4 ml-1.5" />}
          </Button>
        </form>

        {/* Demo Roles Quick Fill */}
        <div className="pt-4 border-t border-border">
          <span className="text-[11px] font-semibold uppercase text-muted tracking-wider block mb-2 text-center">
            Quick Fill Demo Accounts
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('customer@example.com', 'Password123!')}
              className="px-2 py-1.5 text-xs bg-surface-2 hover:bg-surface-3 text-main rounded-control font-medium border border-border transition text-center"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('vendor@example.com', 'Password123!')}
              className="px-2 py-1.5 text-xs bg-surface-2 hover:bg-surface-3 text-main rounded-control font-medium border border-border transition text-center"
            >
              Vendor
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@example.com', 'Password123!')}
              className="px-2 py-1.5 text-xs bg-surface-2 hover:bg-surface-3 text-main rounded-control font-medium border border-border transition text-center"
            >
              Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-main font-semibold underline underline-offset-2 hover:text-muted">
            Register here
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
