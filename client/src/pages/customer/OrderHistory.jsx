import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/api.js';
import {
  Package,
  Calendar,
  ChevronRight,
  ShoppingBag,
  Loader2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';

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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-main animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-main tracking-tight">
          My Order History
        </h1>
        <p className="text-sm text-muted">
          Track packages and review delivery status across all marketplace vendors.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-surface-2 border border-border-strong rounded-control text-xs text-main">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No Orders Placed Yet"
          description="You haven’t ordered any products yet. Browse through the marketplace and discover what vendors offer."
          action={
            <Link
              to="/products"
              className="inline-block px-5 py-2.5 bg-primary text-inverse font-semibold text-xs rounded-control hover:bg-primary-hover transition"
            >
              Start Shopping
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const uniqueVendors = new Set(order.items?.map((i) => i.storeId?.name || i.storeId)).size;

            return (
              <Card
                key={order._id}
                className="p-6 hover:border-border-strong transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="text-base font-extrabold text-main">
                        {order.orderNumber}
                      </span>
                      <StatusBadge status={order.overallStatus} />
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-muted mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-muted" />
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
                      <span className="text-xs text-muted block">Total</span>
                      <span className="text-lg font-extrabold text-main">
                        ₹{order.totals?.grandTotal?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <Link
                      to={`/orders/${order._id}`}
                      className="px-4 py-2 bg-surface-2 hover:bg-surface-3 text-main rounded-control font-bold text-xs border border-border transition flex items-center space-x-1"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="pt-4 flex flex-wrap gap-3">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 bg-surface-2 border border-border px-3 py-1.5 rounded-control text-xs"
                    >
                      <Package className="w-3.5 h-3.5 text-muted" />
                      <span className="font-semibold text-main truncate max-w-[200px]">
                        {item.title}
                      </span>
                      <span className="text-muted">×{item.quantity}</span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-pill bg-surface text-main border border-border">
                        {item.fulfillmentStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
