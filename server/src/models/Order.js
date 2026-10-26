import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Snapshot fields at purchase time
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be an integer',
      },
    },
    itemSubtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    fulfillmentStatus: {
      type: String,
      enum: {
        values: ['placed', 'packed', 'shipped', 'delivered', 'cancelled'],
        message: 'Invalid fulfillment status',
      },
      default: 'placed',
      index: true,
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    shippedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
  },
  { _id: true }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items && items.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    totals: {
      subtotal: { type: Number, required: true, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      shipping: { type: Number, default: 0, min: 0 },
      tax: { type: Number, default: 0, min: 0 },
      grandTotal: { type: Number, required: true, min: 0 },
    },
    appliedCoupon: {
      couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
      code: { type: String },
      discountAmount: { type: Number, default: 0 },
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    overallStatus: {
      type: String,
      enum: ['placed', 'in_progress', 'completed', 'cancelled'],
      default: 'placed',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Method to derive overallStatus from item fulfillment statuses
orderSchema.methods.recalculateOverallStatus = function () {
  const statuses = this.items.map((i) => i.fulfillmentStatus);
  if (statuses.every((s) => s === 'delivered')) {
    this.overallStatus = 'completed';
  } else if (statuses.every((s) => s === 'cancelled')) {
    this.overallStatus = 'cancelled';
  } else if (statuses.some((s) => ['packed', 'shipped', 'delivered'].includes(s))) {
    this.overallStatus = 'in_progress';
  } else {
    this.overallStatus = 'placed';
  }
};

export const Order = mongoose.model('Order', orderSchema);
