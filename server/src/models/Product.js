import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store reference is required'],
      index: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Vendor ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be greater than or equal to 0'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      min: [0, 'Stock cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Stock must be an integer',
      },
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'active', 'archived'],
        message: 'Status must be draft, active, or archived',
      },
      default: 'active',
      index: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
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

// Compound indexes for optimal catalog and store filtering
productSchema.index({ status: 1, category: 1, price: 1 });
productSchema.index({ storeId: 1, status: 1 });
productSchema.index({ vendorId: 1, status: 1 });

export const Product = mongoose.model('Product', productSchema);
