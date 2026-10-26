import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required'],
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order reference is required to verify purchase'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer between 1 and 5',
      },
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['published', 'hidden', 'flagged'],
      default: 'published',
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

// One verified review per customer per product
reviewSchema.index({ customerId: 1, productId: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
