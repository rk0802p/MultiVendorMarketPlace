import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorService } from '../../services/api.js';
import { Store, Mail, Phone, FileText, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';

export const VendorApplication = () => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    // Auto-generate slug
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await vendorService.apply({
        name,
        slug,
        description,
        contactEmail,
        contactPhone,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/vendor/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit vendor application.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4 shadow-md">
          <div className="w-16 h-16 rounded-pill bg-surface-2 text-main border border-border-strong flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-main">Application Submitted!</h2>
          <p className="text-sm text-muted leading-relaxed">
            Your vendor store application for <strong>{name}</strong> is now under admin review. Once approved, you can publish products and start selling.
          </p>
          <p className="text-xs text-muted">Redirecting to your vendor dashboard...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Card className="p-8 space-y-6 shadow-md">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-main bg-surface-2 px-2.5 py-1 rounded-pill border border-border">
            Vendor Onboarding
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-main mt-2">
            Apply to Sell on TechMart
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Register your digital storefront. Admin reviews applications to ensure marketplace quality.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-surface-2 border border-border-strong rounded-control flex items-center space-x-2 text-xs text-main">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Store Name *
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-muted absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Apex Electronics"
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-control text-sm text-main placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Store Slug (Unique URL identifier) *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="apex-electronics"
                className="w-full px-4 py-2.5 bg-surface-2 border border-border rounded-control text-sm font-mono text-main placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring transition"
              />
            </div>
            <p className="text-[11px] text-muted mt-1">
              Public address preview: techmart.io/store/<span className="font-semibold text-main">{slug || 'your-store'}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Store Description *
            </label>
            <div className="relative">
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your store catalog, products, warranties, and target audience..."
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-control text-sm text-main placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Support Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@store.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-control text-sm text-main placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Support Phone *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-muted absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-control text-sm text-main placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring transition"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            className="w-full py-3 font-semibold text-sm"
          >
            <span>Submit Store Application</span>
            {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default VendorApplication;
