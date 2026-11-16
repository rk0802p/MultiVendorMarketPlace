import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { User, Mail, Lock, Store, ShoppingBag, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    const result = await register({ name, email, password, role });
    setIsSubmitting(false);

    if (result.success) {
      if (role === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } else {
      setFormError(result.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full p-8 space-y-6 shadow-md border-border">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-control bg-surface-2 text-main border border-border mb-1">
            <User className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-main">Create an account</h2>
          <p className="text-xs text-muted">Join the TechMart multi-vendor platform</p>
        </div>

        {formError && (
          <div className="p-3.5 bg-surface-2 border border-border-strong rounded-control flex items-center space-x-2 text-xs text-main">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              I want to:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-3 rounded-control border flex flex-col items-center space-y-1 transition text-center ${
                  role === 'customer'
                    ? 'border-2 border-primary bg-surface-2 text-main font-semibold shadow-xs'
                    : 'border-border text-muted hover:border-border-strong hover:text-main'
                }`}
              >
                <ShoppingBag className="w-5 h-5 text-main" />
                <span className="text-xs">Shop as Customer</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('vendor')}
                className={`p-3 rounded-control border flex flex-col items-center space-y-1 transition text-center ${
                  role === 'vendor'
                    ? 'border-2 border-primary bg-surface-2 text-main font-semibold shadow-xs'
                    : 'border-border text-muted hover:border-border-strong hover:text-main'
                }`}
              >
                <Store className="w-5 h-5 text-main" />
                <span className="text-xs">Sell as Vendor</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-muted absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Raj Patel"
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-control text-sm text-main placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring transition"
              />
            </div>
          </div>

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
              Password (min 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
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
            <span>Create Account</span>
            {!isSubmitting && <ArrowRight className="w-4 h-4 ml-1.5" />}
          </Button>
        </form>

        <div className="text-center text-xs text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-main font-semibold underline underline-offset-2 hover:text-muted">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
