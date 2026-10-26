import { Product } from '../../models/Product.js';
import { Store } from '../../models/Store.js';

export class ProductService {
  /**
   * Create a new product listing (Approved Vendors only)
   */
  static async createProduct(vendorUserId, data) {
    // 1. Verify vendor owns an approved store
    const store = await Store.findOne({ ownerId: vendorUserId });
    if (!store) {
      const error = new Error('No store found for your account. Please apply for a store first.');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    if (store.approvalStatus !== 'approved') {
      const error = new Error(
        `Your store is currently "${store.approvalStatus}". Only approved vendors can create and publish products.`
      );
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    // 2. Generate unique slug
    const baseSlug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${baseSlug}-${randomSuffix}`;

    const product = new Product({
      ...data,
      slug,
      storeId: store._id,
      vendorId: vendorUserId,
      status: data.status || 'active',
    });

    await product.save();
    return product;
  }

  /**
   * Update an existing product listing (verifies ownership)
   */
  static async updateProduct(productId, user, updateData) {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found.');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Verify ownership: vendor owns product or is admin
    if (user.role !== 'admin' && product.vendorId.toString() !== user.id.toString()) {
      const error = new Error('Forbidden: You can only modify products belonging to your store.');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    const allowedFields = ['title', 'description', 'category', 'price', 'stock', 'images', 'status'];
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        product[field] = updateData[field];
      }
    }

    await product.save();
    return product;
  }

  /**
   * Archive product (soft delete with ownership check)
   */
  static async archiveProduct(productId, user) {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Product not found.');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (user.role !== 'admin' && product.vendorId.toString() !== user.id.toString()) {
      const error = new Error('Forbidden: You can only archive products belonging to your store.');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    product.status = 'archived';
    await product.save();

    return product;
  }

  /**
   * Get single product by ID or slug
   */
  static async getProductById(idOrSlug) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    const filter = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

    const product = await Product.findOne(filter)
      .populate('storeId', 'name slug logo approvalStatus')
      .populate('vendorId', 'name email');

    if (!product) {
      const error = new Error('Product not found.');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    return product;
  }

  /**
   * Browse active products for customer catalogue
   */
  static async getProducts(query = {}) {
    const filter = { status: 'active' };

    // Keyword search across title and description
    if (query.q) {
      filter.$or = [
        { title: { $regex: query.q, $options: 'i' } },
        { description: { $regex: query.q, $options: 'i' } },
      ];
    }

    // Category filter
    if (query.category) {
      filter.category = query.category;
    }

    // Store filter
    if (query.storeId) {
      filter.storeId = query.storeId;
    }

    // Price range
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined) filter.price.$gte = Number(query.minPrice);
      if (query.maxPrice !== undefined) filter.price.$lte = Number(query.maxPrice);
    }

    // Sorting
    let sort = { createdAt: -1 };
    if (query.sort === 'price_asc') sort = { price: 1 };
    else if (query.sort === 'price_desc') sort = { price: -1 };
    else if (query.sort === 'newest') sort = { createdAt: -1 };
    else if (query.sort === 'rating') sort = { averageRating: -1 };

    // Pagination
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 12));
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('storeId', 'name slug logo')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get authenticated vendor's products (including active, draft, archived)
   */
  static async getVendorProducts(vendorUserId, query = {}) {
    const filter = { vendorId: vendorUserId };

    if (query.status) {
      filter.status = query.status;
    } else {
      filter.status = { $ne: 'archived' }; // Exclude archived by default unless requested
    }

    const products = await Product.find(filter)
      .populate('storeId', 'name slug')
      .sort({ createdAt: -1 });

    return products;
  }
}
