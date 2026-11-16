import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { orderService } from '../../services/api.js';
import { ShoppingBag, Package, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getMyOrders();
        if (res.success && res.data) {
          setOrders(res.data.orders || []);
        }
      } catch (err) {
        console.warn('Could not load orders:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const activeOrdersCount = orders.filter((o) => ['placed', 'in_progress'].includes(o.overallStatus)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <Card className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-main bg-surface-2 px-2.5 py-1 rounded-pill border border-border">
            Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-main mt-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Logged in as <strong className="text-main">{user?.email}</strong>. Manage your orders and shopping cart.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/products"
            className="px-4 py-2 bg-primary text-inverse hover:bg-primary-hover rounded-control text-xs font-bold transition shadow-xs"
          >
            Explore Catalogue
          </Link>
        </div>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          to="/orders"
          icon={Package}
          label="Active Orders"
          value={activeOrdersCount}
        />
        <StatCard
          to="/cart"
          icon={ShoppingBag}
          label="Cart Items"
          value={itemCount}
        />
        <StatCard
          to="/orders"
          icon={Calendar}
          label="Total Orders"
          value={orders.length}
        />
      </div>

      {/* Orders Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-main">Recent Purchase Orders</h2>
          {orders.length > 0 && (
            <Link to="/orders" className="text-xs font-semibold text-main hover:underline flex items-center">
              <span>View All</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="py-8 text-center text-muted text-xs">Loading orders...</div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders placed yet"
            description="Browse our multi-vendor catalog to purchase products from multiple sellers in a single checkout."
            action={
              <Link
                to="/products"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary text-inverse hover:bg-primary-hover rounded-control text-xs font-bold transition shadow-xs"
              >
                <span>Start Shopping</span>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((ord) => (
              <div
                key={ord._id}
                className="p-4 bg-surface-2 border border-border rounded-control flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-main">{ord.orderNumber}</span>
                    <StatusBadge status={ord.overallStatus} />
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    {new Date(ord.createdAt).toLocaleDateString()} · {ord.items?.length || 0} line items
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="font-bold text-sm text-main">
                    ₹{ord.totals?.grandTotal?.toLocaleString('en-IN')}
                  </span>
                  <Link
                    to={`/orders/${ord._id}`}
                    className="px-3 py-1.5 bg-surface border border-border hover:bg-surface-2 text-main rounded-control text-xs font-semibold transition"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CustomerDashboard;
