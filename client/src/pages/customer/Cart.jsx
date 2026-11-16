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
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';

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
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          description="Browse through our catalog of verified vendor listings and discover electronics, accessories, and gear."
          action={
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-inverse hover:bg-primary-hover font-semibold rounded-control transition shadow-xs"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-main tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-sm text-muted">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} across{' '}
            {Object.keys(storeGroups).length}{' '}
            {Object.keys(storeGroups).length === 1 ? 'vendor' : 'vendors'}
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-muted hover:text-main flex items-center space-x-1.5 py-1.5 px-3 rounded-control hover:bg-surface-2 border border-border transition self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      {hasUnavailable && (
        <div className="p-4 bg-surface-2 border border-border-strong rounded-control flex items-start space-x-3 text-main text-sm">
          <AlertTriangle className="w-5 h-5 text-main flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Some items require your attention</h4>
            <p className="text-xs text-muted mt-0.5">
              One or more products in your cart are currently out of stock or have limited availability. Please adjust quantities before checkout.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Line Items Grouped by Vendor */}
        <div className="lg:col-span-2 space-y-6">
          {Object.values(storeGroups).map((group, groupIdx) => (
            <Card
              key={groupIdx}
              className="overflow-hidden"
            >
              {/* Store Header */}
              <div className="bg-surface-2 px-5 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-control bg-surface border border-border text-main flex items-center justify-center font-bold">
                    <Store className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-main">{group.storeName}</span>
                </div>
                <span className="text-[11px] font-semibold text-main bg-surface px-2.5 py-0.5 rounded-pill border border-border">
                  Direct Fulfillment
                </span>
              </div>

              {/* Items in this Store */}
              <div className="divide-y divide-border">
                {group.items.map((item) => (
                  <div
                    key={item.productId}
                    className={`p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
                      !item.isAvailable ? 'bg-surface-2/70' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4 min-w-0">
                      <div className="w-16 h-16 rounded-control bg-surface-2 border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-muted" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <Link
                          to={`/product/${item.productId}`}
                          className="text-sm font-bold text-main hover:text-muted transition truncate block"
                        >
                          {item.title}
                        </Link>
                        <p className="text-xs text-muted mt-0.5">
                          ₹{item.price?.toLocaleString('en-IN')} per unit
                        </p>
                        {!item.isAvailable && (
                          <p className="text-xs text-muted font-semibold mt-1">
                            {item.unavailableReason || 'Unavailable'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-border rounded-control overflow-hidden bg-surface">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2.5 py-1 bg-surface-2 hover:bg-surface-3 text-main font-bold text-xs transition"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-main">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="px-2.5 py-1 bg-surface-2 hover:bg-surface-3 text-main font-bold text-xs transition disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-right min-w-[80px]">
                        <span className="text-sm font-bold text-main block">
                          ₹{item.itemSubtotal?.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="text-muted hover:text-main transition p-1.5 rounded-control hover:bg-surface-2"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Right Column: Order Summary & Checkout Card */}
        <div className="space-y-6">
          <Card className="p-6 space-y-5">
            <h3 className="text-lg font-bold text-main">Order Summary</h3>

            <div className="space-y-3 text-sm border-b border-border pb-4">
              <div className="flex justify-between text-muted">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-semibold text-main">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span className="font-semibold text-main">Free</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Estimated Tax</span>
                <span className="text-xs text-muted">Included</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-base font-bold text-main">Total</span>
              <span className="text-2xl font-black text-main">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Platform Guarantee & Commission Badge */}
            <div className="p-3 bg-surface-2 rounded-control border border-border text-xs text-muted space-y-1">
              <div className="flex items-center space-x-1.5 text-main font-semibold">
                <ShieldCheck className="w-4 h-4 text-main" />
                <span>Marketplace Buyer Protection</span>
              </div>
              <p className="text-[11px] text-muted">
                Independent seller fulfillment tracked with full delivery guarantee.
              </p>
            </div>

            <Button
              type="button"
              onClick={handleCheckoutClick}
              disabled={hasUnavailable || items.length === 0 || loading}
              className="w-full py-3.5 font-bold text-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
