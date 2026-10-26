import mongoose from 'mongoose';

const vendorTransferSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    grossAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    commissionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    commissionAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    netPayout: {
      type: Number,
      required: true,
      min: 0,
    },
    transferStatus: {
      type: String,
      enum: ['pending', 'completed', 'simulated', 'failed'],
      default: 'pending',
    },
    providerTransferId: {
      type: String,
      default: '',
    },
    transferredAt: {
      type: Date,
    },
  },
  { _id: true }
);

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
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
    provider: {
      type: String,
      default: 'razorpay',
    },
    providerOrderId: {
      type: String,
      required: true,
      index: true,
    },
    providerPaymentId: {
      type: String,
      sparse: true,
      index: true,
    },
    providerSignature: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
    platformCommissionPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 10,
    },
    totalCommissionAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    transfers: {
      type: [vendorTransferSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
    processedWebhookEvents: [
      {
        eventId: { type: String, required: true },
        eventType: { type: String, required: true },
        processedAt: { type: Date, default: Date.now },
      },
    ],
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

export const Payment = mongoose.model('Payment', paymentSchema);
