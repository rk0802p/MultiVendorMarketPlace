import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { orderService } from '../../services/api.js';
import {
  Package,
  Calendar,
  Store,
  ArrowLeft,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MapPin,
  Check,
  FileText,
} from 'lucide-react';

export const OrderDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const justCreated = location.state?.orderCreated;
  const paymentSuccess = location.state?.paymentSuccess;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderService.getOrder(id);
        if (res.success && res.data) {
          setOrder(res.data.order);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'This order could not be retrieved.'}</p>
        <Link
          to="/orders"
          className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  // Partition line items by vendor store
  const vendorPackages = (order.items || []).reduce((groups, item) => {
    const storeKey = item.storeId?.name || 'Verified Marketplace Vendor';
    if (!groups[storeKey]) {
      groups[storeKey] = {
        storeName: storeKey,
        storeSlug: item.storeId?.slug || '',
        items: [],
      };
    }
    groups[storeKey].items.push(item);
    return groups;
  }, {});

  const steps = ['placed', 'packed', 'shipped', 'delivered'];

  const getStepStatus = (itemStatus, stepName) => {
    const currentIndex = steps.indexOf(itemStatus);
    const targetIndex = steps.indexOf(stepName);
    if (currentIndex >= targetIndex) return 'completed';
    if (currentIndex === targetIndex - 1) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/orders"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        <span>Back to Order History</span>
      </Link>

      {justCreated && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-900">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Thank you! Your order has been placed and payment confirmed.</h4>
            <p className="text-xs text-emerald-700">
              Order #{order.orderNumber} is paid and assigned to the respective vendors for independent fulfillment.
              {paymentSuccess && ' Razorpay payment verified with platform commission recorded.'}
            </p>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {order.orderNumber}
            </h1>
            <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              {order.overallStatus?.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()} · Payment Status:{' '}
            <span className="capitalize font-semibold text-slate-700">{order.paymentStatus}</span>
          </p>
        </div>

        <div className="text-left md:text-right flex flex-col md:items-end space-y-2">
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block">
              Grand Total
            </span>
            <span className="text-3xl font-black text-slate-900">
              ₹{order.totals?.grandTotal?.toLocaleString('en-IN')}
            </span>
          </div>

          <a
            href={orderService.getInvoiceUrl(order._id || order.orderNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download Invoice (PDF)</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Multi-Vendor Packages & Fulfillment Trackers */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Truck className="w-5 h-5 text-blue-600" />
            <span>Multi-Vendor Fulfillment Packages ({Object.keys(vendorPackages).length})</span>
          </h2>

          {Object.entries(vendorPackages).map(([storeName, pkg], idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Package Header */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Package #{idx + 1} · {storeName}</h3>
                    <span className="text-[11px] text-slate-500">Fulfilled directly by vendor</span>
                  </div>
                </div>

                {pkg.items[0]?.trackingNumber && (
                  <div className="text-xs bg-white border border-slate-200 px-3 py-1 rounded-lg">
                    <span className="text-slate-400 font-semibold">Tracking #: </span>
                    <span className="font-mono font-bold text-blue-600">
                      {pkg.items[0].trackingNumber}
                    </span>
                  </div>
                )}
              </div>

              {/* Fulfillment Step Progress Timeline */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0"></div>
                  {steps.map((st, stepIdx) => {
                    const status = getStepStatus(pkg.items[0]?.fulfillmentStatus, st);
                    return (
                      <div key={st} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                            status === 'completed'
                              ? 'bg-emerald-600 text-white'
                              : status === 'current'
                              ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {status === 'completed' ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            stepIdx + 1
                          )}
                        </div>
                        <span
                          className={`text-[11px] font-bold uppercase mt-2 ${
                            status === 'completed'
                              ? 'text-emerald-700'
                              : status === 'current'
                              ? 'text-blue-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {st}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Package Line Items */}
              <div className="divide-y divide-slate-100 p-6 space-y-4">
                {pkg.items.map((item) => (
                  <div key={item._id} className="pt-2 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-400">
                        Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      ₹{item.itemSubtotal?.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Shipping Details & Order Totals */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Delivery Address</span>
            </h3>

            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-bold text-sm text-slate-900">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress?.addressLine2}</p>}
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
                {order.shippingAddress?.postalCode}
              </p>
              <p className="text-slate-500 pt-1">Phone: {order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Totals Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Payment Breakdown</h3>

            <div className="space-y-2 text-xs border-b border-slate-100 pb-3 text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">
                  ₹{order.totals?.subtotal?.toLocaleString('en-IN')}
                </span>
              </div>
              {(order.totals?.discount > 0 || order.appliedCoupon?.discountAmount > 0) && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({order.appliedCoupon?.code || 'PROMO'})</span>
                  <span>
                    - ₹{(order.totals?.discount || order.appliedCoupon?.discountAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span className="font-semibold text-slate-900">Included</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-bold text-slate-900">Grand Total</span>
              <span className="text-xl font-black text-slate-900">
                ₹{order.totals?.grandTotal?.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Full marketplace buyer protection applied to this purchase.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
