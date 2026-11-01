import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/api.js';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Check,
  Send,
  AlertCircle,
  MapPin,
  Calendar,
} from 'lucide-react';

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'packed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Vendor Order Fulfillment
          </h1>
          <p className="text-sm text-slate-500">
            Process orders, package products, and dispatch shipments for your store’s items.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'placed', 'packed', 'shipped', 'delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`text-xs font-bold capitalize px-3.5 py-1.5 rounded-xl border transition ${
                filterStatus === st
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-emerald-800 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-2 text-red-800 text-xs font-bold">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Orders in this Status</h3>
          <p className="text-xs text-slate-500">
            When customers purchase products from your store, the items will appear here for packaging and shipping.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((record) => {
            const item = record.item;
            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="text-base font-extrabold text-slate-900">
                        {record.orderNumber}
                      </span>
                      <span
                        className={`text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          item.fulfillmentStatus
                        )}`}
                      >
                        {item.fulfillmentStatus}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(record.orderCreatedAt).toLocaleDateString()}</span>
                      </span>
                      <span>·</span>
                      <span>Customer: {record.customerName}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Status Action Buttons */}
                    {item.fulfillmentStatus === 'placed' && (
                      <button
                        onClick={() => handleStatusUpdate(record.orderId, item._id, 'packed')}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        Mark as Packed
                      </button>
                    )}

                    {item.fulfillmentStatus === 'packed' && (
                      <button
                        onClick={() =>
                          setShippingModal({
                            open: true,
                            orderId: record.orderId,
                            itemId: item._id,
                          })
                        }
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Ship Package</span>
                      </button>
                    )}

                    {item.fulfillmentStatus === 'shipped' && (
                      <button
                        onClick={() => handleStatusUpdate(record.orderId, item._id, 'delivered')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark as Delivered</span>
                      </button>
                    )}

                    {item.fulfillmentStatus === 'delivered' && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Delivery Fulfilled</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Product Details */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      Ordered Item
                    </span>
                    <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                    <div className="flex items-center space-x-3 text-slate-500 mt-1">
                      <span>Quantity: {item.quantity}</span>
                      <span>·</span>
                      <span>Unit Price: ₹{item.price?.toLocaleString('en-IN')}</span>
                      <span>·</span>
                      <span className="font-bold text-slate-800">
                        Item Subtotal: ₹{item.itemSubtotal?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {item.trackingNumber && (
                      <div className="mt-2 text-xs bg-white px-2.5 py-1 rounded border border-slate-200 inline-block font-mono font-bold text-blue-600">
                        Carrier Tracking: {item.trackingNumber}
                      </div>
                    )}
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      <span>Ship To</span>
                    </span>
                    <p className="font-bold text-slate-800">{record.shippingAddress?.fullName}</p>
                    <p className="text-slate-600">{record.shippingAddress?.addressLine1}</p>
                    <p className="text-slate-600">
                      {record.shippingAddress?.city}, {record.shippingAddress?.state} -{' '}
                      {record.shippingAddress?.postalCode}
                    </p>
                    <p className="text-slate-500 mt-1">Phone: {record.shippingAddress?.phone}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Shipping Tracking Number Modal */}
      {shippingModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Truck className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Dispatch Package</h3>
            </div>
            <form onSubmit={submitShipping} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Carrier Tracking Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BLUEDART-981245 or DTDC-11203"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShippingModal({ open: false, orderId: null, itemId: null })}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
                >
                  Confirm Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
