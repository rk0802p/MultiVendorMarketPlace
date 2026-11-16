import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { orderService, paymentService } from '../../services/api.js';
import { RAZORPAY_THEME_COLOR } from '../../theme/razorpayTheme.js';
import {
  Package,
  Store,
  ArrowLeft,
  Truck,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Check,
  FileText,
  CreditCard,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';

export const OrderDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
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
        <Loader2 className="w-8 h-8 text-main animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-main">Order Not Found</h2>
        <p className="text-xs text-muted">{error || 'This order could not be retrieved.'}</p>
        <Link
          to="/orders"
          className="inline-block px-5 py-2.5 bg-primary text-inverse rounded-control text-xs font-semibold hover:bg-primary-hover transition"
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

  const handleRetryPayment = async () => {
    try {
      setPaying(true);
      const pRes = await paymentService.createPaymentOrder({
        orderId: order._id || order.orderNumber,
        amount: order.totals?.grandTotal,
      });

      if (pRes.success && pRes.data) {
        const { providerOrderId, keyId, amount, currency } = pRes.data;
        const isRealRzpAvailable = typeof window !== 'undefined' && window.Razorpay;

        if (isRealRzpAvailable && keyId && keyId !== 'rzp_test_mock_key') {
          const rzpOptions = {
            key: keyId,
            amount,
            currency,
            name: 'TechMart Multi-Vendor Marketplace',
            description: `Payment for Order #${order.orderNumber}`,
            order_id: providerOrderId,
            prefill: {
              name: order.shippingAddress?.fullName || '',
              contact: order.shippingAddress?.phone || '',
            },
            handler: async (response) => {
              await paymentService.verifyPayment({
                orderId: order._id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              const updated = await orderService.getOrder(order._id);
              if (updated.success && updated.data) {
                setOrder(updated.data.order);
              }
            },
            theme: { color: RAZORPAY_THEME_COLOR },
          };
          const rzp = new window.Razorpay(rzpOptions);
          rzp.open();
        } else {
          const testPaymentId = `pay_rzp_test_${Date.now()}`;
          const testSignature = `simulated_signature_${providerOrderId}_${testPaymentId}`;
          await paymentService.verifyPayment({
            orderId: order._id,
            razorpayOrderId: providerOrderId,
            razorpayPaymentId: testPaymentId,
            razorpaySignature: testSignature,
          });
          const updated = await orderService.getOrder(order._id);
          if (updated.success && updated.data) {
            setOrder(updated.data.order);
          }
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Payment retry failed.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/orders"
        className="inline-flex items-center text-xs font-semibold text-muted hover:text-main transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        <span>Back to Order History</span>
      </Link>

      {justCreated && (
        <div className="p-4 rounded-control border border-border-strong bg-surface-2 flex items-center space-x-3 text-main">
          {paymentSuccess ? (
            <CheckCircle2 className="w-6 h-6 text-main flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-main flex-shrink-0" />
          )}
          <div>
            <h4 className="font-bold text-sm">
              {paymentSuccess
                ? 'Thank you! Your order has been placed and payment confirmed.'
                : 'Order Recorded (Payment Incomplete)'}
            </h4>
            <p className="text-xs text-muted mt-0.5">
              {paymentSuccess
                ? `Order #${order.orderNumber} is paid and assigned to the respective vendors for independent fulfillment. Razorpay payment verified with platform commission recorded.`
                : `Order #${order.orderNumber} has been created and reserved in our system. You can complete payment below at any time.`}
            </p>
          </div>
        </div>
      )}

      {/* Header Info */}
      <Card className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-main">
              {order.orderNumber}
            </h1>
            <StatusBadge status={order.overallStatus} />
          </div>
          <p className="text-xs text-muted mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()} · Payment Status:{' '}
            <span className="capitalize font-semibold text-main">{order.paymentStatus}</span>
          </p>
        </div>

        <div className="text-left md:text-right flex flex-col md:items-end space-y-2">
          <div>
            <span className="text-xs text-muted uppercase font-bold tracking-wider block">
              Grand Total
            </span>
            <span className="text-3xl font-black text-main">
              ₹{order.totals?.grandTotal?.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center space-x-3 flex-wrap gap-2">
            {order.paymentStatus !== 'paid' && (
              <Button
                onClick={handleRetryPayment}
                disabled={paying}
                loading={paying}
                size="sm"
              >
                <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                <span>{paying ? 'Opening Gateway...' : 'Pay Now / Retry Payment'}</span>
              </Button>
            )}

            <a
              href={orderService.getInvoiceUrl(order._id || order.orderNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-surface-2 hover:bg-surface-3 text-main border border-border rounded-control text-xs font-bold transition shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Invoice (PDF)</span>
            </a>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Multi-Vendor Packages & Fulfillment Trackers */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-main flex items-center space-x-2">
            <Truck className="w-5 h-5 text-main" />
            <span>Multi-Vendor Fulfillment Packages ({Object.keys(vendorPackages).length})</span>
          </h2>

          {Object.entries(vendorPackages).map(([storeName, pkg], idx) => (
            <Card
              key={idx}
              className="overflow-hidden"
            >
              {/* Package Header */}
              <div className="bg-surface-2 px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-control bg-surface border border-border text-main flex items-center justify-center font-bold">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-main">Package #{idx + 1} · {storeName}</h3>
                    <span className="text-[11px] text-muted">Fulfilled directly by vendor</span>
                  </div>
                </div>

                {pkg.items[0]?.trackingNumber && (
                  <div className="text-xs bg-surface border border-border px-3 py-1 rounded-control">
                    <span className="text-muted font-semibold">Tracking #: </span>
                    <span className="font-mono font-bold text-main">
                      {pkg.items[0].trackingNumber}
                    </span>
                  </div>
                )}
              </div>

              {/* Fulfillment Step Progress Timeline */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-border -translate-y-1/2 z-0"></div>
                  {steps.map((st, stepIdx) => {
                    const status = getStepStatus(pkg.items[0]?.fulfillmentStatus, st);
                    return (
                      <div key={st} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-pill flex items-center justify-center text-xs font-bold transition ${
                            status === 'completed'
                              ? 'bg-primary text-inverse border border-primary shadow-xs'
                              : status === 'current'
                              ? 'bg-surface text-main border-2 border-primary ring-2 ring-primary/20'
                              : 'bg-surface-2 text-muted border border-border'
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
                            status === 'completed' || status === 'current'
                              ? 'text-main'
                              : 'text-muted'
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
              <div className="divide-y divide-border p-6 space-y-4">
                {pkg.items.map((item) => (
                  <div key={item._id} className="pt-2 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-main">{item.title}</h4>
                      <p className="text-xs text-muted">
                        Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-main">
                      ₹{item.itemSubtotal?.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Right Column: Shipping Details & Order Totals */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <Card className="p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-main" />
              <span>Delivery Address</span>
            </h3>

            <div className="text-xs text-main space-y-1">
              <p className="font-bold text-sm">{order.shippingAddress?.fullName}</p>
              <p className="text-muted">{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && <p className="text-muted">{order.shippingAddress?.addressLine2}</p>}
              <p className="text-muted">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
                {order.shippingAddress?.postalCode}
              </p>
              <p className="text-muted pt-1">Phone: {order.shippingAddress?.phone}</p>
            </div>
          </Card>

          {/* Totals Breakdown */}
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-main">Payment Breakdown</h3>

            <div className="space-y-2 text-xs border-b border-border pb-3 text-muted">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-main">
                  ₹{order.totals?.subtotal?.toLocaleString('en-IN')}
                </span>
              </div>
              {(order.totals?.discount > 0 || order.appliedCoupon?.discountAmount > 0) && (
                <div className="flex justify-between text-main font-semibold">
                  <span>Coupon Discount ({order.appliedCoupon?.code || 'PROMO'})</span>
                  <span>
                    - ₹{(order.totals?.discount || order.appliedCoupon?.discountAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-semibold text-main">Free</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span className="font-semibold text-main">Included</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-bold text-main">Grand Total</span>
              <span className="text-xl font-black text-main">
                ₹{order.totals?.grandTotal?.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3 bg-surface-2 rounded-control border border-border text-[11px] text-muted flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-main flex-shrink-0" />
              <span>Full marketplace buyer protection applied to this purchase.</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
