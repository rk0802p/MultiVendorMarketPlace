import { getRedisClient } from '../../config/redis.js';
import { Product } from '../../models/Product.js';

// In-memory fallback cart cache for environments where Redis is unavailable
const memoryCartStore = new Map();

export class CartService {
  static getCartKey(userId) {
    return `cart:user:${userId}`;
  }

  /**
   * Helper: Read raw items [{ productId, quantity }] from Redis or Memory
   */
  static async getRawCartItems(userId) {
    const key = this.getCartKey(userId);
    try {
      const redis = await getRedisClient();
      if (redis && redis.isOpen) {
        const raw = await redis.get(key);
        return raw ? JSON.parse(raw) : [];
      }
    } catch (err) {
      console.warn('[CartService] Redis read failed, using memory fallback:', err.message);
    }
    return memoryCartStore.get(key) || [];
  }

  /**
   * Helper: Save raw items [{ productId, quantity }] to Redis or Memory with TTL (604800s)
   */
  static async saveRawCartItems(userId, items) {
    const key = this.getCartKey(userId);
    const ttlSeconds = 604800; // Cart retention TTL in seconds
    try {
      const redis = await getRedisClient();
      if (redis && redis.isOpen) {
        if (items.length === 0) {
          await redis.del(key);
        } else {
          await redis.set(key, JSON.stringify(items), { EX: ttlSeconds });
        }
        return;
      }
    } catch (err) {
      console.warn('[CartService] Redis write failed, using memory fallback:', err.message);
    }

    if (items.length === 0) {
      memoryCartStore.delete(key);
    } else {
      memoryCartStore.set(key, items);
    }
  }

  /**
   * Retrieve active shopping cart hydrated with real-time product prices and stock availability
   */
  static async getCart(userId) {
    const rawItems = await this.getRawCartItems(userId);
    if (!rawItems || rawItems.length === 0) {
      return {
        items: [],
        subtotal: 0,
        itemCount: 0,
        hasUnavailableItems: false,
      };
    }

    const productIds = rawItems.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } })
      .populate('storeId', 'name slug logo approvalStatus')
      .lean();

    const productMap = new Map();
    products.forEach((prod) => {
      productMap.set(prod._id.toString(), prod);
    });

    let subtotal = 0;
    let itemCount = 0;
    let hasUnavailableItems = false;

    const hydratedItems = rawItems.map((raw) => {
      const product = productMap.get(raw.productId.toString());

      if (!product || product.status !== 'active') {
        hasUnavailableItems = true;
        return {
          productId: raw.productId,
          quantity: raw.quantity,
          isAvailable: false,
          unavailableReason: 'Product is no longer available or has been removed',
          title: product ? product.title : 'Unavailable Product',
          price: 0,
          itemSubtotal: 0,
          stock: 0,
        };
      }

      const availableStock = product.stock;
      const isStockSufficient = availableStock >= raw.quantity;

      if (!isStockSufficient) {
        hasUnavailableItems = true;
      }

      const itemSubtotal = product.price * raw.quantity;
      if (isStockSufficient) {
        subtotal += itemSubtotal;
        itemCount += raw.quantity;
      }

      return {
        productId: product._id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        images: product.images || [],
        stock: product.stock,
        category: product.category,
        storeId: product.storeId?._id || product.storeId,
        storeName: product.storeId?.name || 'Verified Vendor',
        storeSlug: product.storeId?.slug || '',
        vendorId: product.vendorId,
        quantity: raw.quantity,
        isAvailable: isStockSufficient,
        unavailableReason: isStockSufficient
          ? null
          : availableStock === 0
          ? 'Out of stock'
          : `Only ${availableStock} item(s) available in stock`,
        itemSubtotal,
      };
    });

    return {
      items: hydratedItems,
      subtotal,
      itemCount,
      hasUnavailableItems,
    };
  }

  /**
   * Add a product to the customer's cart
   */
  static async addItem(userId, { productId, quantity = 1 }) {
    if (!productId) {
      const error = new Error('Product ID is required');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    const numQty = parseInt(quantity, 10);
    if (isNaN(numQty) || numQty < 1) {
      const error = new Error('Quantity must be an integer greater than or equal to 1');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    // Verify product exists and has stock
    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') {
      const error = new Error('Product is unavailable or cannot be purchased');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const rawItems = await this.getRawCartItems(userId);
    const existingIndex = rawItems.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    let newQuantity = numQty;
    if (existingIndex > -1) {
      newQuantity = rawItems[existingIndex].quantity + numQty;
      if (newQuantity > product.stock) {
        const error = new Error(
          `Cannot add ${numQty} more. Only ${product.stock} items in stock (you already have ${rawItems[existingIndex].quantity} in cart).`
        );
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
      }
      rawItems[existingIndex].quantity = newQuantity;
    } else {
      if (numQty > product.stock) {
        const error = new Error(`Requested quantity (${numQty}) exceeds available stock (${product.stock}).`);
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
      }
      rawItems.push({
        productId: product._id.toString(),
        quantity: numQty,
      });
    }

    await this.saveRawCartItems(userId, rawItems);
    return this.getCart(userId);
  }

  /**
   * Update quantity of a product in the cart
   */
  static async updateQuantity(userId, productId, quantity) {
    const numQty = parseInt(quantity, 10);

    if (isNaN(numQty) || numQty < 1) {
      // If quantity is 0 or negative, remove the item
      return this.removeItem(userId, productId);
    }

    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') {
      const error = new Error('Product is no longer available');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (numQty > product.stock) {
      const error = new Error(`Requested quantity (${numQty}) exceeds available stock (${product.stock})`);
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    const rawItems = await this.getRawCartItems(userId);
    const itemIndex = rawItems.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      const error = new Error('Item not found in cart');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    rawItems[itemIndex].quantity = numQty;
    await this.saveRawCartItems(userId, rawItems);
    return this.getCart(userId);
  }

  /**
   * Remove an item from the cart
   */
  static async removeItem(userId, productId) {
    const rawItems = await this.getRawCartItems(userId);
    const filtered = rawItems.filter(
      (item) => item.productId.toString() !== productId.toString()
    );
    await this.saveRawCartItems(userId, filtered);
    return this.getCart(userId);
  }

  /**
   * Clear entire cart for user
   */
  static async clearCart(userId) {
    await this.saveRawCartItems(userId, []);
    return {
      items: [],
      subtotal: 0,
      itemCount: 0,
      hasUnavailableItems: false,
    };
  }
}
