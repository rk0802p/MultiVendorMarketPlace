import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/api.js';
import {
  Package,
  Calendar,
  Store,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  ShoppingBag,
} from 'lucide-react';

export const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getMyOrders();
        if (res.success && res.data) {
          setOrders(res.data.orders || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Order History
        </h1>
        <p className="text-sm text-slate-500">
          Track packages and review delivery status across all marketplace vendors.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500">
            You haven’t ordered any products yet. Browse through the marketplace and discover what vendors offer.
          </p>
          <Link
            to="/products"
            className="inline-block px-5 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            const uniqueVendors = new Set(order.items?.map((i) => i.storeId?.name || i.storeId)).size;

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:border-blue-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="text-base font-extrabold text-slate-900">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`text-xs uppercase font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          order.overallStatus
                        )}`}
                      >
                        {order.overallStatus?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </span>
                      <span>·</span>
                      <span>
                        {uniqueVendors} {uniqueVendors === 1 ? 'Package / Vendor' : 'Packages / Vendors'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Total</span>
                      <span className="text-lg font-extrabold text-slate-900">
                        ₹{order.totals?.grandTotal?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <Link
                      to={`/orders/${order._id}`}
                      className="px-4 py-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-xl font-bold text-xs transition flex items-center space-x-1"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="pt-4 flex flex-wrap gap-3">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs"
                    >
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                        {item.title}
                      </span>
                      <span className="text-slate-400">×{item.quantity}</span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                        {item.fulfillmentStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
