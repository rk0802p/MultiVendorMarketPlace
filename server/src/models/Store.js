import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
      unique: true,
      maxlength: [120, 'Store name cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Store slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    logo: {
      type: String,
      default: '',
    },
    banner: {
      type: String,
      default: '',
    },
    approvalStatus: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'Status must be pending, approved, or rejected',
      },
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    paymentAccountId: {
      type: String,
      default: '',
      trim: true,
      // Store provider-side account identifier (e.g. Razorpay linked account or Stripe account ID)
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

export const Store = mongoose.model('Store', storeSchema);
