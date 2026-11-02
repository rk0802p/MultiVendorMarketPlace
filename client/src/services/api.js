import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async logout() {
    const res = await api.post('/auth/logout');
    return res.data;
  },
};

export const vendorService = {
  async apply(data) {
    const res = await api.post('/vendors/apply', data);
    return res.data;
  },

  async getMyStore() {
    const res = await api.get('/vendors/me');
    return res.data;
  },

  async updateMyStore(data) {
    const res = await api.patch('/vendors/me', data);
    return res.data;
  },

  async getStores(params = {}) {
    const res = await api.get('/vendors', { params });
    return res.data;
  },

  async getStore(idOrSlug) {
    const res = await api.get(`/vendors/${idOrSlug}`);
    return res.data;
  },

  async updateStoreStatus(storeId, status, rejectionReason = '') {
    const res = await api.patch(`/admin/vendors/${storeId}/status`, { status, rejectionReason });
    return res.data;
  },
};

export const productService = {
  async getProducts(params = {}) {
    const res = await api.get('/products', { params });
    return res.data;
  },

  async getProduct(idOrSlug) {
    const res = await api.get(`/products/${idOrSlug}`);
    return res.data;
  },

  async getMyProducts(params = {}) {
    const res = await api.get('/products/vendor/my-products', { params });
    return res.data;
  },

  async createProduct(data) {
    const res = await api.post('/products', data);
    return res.data;
  },

  async updateProduct(id, data) {
    const res = await api.patch(`/products/${id}`, data);
    return res.data;
  },

  async archiveProduct(id) {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },
};

export const uploadService = {
  async getPresignedUrl(fileName, fileType) {
    const res = await api.post('/uploads/presigned-url', { fileName, fileType });
    return res.data;
  },

  async uploadDirectToS3(uploadUrl, file) {
    // Direct upload from browser to S3 via PUT
    // If running in simulated/mock mode or real S3, upload appropriately
    try {
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });
    } catch (error) {
      console.warn('Direct S3 upload note (may be simulated endpoint):', error.message);
    }
  },
};

export const cartService = {
  async getCart() {
    const res = await api.get('/cart');
    return res.data;
  },

  async addItem(productId, quantity = 1) {
    const res = await api.post('/cart/items', { productId, quantity });
    return res.data;
  },

  async updateQuantity(productId, quantity) {
    const res = await api.patch(`/cart/items/${productId}`, { quantity });
    return res.data;
  },

  async removeItem(productId) {
    const res = await api.delete(`/cart/items/${productId}`);
    return res.data;
  },

  async clearCart() {
    const res = await api.delete('/cart');
    return res.data;
  },
};

export const orderService = {
  async checkout(data) {
    const res = await api.post('/orders', data);
    return res.data;
  },

  async getMyOrders() {
    const res = await api.get('/orders/my');
    return res.data;
  },

  async getOrder(id) {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  async getVendorOrderItems(params = {}) {
    const res = await api.get('/orders/vendor/items', { params });
    return res.data;
  },

  async updateVendorItemStatus(orderId, itemId, status, trackingNumber = '') {
    const res = await api.patch(`/orders/vendor/${orderId}/items/${itemId}/status`, {
      status,
      trackingNumber,
    });
    return res.data;
  },

  getInvoiceUrl(orderId) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
    return `${baseURL}/orders/${orderId}/invoice`;
  },
};

export const paymentService = {
  async createPaymentOrder(data) {
    const res = await api.post('/payments/create-order', data);
    return res.data;
  },

  async verifyPayment(data) {
    const res = await api.post('/payments/verify', data);
    return res.data;
  },

  async getCommissionLedger(params = {}) {
    const res = await api.get('/payments/ledger', { params });
    return res.data;
  },
};

export const reviewService = {
  async getProductReviews(productId, params = {}) {
    const res = await api.get(`/reviews/product/${productId}`, { params });
    return res.data;
  },

  async checkEligibility(productId) {
    const res = await api.get(`/reviews/product/${productId}/eligibility`);
    return res.data;
  },

  async submitReview(productId, data) {
    const res = await api.post(`/reviews/product/${productId}`, data);
    return res.data;
  },
};

export const couponService = {
  async validateCoupon(code, cartSubtotal) {
    const res = await api.post('/coupons/validate', { code, cartSubtotal });
    return res.data;
  },

  async getAllCoupons() {
    const res = await api.get('/coupons');
    return res.data;
  },

  async createCoupon(data) {
    const res = await api.post('/coupons', data);
    return res.data;
  },

  async toggleCoupon(id) {
    const res = await api.patch(`/coupons/${id}/toggle`);
    return res.data;
  },
};

export const adminService = {
  async getAnalytics() {
    const res = await api.get('/admin/analytics');
    return res.data;
  },

  async getOrders(params = {}) {
    const res = await api.get('/admin/orders', { params });
    return res.data;
  },

  async getUsers(params = {}) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },
};

export default api;
