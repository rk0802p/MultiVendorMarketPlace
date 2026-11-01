import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  ShoppingCart,
  Trash2,
  Store,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Package,
  ShoppingBag,
} from 'lucide-react';

export const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const itemCount = cart?.itemCount || 0;
  const hasUnavailable = cart?.hasUnavailableItems || false;

  // Group items by vendor store
  const storeGroups = items.reduce((groups, item) => {
    const storeKey = item.storeName || 'Marketplace Seller';
    if (!groups[storeKey]) {
      groups[storeKey] = {
        storeName: storeKey,
        storeSlug: item.storeSlug,
        items: [],
      };
    }
    groups[storeKey].items.push(item);
    return groups;
  }, {});

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Shopping Cart is Empty</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto text-sm">
          Browse through our catalog of verified vendor listings and discover electronics, accessories, and gear.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-sm"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-sm text-slate-500">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} across{' '}
            {Object.keys(storeGroups).length}{' '}
            {Object.keys(storeGroups).length === 1 ? 'vendor' : 'vendors'}
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center space-x-1 py-1.5 px-3 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-200 transition self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      {hasUnavailable && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-900 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Some items require your attention</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              One or more products in your cart are currently out of stock or have limited availability. Please adjust quantities before checkout.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Line Items Grouped by Vendor */}
        <div className="lg:col-span-2 space-y-6">
          {Object.values(storeGroups).map((group, groupIdx) => (
            <div
              key={groupIdx}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Store Header */}
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <Store className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">{group.storeName}</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Direct Fulfillment
                </span>
              </div>

              {/* Items in this Store */}
              <div className="divide-y divide-slate-100">
                {group.items.map((item) => (
                  <div
                    key={item.productId}
                    className={`p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
                      !item.isAvailable ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4 min-w-0">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-slate-300" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <Link
                          to={`/product/${item.productId}`}
                          className="text-sm font-bold text-slate-900 hover:text-blue-600 transition truncate block"
                        >
                          {item.title}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">
                          ₹{item.price?.toLocaleString('en-IN')} per unit
                        </p>
                        {!item.isAvailable && (
                          <p className="text-xs text-red-600 font-semibold mt-1">
                            {item.unavailableReason || 'Unavailable'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs transition"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs transition disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-right min-w-[80px]">
                        <span className="text-sm font-bold text-slate-900 block">
                          ₹{item.itemSubtotal?.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="text-slate-400 hover:text-red-600 transition p-1"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary & Checkout Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-slate-900">Order Summary</h3>

            <div className="space-y-3 text-sm border-b border-slate-200 pb-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-semibold text-slate-900">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax</span>
                <span className="text-xs text-slate-400">Included</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-base font-bold text-slate-900">Total</span>
              <span className="text-2xl font-black text-slate-900">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Platform Guarantee & Commission Badge */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex items-center space-x-1.5 text-blue-700 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Marketplace Buyer Protection</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Independent seller fulfillment tracked with full delivery guarantee.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCheckoutClick}
              disabled={hasUnavailable || items.length === 0 || loading}
              className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
