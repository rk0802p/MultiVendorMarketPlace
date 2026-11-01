import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { orderService } from '../../services/api.js';
import { ShoppingBag, Package, ArrowRight, Calendar, ChevronRight } from 'lucide-react';

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
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Logged in as <strong className="text-slate-700">{user?.email}</strong>. Manage your orders and shopping cart.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/products"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Explore Catalogue
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/orders"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:border-blue-300 transition"
        >
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Orders</span>
            <p className="text-xl font-bold text-slate-900">{activeOrdersCount}</p>
          </div>
        </Link>

        <Link
          to="/cart"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:border-emerald-300 transition"
        >
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cart Items</span>
            <p className="text-xl font-bold text-slate-900">{itemCount}</p>
          </div>
        </Link>

        <Link
          to="/orders"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:border-purple-300 transition"
        >
          <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <p className="text-xl font-bold text-slate-900">{orders.length}</p>
          </div>
        </Link>
      </div>

      {/* Orders Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Purchase Orders</h2>
          {orders.length > 0 && (
            <Link to="/orders" className="text-xs font-semibold text-blue-600 hover:underline flex items-center">
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No orders placed yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Browse our multi-vendor catalog to purchase products from multiple sellers in a single checkout.
            </p>
            <div className="pt-4">
              <Link
                to="/products"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((ord) => (
              <div
                key={ord._id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">{ord.orderNumber}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {ord.overallStatus?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(ord.createdAt).toLocaleDateString()} · {ord.items?.length || 0} line items
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="font-bold text-sm text-slate-900">
                    ₹{ord.totals?.grandTotal?.toLocaleString('en-IN')}
                  </span>
                  <Link
                    to={`/orders/${ord._id}`}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg text-xs font-semibold transition"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
