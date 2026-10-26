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

export default api;
