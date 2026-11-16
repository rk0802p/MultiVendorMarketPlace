import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { orderService, paymentService, couponService } from '../../services/api.js';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Package,
  Tag,
  X,
} from 'lucide-react';

export const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    addressLine1: '',
    addressLine2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560001',
    country: 'India',
    phone: '',
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const discountAmount = appliedCoupon?.discountCalculated || 0;
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponLoading(true);
    try {
      const res = await couponService.validateCoupon(couponCode, subtotal);
      if (res.success && res.data) {
        setAppliedCoupon(res.data);
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.addressLine1 || !formData.city || !formData.postalCode || !formData.phone) {
      setError('Please fill in all required shipping address fields.');
      return;
    }

    try {
      setLoading(true);

      // 1. Concurrency-Safe Order Creation & Inventory Decrement
      const res = await orderService.checkout({
        shippingAddress: formData,
        couponCode: appliedCoupon?.code,
      });

      if (res.success && res.data) {
        const orderId = res.data.orderId || res.data.orderNumber;
        const totalToPay = res.data.totals?.grandTotal || grandTotal;

        // 2. Initialize Razorpay Payment Order (Paise Conversion)
        const pRes = await paymentService.createPaymentOrder({
          orderId,
          amount: totalToPay,
        });

        if (pRes.success && pRes.data) {
          const { providerOrderId, keyId, amount, currency } = pRes.data;

          // 3. Complete Razorpay checkout flow
          const isRealRzpAvailable = typeof window !== 'undefined' && window.Razorpay;

          if (isRealRzpAvailable && keyId && keyId !== 'rzp_test_mock_key') {
            const rzpOptions = {
              key: keyId,
              amount,
              currency,
              name: 'TechMart Multi-Vendor Marketplace',
              description: `Payment for Order #${res.data.orderNumber}`,
              order_id: providerOrderId,
              prefill: {
                name: formData.fullName,
                email: user?.email,
                contact: formData.phone,
              },
              handler: async (response) => {
                await paymentService.verifyPayment({
                  orderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                });
                await fetchCart();
                navigate(`/orders/${orderId}`, {
                  state: { orderCreated: true, paymentSuccess: true, orderNumber: res.data.orderNumber },
                });
              },
              theme: { color: '#2563eb' },
              modal: {
                ondismiss: () => {
                  fetchCart();
                  navigate(`/orders/${orderId}`, {
                    state: { orderCreated: true, paymentSuccess: false, orderNumber: res.data.orderNumber },
                  });
                },
              },
            };
            const rzp = new window.Razorpay(rzpOptions);
            rzp.open();
          } else {
            // Simulated Test Mode Verification (Instant Test Confirmation)
            const testPaymentId = `pay_rzp_test_${Date.now()}`;
            const testSignature = `simulated_signature_${providerOrderId}_${testPaymentId}`;

            await paymentService.verifyPayment({
              orderId,
              razorpayOrderId: providerOrderId,
              razorpayPaymentId: testPaymentId,
              razorpaySignature: testSignature,
            });

            await fetchCart();
            navigate(`/orders/${orderId}`, {
              state: { orderCreated: true, paymentSuccess: true, orderNumber: res.data.orderNumber },
            });
          }
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Checkout failed. Please try again.';
      setError(msg);
      // Re-fetch cart if inventory changed
      await fetchCart();
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Your cart is empty</h2>
        <Link
          to="/products"
          className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition"
        >
          Return to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/cart"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        <span>Back to Shopping Cart</span>
      </Link>

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Secure Checkout
        </h1>
        <p className="text-sm text-slate-500">
          Review your delivery details and place your order with verified marketplace sellers.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-red-900 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Checkout Notice</h4>
            <p className="text-xs text-red-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Shipping & Payment Method */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Truck className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">1. Shipping Address</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Rajiv Sharma"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  required
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="House/Flat number, Street, Landmark"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="e.g. 560001"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">2. Payment Method</h2>
            </div>

            <div className="p-4 rounded-xl border-2 border-blue-600 bg-blue-50/30 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full border-4 border-blue-600 bg-white"></div>
                <div>
                  <span className="text-sm font-bold text-slate-900">
                    Razorpay Gateway (Marketplace Test Mode)
                  </span>
                  <p className="text-xs text-slate-500">
                    Cards, UPI, NetBanking, and Wallets simulated in test mode.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold uppercase px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                Test Mode
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Items Summary & Place Order Action */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-slate-900">Order Summary</h3>

            {/* Line items preview */}
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-800 truncate">{item.title}</p>
                    <p className="text-slate-400">Qty: {item.quantity} · {item.storeName}</p>
                  </div>
                  <span className="font-bold text-slate-900 flex-shrink-0">
                    ₹{item.itemSubtotal?.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Coupon Section */}
            <div className="border-t border-slate-200 pt-3 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Promo Code / Coupon</label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{appliedCoupon.code}</span>
                    <span className="text-[10px] font-normal text-emerald-700">
                      (-₹{discountAmount.toLocaleString('en-IN')})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-slate-400 hover:text-red-500 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SAVE10"
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs uppercase font-semibold focus:outline-none focus:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-red-600 mt-1">{couponError}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm border-t border-slate-200 pt-3">
              <div className="flex justify-between text-slate-600 text-xs">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 text-xs font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 text-xs">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline border-t border-slate-200 pt-3">
              <span className="text-base font-bold text-slate-900">Total</span>
              <span className="text-2xl font-black text-slate-900">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'Processing Checkout...' : 'Confirm & Place Order'}</span>
            </button>

            <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Concurrency-Safe Atomic Checkout Protected</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
