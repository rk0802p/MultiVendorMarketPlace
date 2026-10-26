import { Store } from '../../models/Store.js';
import { User } from '../../models/User.js';

export class VendorService {
  /**
   * Submit an application for a vendor store
   */
  static async applyForStore(userId, { name, slug, description, contactEmail, contactPhone }) {
    // Check if user already owns a store
    const existingStore = await Store.findOne({ ownerId: userId });
    if (existingStore) {
      const error = new Error('You have already submitted an application for a vendor store.');
      error.statusCode = 409;
      error.isOperational = true;
      throw error;
    }

    // Generate slug from name if not provided
    const storeSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Check slug uniqueness
    const existingSlug = await Store.findOne({ slug: storeSlug });
    if (existingSlug) {
      const error = new Error('A store with this slug already exists. Please choose a different slug.');
      error.statusCode = 409;
      error.isOperational = true;
      throw error;
    }

    const store = new Store({
      ownerId: userId,
      name,
      slug: storeSlug,
      description: description || '',
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      approvalStatus: 'pending',
      paymentOnboardingStatus: 'not_started',
    });

    await store.save();

    return store;
  }

  /**
   * Get authenticated vendor's store
   */
  static async getVendorStore(userId) {
    const store = await Store.findOne({ ownerId: userId }).populate('ownerId', 'name email role');
    if (!store) {
      const error = new Error('Vendor store profile not found.');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    return store;
  }

  /**
   * Update authenticated vendor's store profile
   */
  static async updateVendorStore(userId, updateData) {
    const store = await Store.findOne({ ownerId: userId });
    if (!store) {
      const error = new Error('Vendor store not found.');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Apply allowed updates
    const allowedFields = ['name', 'description', 'logo', 'banner', 'contactEmail', 'contactPhone'];
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        store[field] = updateData[field];
      }
    }

    await store.save();
    return store;
  }

  /**
   * Admin: Approve or Reject a vendor store
   */
  static async updateStoreStatus(storeId, status, rejectionReason = '') {
    const store = await Store.findById(storeId);
    if (!store) {
      const error = new Error('Store not found.');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    store.approvalStatus = status;
    if (status === 'rejected') {
      store.rejectionReason = rejectionReason;
    } else if (status === 'approved') {
      store.rejectionReason = '';
      // Ensure owner's user account role is set to vendor
      await User.findByIdAndUpdate(store.ownerId, { role: 'vendor' });
    }

    await store.save();
    return store;
  }

  /**
   * List all stores (for directory or admin)
   */
  static async getStores(query = {}) {
    const filter = {};
    if (query.status) {
      filter.approvalStatus = query.status;
    }

    const stores = await Store.find(filter)
      .populate('ownerId', 'name email role')
      .sort({ createdAt: -1 });

    return stores;
  }

  /**
   * Get public store profile by ID or slug
   */
  static async getPublicStore(idOrSlug) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    const filter = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

    const store = await Store.findOne(filter).populate('ownerId', 'name');
    if (!store) {
      const error = new Error('Store not found.');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    return store;
  }
}
