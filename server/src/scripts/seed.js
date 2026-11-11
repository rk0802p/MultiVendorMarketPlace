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

const futureExpiryDate = new Date(Date.now() + 90 * 24 * 3600 * 1000);

const slugify = (text = '') =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);

const mapExternalCategory = (rawCategory = '') => {
  const cat = rawCategory.toLowerCase();
  if (['smartphones', 'tablets'].includes(cat)) return 'Mobile & Tablets';
  if (['laptops'].includes(cat)) return 'Computers & Accessories';
  if (['mobile-accessories', 'electronics'].includes(cat)) return 'Electronics';
  if (['mens-watches', 'womens-watches', 'sunglasses'].includes(cat)) return 'Wearables';
  if (['home-decoration', 'furniture', 'kitchen-accessories'].includes(cat)) return 'Smart Home';
  return 'Fashion & Lifestyle';
};

async function fetchJsonWithTimeout(url, timeoutMs = 6000) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from ${url}`);
    }
    return await response.json();
  } catch (err) {
    console.warn(`[Seed Reference Notice] Skipped ${url}: ${err.message}`);
    return null;
  }
}

async function seedDatabase() {
  const curatedOnly = process.argv.includes('--curated-only');

  console.log('--- Multi-Vendor Marketplace Database Seeding ---');
  console.log(`Connecting to MongoDB at: ${config.mongodb.uri}`);

  await mongoose.connect(config.mongodb.uri);
  console.log('Connected to MongoDB successfully.');

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
  const admin = await new User({
    name: 'Marketplace Admin',
    email: 'admin@techmart.local',
    passwordHash: 'AdminPass123!',
    role: 'admin',
    status: 'active',
  }).save();

  const vendor1 = await new User({
    name: 'Aarav Mehta',
    email: 'vendor1@techmart.local',
    passwordHash: 'VendorPass123!',
    role: 'vendor',
    status: 'active',
  }).save();

  const vendor2 = await new User({
    name: 'Priya Sharma',
    email: 'vendor2@techmart.local',
    passwordHash: 'VendorPass123!',
    role: 'vendor',
    status: 'active',
  }).save();

  const vendor3 = await new User({
    name: 'Rohan Kapoor',
    email: 'vendor3@techmart.local',
    passwordHash: 'VendorPass123!',
    role: 'vendor',
    status: 'active',
  }).save();

  const vendorPending = await new User({
    name: 'Karan Verma',
    email: 'pending@techmart.local',
    passwordHash: 'VendorPass123!',
    role: 'customer',
    status: 'active',
  }).save();

  const customer1 = await new User({
    name: 'Raj Patel',
    email: 'customer@example.com',
    passwordHash: 'CustomerPass123!',
    role: 'customer',
    status: 'active',
  }).save();

  const reviewerCustomers = await Promise.all([
    new User({
      name: 'Sneha Reddy',
      email: 'sneha@example.com',
      passwordHash: 'CustomerPass123!',
      role: 'customer',
      status: 'active',
    }).save(),
    new User({
      name: 'Ananya Nair',
      email: 'ananya@example.com',
      passwordHash: 'CustomerPass123!',
      role: 'customer',
      status: 'active',
    }).save(),
    new User({
      name: 'Vikram Joshi',
      email: 'vikram@example.com',
      passwordHash: 'CustomerPass123!',
      role: 'customer',
      status: 'active',
    }).save(),
    new User({
      name: 'Meera Iyer',
      email: 'meera@example.com',
      passwordHash: 'CustomerPass123!',
      role: 'customer',
      status: 'active',
    }).save(),
  ]);

  console.log('Creating vendor stores...');
  const store1 = await new Store({
    ownerId: vendor1._id,
    name: 'TechPulse Gear',
    slug: 'techpulse-gear',
    description: 'Precision mechanical keyboards, laptops, mobile tech, and high-DPI gaming gear.',
    status: 'approved',
  }).save();

  const store2 = await new Store({
    ownerId: vendor2._id,
    name: 'AudioPro Studio',
    slug: 'audiopro-studio',
    description: 'Studio-grade wireless headphones, microphones, smart home electronics, and DAC amps.',
    status: 'approved',
  }).save();

  const store3 = await new Store({
    ownerId: vendor3._id,
    name: 'UrbanCraft Lifestyle',
    slug: 'urbancraft-lifestyle',
    description: 'Curated watches, wearables, home essentials, and contemporary lifestyle goods.',
    status: 'approved',
  }).save();

  await new Store({
    ownerId: vendorPending._id,
    name: 'NextGen Robotics Store',
    slug: 'nextgen-robotics',
    description: 'Educational maker kits, robotics sensors, and development boards.',
    status: 'pending',
  }).save();

  const selectStoreForCategory = (category, idx = 0) => {
    if (['Gaming Gear', 'Computers & Accessories', 'Mobile & Tablets'].includes(category)) {
      return { storeId: store1._id, vendorId: vendor1._id };
    }
    if (['Audio & Headphones', 'Smart Home'].includes(category)) {
      return { storeId: store2._id, vendorId: vendor2._id };
    }
    if (category === 'Electronics') {
      return idx % 2 === 0
        ? { storeId: store1._id, vendorId: vendor1._id }
        : { storeId: store2._id, vendorId: vendor2._id };
    }
    return { storeId: store3._id, vendorId: vendor3._id };
  };

  console.log('Preparing curated flagship catalog...');
  const curatedProducts = [
    {
      storeId: store1._id,
      vendorId: vendor1._id,
      title: 'Apex Pro RGB Mechanical Keyboard',
      slug: 'apex-pro-rgb-mechanical-keyboard',
      description: 'Aircraft-grade aluminum chassis with hot-swappable tactile mechanical switches, per-key RGB illumination, and detachable USB-C braided cable.',
      category: 'Gaming Gear',
      price: 6499,
      stock: 40,
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80',
      ],
      status: 'active',
      averageRating: 5,
      reviewCount: 1,
    },
    {
      storeId: store1._id,
      vendorId: vendor1._id,
      title: 'Quantum Wireless Ergonomic Mouse',
      slug: 'quantum-wireless-ergonomic-mouse',
      description: 'Ultra-lightweight 58g wireless gaming mouse with 26,000 DPI optical sensor, pure PTFE glides, and 80-hour rechargeable battery life.',
      category: 'Gaming Gear',
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
      category: 'Computers & Accessories',
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
      category: 'Computers & Accessories',
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
      category: 'Audio & Headphones',
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
      category: 'Audio & Headphones',
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
      category: 'Audio & Headphones',
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
      category: 'Electronics',
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

  const externalProducts = [];
  const externalReviewQueue = [];

  if (!curatedOnly) {
    console.log('Fetching optional reference datasets (DummyJSON & Fake Store API)...');

    // 1. DummyJSON (Rich multi-category products + nested reviews)
    const dummyData = await fetchJsonWithTimeout('https://dummyjson.com/products?limit=40');
    if (dummyData?.products && Array.isArray(dummyData.products)) {
      console.log(`Loaded ${dummyData.products.length} reference products from DummyJSON.`);
      dummyData.products.forEach((p, idx) => {
        const mappedCategory = mapExternalCategory(p.category);
        const owner = selectStoreForCategory(mappedCategory, idx);
        const inrPrice = Math.max(199, Math.round((Number(p.price) || 15) * 85));
        const images = Array.isArray(p.images) && p.images.length > 0
          ? p.images.slice(0, 3)
          : p.thumbnail
            ? [p.thumbnail]
            : [];

        const slug = `${slugify(p.title)}-dj-${p.id || idx}`;
        const rawReviews = Array.isArray(p.reviews) ? p.reviews : [];

        externalProducts.push({
          ...owner,
          title: (p.title || 'Marketplace Item').slice(0, 190),
          slug,
          description: p.description || 'Quality marketplace item.',
          category: mappedCategory,
          price: inrPrice,
          stock: Math.max(5, parseInt(p.stock, 10) || 25),
          images,
          status: 'active',
          averageRating: Number(p.rating) ? Math.min(5, Math.max(1, Math.round(Number(p.rating) * 10) / 10)) : 4.2,
          reviewCount: rawReviews.length,
          _sourceReviews: rawReviews,
        });
      });
    }

    // 2. Fake Store API (Electronics, Jewelery & Fashion)
    const fakeStoreData = await fetchJsonWithTimeout('https://fakestoreapi.com/products');
    if (Array.isArray(fakeStoreData)) {
      console.log(`Loaded ${fakeStoreData.length} reference products from Fake Store API.`);
      fakeStoreData.forEach((p, idx) => {
        const mappedCategory = mapExternalCategory(p.category);
        const owner = selectStoreForCategory(mappedCategory, idx + 1);
        const inrPrice = Math.max(249, Math.round((Number(p.price) || 20) * 85));
        const slug = `${slugify(p.title)}-fs-${p.id || idx}`;

        externalProducts.push({
          ...owner,
          title: (p.title || 'Catalog Product').slice(0, 190),
          slug,
          description: p.description || 'Featured marketplace product.',
          category: mappedCategory,
          price: inrPrice,
          stock: 15 + ((idx * 7) % 60),
          images: p.image ? [p.image] : [],
          status: 'active',
          averageRating: Number(p.rating?.rate) ? Math.min(5, Math.max(1, Number(p.rating.rate))) : 4.3,
          reviewCount: parseInt(p.rating?.count, 10) || 0,
        });
      });
    }
  }

  // Extract attached _sourceReviews before Mongoose insertMany
  const reviewMetadataBySlug = new Map();
  const cleanExternalProducts = externalProducts.map(({ _sourceReviews, ...prod }) => {
    if (_sourceReviews && _sourceReviews.length > 0) {
      reviewMetadataBySlug.set(prod.slug, _sourceReviews);
    }
    return prod;
  });

  const allProductDocs = [...curatedProducts, ...cleanExternalProducts];
  const createdProducts = await Product.insertMany(allProductDocs);
  console.log(
    `Inserted ${createdProducts.length} total catalog products (${curatedProducts.length} curated + ${cleanExternalProducts.length} reference).`
  );

  // Sync catalog to Elasticsearch if available
  let esSynced = 0;
  for (const prod of createdProducts) {
    try {
      await ProductSearchService.indexProduct(prod);
      esSynced += 1;
    } catch {
      // Elasticsearch offline fallback is safe
    }
  }
  if (esSynced > 0) {
    console.log(`Indexed ${esSynced} products into Elasticsearch.`);
  }

  console.log('Creating promotional coupons...');
  await Coupon.insertMany([
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
  ]);

  console.log('Seeding sample multi-vendor orders, payments, and verified reviews...');
  const item1 = createdProducts[0]; // Apex Pro (Store 1)
  const item2 = createdProducts[5]; // StreamCast Mic (Store 2)

  const sampleOrder = await new Order({
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
        itemSubtotal: item1.price,
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
        itemSubtotal: item2.price,
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
      subtotal: item1.price + item2.price,
      discount: 500,
      shipping: 0,
      tax: 0,
      grandTotal: item1.price + item2.price - 500,
    },
    appliedCoupon: {
      code: 'FESTIVE500',
      discountAmount: 500,
    },
    paymentStatus: 'paid',
    overallStatus: 'completed',
  }).save();

  const comm1 = Math.round(item1.price * 0.1);
  const comm2 = Math.round(item2.price * 0.1);
  await new Payment({
    orderId: sampleOrder._id,
    customerId: customer1._id,
    provider: 'razorpay',
    providerOrderId: 'order_rzp_seed_demo_101',
    paymentId: 'pay_rzp_seed_demo_202',
    amount: sampleOrder.totals.grandTotal,
    currency: 'INR',
    platformCommissionPercentage: 10,
    totalCommissionAmount: comm1 + comm2,
    transfers: [
      {
        vendorId: vendor1._id,
        storeId: store1._id,
        grossAmount: item1.price,
        commissionRate: 10,
        commissionAmount: comm1,
        netPayout: item1.price - comm1,
        transferStatus: 'processed',
      },
      {
        vendorId: vendor2._id,
        storeId: store2._id,
        grossAmount: item2.price,
        commissionRate: 10,
        commissionAmount: comm2,
        netPayout: item2.price - comm2,
        transferStatus: 'processed',
      },
    ],
    status: 'captured',
  }).save();

  // Primary customer verified review for Apex Pro Keyboard
  await new Review({
    customerId: customer1._id,
    productId: item1._id,
    orderId: sampleOrder._id,
    rating: 5,
    comment: 'Exceptional build quality! The switches feel sublime and the multi-vendor delivery was prompt and well packaged.',
    status: 'published',
  }).save();

  // Seed verified customer reviews mapped from DummyJSON reviews on the top reference products
  let seededExternalReviewsCount = 0;
  const externalDocsWithReviews = createdProducts
    .filter((p) => reviewMetadataBySlug.has(p.slug))
    .slice(0, 20);

  if (externalDocsWithReviews.length > 0) {
    // Create one completed batch order per reviewer customer so reviews satisfy verified purchase checks
    const reviewerBatchOrders = await Promise.all(
      reviewerCustomers.map((reviewer, rIdx) => {
        const orderItems = externalDocsWithReviews.map((prod) => ({
          productId: prod._id,
          storeId: prod.storeId,
          vendorId: prod.vendorId,
          title: prod.title,
          price: prod.price,
          quantity: 1,
          itemSubtotal: prod.price,
          fulfillmentStatus: 'delivered',
          trackingNumber: `TRK-REF-${1000 + rIdx}`,
        }));
        const batchSubtotal = orderItems.reduce((sum, i) => sum + i.itemSubtotal, 0);

        return new Order({
          orderNumber: `ORD-REF-${Date.now().toString().slice(-6)}-${rIdx + 1}`,
          customerId: reviewer._id,
          items: orderItems,
          shippingAddress: {
            fullName: reviewer.name,
            addressLine1: '100 Residency Road',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560025',
            country: 'India',
            phone: '9876543219',
          },
          totals: {
            subtotal: batchSubtotal,
            discount: 0,
            shipping: 0,
            tax: 0,
            grandTotal: batchSubtotal,
          },
          paymentStatus: 'paid',
          overallStatus: 'completed',
        }).save();
      })
    );

    const reviewsToInsert = [];
    for (const prod of externalDocsWithReviews) {
      const sourceReviews = reviewMetadataBySlug.get(prod.slug) || [];
      sourceReviews.slice(0, reviewerCustomers.length).forEach((rev, idx) => {
        const ratingVal = Math.min(5, Math.max(1, Math.round(Number(rev.rating) || 5)));
        reviewsToInsert.push({
          customerId: reviewerCustomers[idx]._id,
          productId: prod._id,
          orderId: reviewerBatchOrders[idx]._id,
          rating: ratingVal,
          comment: (rev.comment || 'Great value and reliable seller experience.').slice(0, 950),
          status: 'published',
        });
      });
    }

    if (reviewsToInsert.length > 0) {
      await Review.insertMany(reviewsToInsert);
      seededExternalReviewsCount = reviewsToInsert.length;

      // Sync exact averageRating and reviewCount on those reviewed products
      for (const prod of externalDocsWithReviews) {
        const prodReviews = reviewsToInsert.filter((r) => r.productId.equals(prod._id));
        if (prodReviews.length > 0) {
          const avg = prodReviews.reduce((acc, r) => acc + r.rating, 0) / prodReviews.length;
          await Product.findByIdAndUpdate(prod._id, {
            averageRating: Math.round(avg * 10) / 10,
            reviewCount: prodReviews.length,
          });
        }
      }
    }
  }

  console.log(`Seeded ${1 + seededExternalReviewsCount} verified product reviews.`);
  console.log('Database seeding finished successfully!\n');
  console.log('=== SEEDED DEMO CREDENTIALS ===');
  console.log('Admin Account:    admin@techmart.local     / AdminPass123!');
  console.log('Vendor 1 Store:   vendor1@techmart.local   / VendorPass123!  (TechPulse Gear)');
  console.log('Vendor 2 Store:   vendor2@techmart.local   / VendorPass123!  (AudioPro Studio)');
  console.log('Vendor 3 Store:   vendor3@techmart.local   / VendorPass123!  (UrbanCraft Lifestyle)');
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
