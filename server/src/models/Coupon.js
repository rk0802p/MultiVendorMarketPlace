import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ['percentage', 'fixed'],
        message: 'Coupon type must be percentage or fixed',
      },
      required: true,
    },
    value: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    minCartValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
      min: 0,
    },
    expiry: {
      type: Date,
      required: [true, 'Expiry date is required'],
      index: true,
    },
    usageLimit: {
      type: Number,
      default: null,
      min: 1,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Method to validate coupon eligibility against a subtotal
couponSchema.methods.isValidForCart = function (cartSubtotal) {
  if (!this.isActive) return { valid: false, reason: 'Coupon is inactive' };
  if (new Date() > this.expiry) return { valid: false, reason: 'Coupon has expired' };
  if (this.usageLimit !== null && this.usageCount >= this.usageLimit) {
    return { valid: false, reason: 'Coupon usage limit has been reached' };
  }
  if (cartSubtotal < this.minCartValue) {
    return {
      valid: false,
      reason: `Minimum cart value of ₹${this.minCartValue} is required to apply this coupon`,
    };
  }
  return { valid: true };
};

export const Coupon = mongoose.model('Coupon', couponSchema);
