import mongoose from 'mongoose';
import { config } from '../config/environment.js';
import { User } from '../models/User.js';
import { Store } from '../models/Store.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { Review } from '../models/Review.js';
import { Coupon } from '../models/Coupon.js';
import { ProductSearchService } from '../modules/products/product.search.service.js';

const futureExpiryDate = new Date(Date.now() + 90 * 24 * 3600 * 1000); // 90 periods

async function seedDatabase() {
  console.log('--- Multi-Vendor Marketplace Database Seeding ---');
  console.log(`Connecting to MongoDB at: ${config.mongo.uri}`);

  await mongoose.connect(config.mongo.uri);
  console.log('Connected to MongoDB successfully.');

  // Clean existing collections
  console.log('Cleaning existing marketplace data...');
  await Promise.all([
    User.deleteMany({}),
    Store.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Payment.deleteMany({}),
    Review.deleteMany({}),
    Coupon.deleteMany({}),
  ]);

  console.log('Creating demo user accounts...');
  // 1. Seed Users
  const admin = new User({
    name: 'Marketplace Admin',
    email: 'admin@techmart.local',
    passwordHash: 'AdminPass123!',
    role: 'admin',
    status: 'active',
  });
  await admin.save();

  const vendor1 = new User({
    name: 'Aarav Mehta',
    email: 'vendor1@techmart.local',
    passwordHash: 'VendorPass123!',
    role: 'vendor',
    status: 'active',
  });
  await vendor1.save();

  const vendor2 = new User({
    name: 'Priya Sharma',
    email: 'vendor2@techmart.local',
    passwordHash: 'VendorPass123!',
    role: 'vendor',
    status: 'active',
  });
  await vendor2.save();

  const vendorPending = new User({
    name: 'Karan Verma',
    email: 'pending@techmart.local',
    passwordHash: 'VendorPass123!',
    role: 'customer',
    status: 'active',
  });
  await vendorPending.save();

  const customer1 = new User({
    name: 'Raj Patel',
    email: 'customer@example.com',
    passwordHash: 'CustomerPass123!',
    role: 'customer',
    status: 'active',
  });
  await customer1.save();

  const customer2 = new User({
    name: 'Sneha Reddy',
    email: 'sneha@example.com',
    passwordHash: 'CustomerPass123!',
    role: 'customer',
    status: 'active',
  });
  await customer2.save();

  console.log('Creating vendor stores...');
  // 2. Seed Stores
  const store1 = new Store({
    ownerId: vendor1._id,
    name: 'TechPulse Gear',
    slug: 'techpulse-gear',
    description: 'Precision mechanical keyboards, high-DPI ergonomic gaming mice, and custom desk accessories.',
    status: 'approved',
  });
  await store1.save();

  const store2 = new Store({
    ownerId: vendor2._id,
    name: 'AudioPro Studio',
    slug: 'audiopro-studio',
    description: 'Studio-grade active noise-cancelling headphones, condenser microphones, and audiophile DAC amplifiers.',
    status: 'approved',
  });
  await store2.save();

  const storePending = new Store({
    ownerId: vendorPending._id,
    name: 'NextGen Robotics Store',
    slug: 'nextgen-robotics',
    description: 'Educational maker kits, robotics sensors, and development boards.',
    status: 'pending',
  });
  await storePending.save();

  console.log('Seeding product catalog...');
  // 3. Seed Products
  const productsData = [
    {
      storeId: store1._id,
      vendorId: vendor1._id,
      title: 'Apex Pro RGB Mechanical Keyboard',
      slug: 'apex-pro-rgb-mechanical-keyboard',
      description: 'Aircraft-grade aluminum chassis with hot-swappable tactile mechanical switches, per-key RGB illumination, and detachable USB-C braided cable.',
      category: 'Keyboards',
      price: 6499,
      stock: 40,
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80',
      ],
      status: 'active',
      averageRating: 4.8,
      reviewCount: 12,
    },
    {
      storeId: store1._id,
      vendorId: vendor1._id,
      title: 'Quantum Wireless Ergonomic Mouse',
      slug: 'quantum-wireless-ergonomic-mouse',
      description: 'Ultra-lightweight 58g wireless gaming mouse with 26,000 DPI optical sensor, pure PTFE glides, and 80-hour rechargeable battery life.',
      category: 'Accessories',
      price: 2999,
      stock: 65,
      images: [
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
      ],
      status: 'active',
      averageRating: 4.6,
      reviewCount: 8,
    },
    {
      storeId: store1._id,
      vendorId: vendor1._id,
      title: 'HyperGlide Extended Desk Mat',
      slug: 'hyperglide-extended-desk-mat',
      description: 'Micro-woven smooth cloth surface with anti-fray stitched borders and non-slip rubberized base. Dimensions: 900mm x 400mm.',
      category: 'Accessories',
      price: 1199,
      stock: 110,
      images: [
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
      ],
      status: 'active',
      averageRating: 4.9,
      reviewCount: 24,
    },
    {
      storeId: store1._id,
      vendorId: vendor1._id,
      title: 'Custom Coiled Aviator Cable (USB-C)',
      slug: 'custom-coiled-aviator-cable-usb-c',
      description: 'Double-sleeved PET mesh braided coiled cable with detachable 4-pin zinc alloy aviator quick-release connector.',
      category: 'Accessories',
      price: 1499,
      stock: 80,
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      ],
      status: 'active',
      averageRating: 4.5,
      reviewCount: 6,
    },
    {
      storeId: store2._id,
      vendorId: vendor2._id,
      title: 'AuraStudio ANC Wireless Headphones',
      slug: 'aurastudio-anc-wireless-headphones',
      description: 'High-fidelity audio with 40mm custom planar drivers, hybrid active noise cancellation, transparency ambient mode, and 45-hour continuous playback.',
      category: 'Audio',
      price: 8999,
      stock: 30,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
      ],
      status: 'active',
      averageRating: 4.9,
      reviewCount: 18,
    },
    {
      storeId: store2._id,
      vendorId: vendor2._id,
      title: 'StreamCast Pro USB Condenser Mic',
      slug: 'streamcast-pro-usb-condenser-mic',
      description: 'Studio cardioid polar pattern with 24-bit/192kHz sampling resolution, built-in shock mount, tap-to-mute sensor, and zero-latency headphone monitoring.',
      category: 'Audio',
      price: 4499,
      stock: 55,
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      ],
      status: 'active',
      averageRating: 4.7,
      reviewCount: 14,
    },
    {
      storeId: store2._id,
      vendorId: vendor2._id,
      title: 'VocalPro Heavy-Duty Boom Arm',
      slug: 'vocalpro-heavy-duty-boom-arm',
      description: 'All-metal internal spring suspension arm with 360-degree rotation, hidden cable management channel, and robust desk C-clamp.',
      category: 'Accessories',
      price: 2199,
      stock: 75,
      images: [
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
      ],
      status: 'active',
      averageRating: 4.4,
      reviewCount: 9,
    },
    {
      storeId: store2._id,
      vendorId: vendor2._id,
      title: 'StudioMonitor Hi-Fi USB-C DAC Amp',
      slug: 'studiomonitor-hi-fi-usb-c-dac-amp',
      description: 'Dual ES9038Q2M SABRE DAC chips with balanced 4.4mm and unbalanced 3.5mm outputs. Supports DSD512 and PCM 32-bit/768kHz decoding.',
      category: 'Audio',
      price: 5499,
      stock: 25,
      images: [
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      ],
      status: 'active',
      averageRating: 4.8,
      reviewCount: 11,
    },
  ];

  const createdProducts = await Product.insertMany(productsData);
  console.log(`Inserted ${createdProducts.length} catalog products.`);

  // Sync to Elasticsearch
  for (const prod of createdProducts) {
    try {
      await ProductSearchService.indexProduct(prod);
    } catch (e) {
      // Graceful note
    }
  }

  console.log('Creating promotional coupons...');
  // 4. Seed Coupons
  const couponsData = [
    {
      code: 'SAVE10',
      type: 'percentage',
      value: 10,
      minCartValue: 1000,
      maxDiscount: 500,
      expiry: futureExpiryDate,
      usageLimit: 1000,
      usageCount: 42,
      isActive: true,
    },
    {
      code: 'TECH100',
      type: 'fixed',
      value: 100,
      minCartValue: 500,
      expiry: futureExpiryDate,
      usageLimit: 500,
      usageCount: 18,
      isActive: true,
    },
    {
      code: 'FESTIVE500',
      type: 'fixed',
      value: 500,
      minCartValue: 2500,
      expiry: futureExpiryDate,
      usageLimit: 250,
      usageCount: 9,
      isActive: true,
    },
  ];
  await Coupon.insertMany(couponsData);

  console.log('Seeding sample multi-vendor order & payment...');
  // 5. Seed Multi-Vendor Sample Completed Order
  const item1 = createdProducts[0]; // Apex Pro (Store 1, ₹6499)
  const item2 = createdProducts[5]; // StreamCast Mic (Store 2, ₹4499)

  const sampleOrder = new Order({
    orderNumber: `ORD-${Date.now().toString().slice(-8)}-1001`,
    customerId: customer1._id,
    items: [
      {
        productId: item1._id,
        storeId: store1._id,
        vendorId: vendor1._id,
        title: item1.title,
        price: item1.price,
        quantity: 1,
        itemSubtotal: 6499,
        fulfillmentStatus: 'delivered',
        trackingNumber: 'TRK-IND-998811',
      },
      {
        productId: item2._id,
        storeId: store2._id,
        vendorId: vendor2._id,
        title: item2.title,
        price: item2.price,
        quantity: 1,
        itemSubtotal: 4499,
        fulfillmentStatus: 'delivered',
        trackingNumber: 'TRK-IND-998822',
      },
    ],
    shippingAddress: {
      fullName: 'Raj Patel',
      addressLine1: '42 MG Road',
      addressLine2: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India',
      phone: '9876543210',
    },
    totals: {
      subtotal: 10998,
      discount: 500,
      shipping: 0,
      tax: 0,
      grandTotal: 10498,
    },
    appliedCoupon: {
      code: 'FESTIVE500',
      discountAmount: 500,
    },
    paymentStatus: 'paid',
    overallStatus: 'completed',
  });
  await sampleOrder.save();

  // 6. Seed Payment Record with 10% Commission Breakdown
  const samplePayment = new Payment({
    orderId: sampleOrder._id,
    customerId: customer1._id,
    provider: 'razorpay',
    providerOrderId: 'order_rzp_seed_demo_101',
    paymentId: 'pay_rzp_seed_demo_202',
    amount: 10498,
    currency: 'INR',
    platformCommissionPercentage: 10,
    totalCommissionAmount: 1100, // ~10% of 10998
    transfers: [
      {
        vendorId: vendor1._id,
        storeId: store1._id,
        grossAmount: 6499,
        commissionRate: 10,
        commissionAmount: 650,
        netPayout: 5849,
        transferStatus: 'processed',
      },
      {
        vendorId: vendor2._id,
        storeId: store2._id,
        grossAmount: 4499,
        commissionRate: 10,
        commissionAmount: 450,
        netPayout: 4049,
        transferStatus: 'processed',
      },
    ],
    status: 'captured',
  });
  await samplePayment.save();

  // 7. Seed Verified Review
  const sampleReview = new Review({
    customerId: customer1._id,
    productId: item1._id,
    orderId: sampleOrder._id,
    rating: 5,
    comment: 'Exceptional build quality! The switches feel sublime and the multi-vendor delivery was prompt and well packaged.',
    status: 'published',
  });
  await sampleReview.save();

  console.log('Database seeding finished successfully!\n');
  console.log('=== SEEDED DEMO CREDENTIALS ===');
  console.log('Admin Account:    admin@techmart.local     / AdminPass123!');
  console.log('Vendor 1 Store:   vendor1@techmart.local   / VendorPass123!  (TechPulse Gear)');
  console.log('Vendor 2 Store:   vendor2@techmart.local   / VendorPass123!  (AudioPro Studio)');
  console.log('Pending Vendor:   pending@techmart.local   / VendorPass123!  (NextGen Robotics)');
  console.log('Customer Account: customer@example.com     / CustomerPass123!');
  console.log('Active Coupons:   SAVE10 (10% off), TECH100 (Rs. 100 off), FESTIVE500 (Rs. 500 off)');
  console.log('===============================\n');

  await mongoose.disconnect();
}

seedDatabase().catch((err) => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
