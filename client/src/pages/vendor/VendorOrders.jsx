import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/api.js';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Check,
  AlertCircle,
  MapPin,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Modal } from '../../components/ui/Modal.jsx';

export const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [shippingModal, setShippingModal] = useState({ open: false, orderId: null, itemId: null });
  const [trackingNumber, setTrackingNumber] = useState('');

  const fetchVendorItems = async (status = '') => {
    try {
      setLoading(true);
      setError('');
      const params = status && status !== 'all' ? { status } : {};
      const res = await orderService.getVendorOrderItems(params);
      if (res.success && res.data) {
        setOrders(res.data.items || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vendor orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorItems(filterStatus);
  }, [filterStatus]);

  const handleStatusUpdate = async (orderId, itemId, newStatus, tracking = '') => {
    try {
      setError('');
      const res = await orderService.updateVendorItemStatus(orderId, itemId, newStatus, tracking);
      if (res.success) {
        setActionSuccess(`Item status successfully updated to "${newStatus}"!`);
        setTimeout(() => setActionSuccess(''), 3000);
        // Refresh list
        fetchVendorItems(filterStatus);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update fulfillment status.');
    }
  };

  const submitShipping = (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setError('Please provide a carrier tracking number.');
      return;
    }
    handleStatusUpdate(shippingModal.orderId, shippingModal.itemId, 'shipped', trackingNumber);
    setShippingModal({ open: false, orderId: null, itemId: null });
    setTrackingNumber('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-main tracking-tight">
            Vendor Order Fulfillment
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Process orders, package products, and dispatch shipments for your store’s items.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'placed', 'packed', 'shipped', 'delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`text-xs font-bold capitalize px-3.5 py-1.5 rounded-pill border transition ${
                filterStatus === st
                  ? 'bg-primary text-inverse border-primary shadow-xs'
                  : 'bg-surface-2 text-muted border-border hover:bg-surface-3 hover:text-main'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-surface-2 border border-border-strong rounded-control flex items-center space-x-2 text-main text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-main" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-surface-2 border border-border-strong rounded-control flex items-center space-x-2 text-main text-xs font-bold">
          <AlertCircle className="w-4 h-4 text-main" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-main animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Orders in this Status"
          description="When customers purchase products from your store, the items will appear here for packaging and shipping."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((record) => {
            const item = record.item;
            return (
              <Card
                key={item._id}
                className="p-6 space-y-4 hover:border-border-strong transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="text-base font-extrabold text-main">
                        {record.orderNumber}
                      </span>
                      <StatusBadge status={item.fulfillmentStatus} />
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-muted mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-muted" />
                        <span>{new Date(record.orderCreatedAt).toLocaleDateString()}</span>
                      </span>
                      <span>·</span>
                      <span>Customer: {record.customerName}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Status Action Buttons */}
                    {item.fulfillmentStatus === 'placed' && (
                      <Button
                        onClick={() => handleStatusUpdate(record.orderId, item._id, 'packed')}
                        size="sm"
                      >
                        Mark as Packed
                      </Button>
                    )}

                    {item.fulfillmentStatus === 'packed' && (
                      <Button
                        onClick={() =>
                          setShippingModal({
                            open: true,
                            orderId: record.orderId,
                            itemId: item._id,
                          })
                        }
                        size="sm"
                      >
                        <Truck className="w-3.5 h-3.5 mr-1.5" />
                        <span>Ship Package</span>
                      </Button>
                    )}

                    {item.fulfillmentStatus === 'shipped' && (
                      <Button
                        onClick={() => handleStatusUpdate(record.orderId, item._id, 'delivered')}
                        size="sm"
                      >
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                        <span>Mark as Delivered</span>
                      </Button>
                    )}

                    {item.fulfillmentStatus === 'delivered' && (
                      <span className="text-xs font-bold text-main bg-surface-2 px-3 py-1.5 rounded-control border border-border flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Delivery Fulfilled</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Product Details */}
                  <div className="bg-surface-2 p-4 rounded-control border border-border">
                    <span className="text-[10px] uppercase font-bold text-muted tracking-wider block mb-1">
                      Ordered Item
                    </span>
                    <h4 className="text-sm font-bold text-main">{item.title}</h4>
                    <div className="flex items-center space-x-3 text-muted mt-1">
                      <span>Quantity: {item.quantity}</span>
                      <span>·</span>
                      <span>Unit Price: ₹{item.price?.toLocaleString('en-IN')}</span>
                      <span>·</span>
                      <span className="font-bold text-main">
                        Item Subtotal: ₹{item.itemSubtotal?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {item.trackingNumber && (
                      <div className="mt-2 text-xs bg-surface px-2.5 py-1 rounded border border-border inline-block font-mono font-bold text-main">
                        Carrier Tracking: {item.trackingNumber}
                      </div>
                    )}
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-surface-2 p-4 rounded-control border border-border">
                    <span className="text-[10px] uppercase font-bold text-muted tracking-wider block mb-1 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-main" />
                      <span>Ship To</span>
                    </span>
                    <p className="font-bold text-main">{record.shippingAddress?.fullName}</p>
                    <p className="text-muted">{record.shippingAddress?.addressLine1}</p>
                    <p className="text-muted">
                      {record.shippingAddress?.city}, {record.shippingAddress?.state} -{' '}
                      {record.shippingAddress?.postalCode}
                    </p>
                    <p className="text-muted mt-1">Phone: {record.shippingAddress?.phone}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Shipping Tracking Number Modal */}
      <Modal
        isOpen={shippingModal.open}
        onClose={() => setShippingModal({ open: false, orderId: null, itemId: null })}
        title="Dispatch Package"
      >
        <form onSubmit={submitShipping} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">
              Carrier Tracking Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. BLUEDART-981245 or DTDC-11203"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-control text-sm text-main placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring transition"
            />
          </div>
          <div className="flex items-center justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShippingModal({ open: false, orderId: null, itemId: null })}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
            >
              Confirm Shipment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VendorOrders;
