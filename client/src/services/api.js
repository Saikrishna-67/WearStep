const isNative = typeof window !== 'undefined' && Boolean(window.Capacitor?.isNativePlatform?.());

const API_BASE = isNative && import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const getHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  const authToken = token || localStorage.getItem('wearstep_token');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const api = {
  // Auth
  login: (email, password) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    }).then(handleResponse),

  register: (name, email, password) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password }),
    }).then(handleResponse),

  adminLogin: (email, password) =>
    fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    }).then(handleResponse),

  getMe: (token) =>
    fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(token),
    }).then(handleResponse),

  updateProfile: (name) =>
    fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    }).then(handleResponse),

  forgotPassword: (email) =>
    fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    }).then(handleResponse),

  verifyOtp: (email, otp) =>
    fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, otp }),
    }).then(handleResponse),

  resetPassword: (email, otp, newPassword) =>
    fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, otp, newPassword }),
    }).then(handleResponse),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return fetch(`${API_BASE}/products?${query.toString()}`).then(handleResponse);
  },

  getFeatured: () => fetch(`${API_BASE}/products/featured`).then(handleResponse),
  getNewArrivals: () => fetch(`${API_BASE}/products/new-arrivals`).then(handleResponse),
  getOffers: () => fetch(`${API_BASE}/products/offers`).then(handleResponse),
  getProductById: (id) => fetch(`${API_BASE}/products/${id}`).then(handleResponse),

  addReview: (productId, rating, comment) =>
    fetch(`${API_BASE}/products/${productId}/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rating, comment }),
    }).then(handleResponse),

  // Cart validation
  validateCart: (items) =>
    fetch(`${API_BASE}/cart/validate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ items }),
    }).then(handleResponse),

  // Wishlist
  getWishlist: () =>
    fetch(`${API_BASE}/wishlist`, {
      headers: getHeaders(),
    }).then(handleResponse),

  toggleWishlist: (productId) =>
    fetch(`${API_BASE}/wishlist/toggle`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId }),
    }).then(handleResponse),

  // Orders
  createOrder: (orderData) =>
    fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    }).then(handleResponse),

  getMyOrders: () =>
    fetch(`${API_BASE}/orders/my-orders`, {
      headers: getHeaders(),
    }).then(handleResponse),

  getOrderById: (orderId) =>
    fetch(`${API_BASE}/orders/${orderId}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  cancelOrder: (orderId) =>
    fetch(`${API_BASE}/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: getHeaders(),
    }).then(handleResponse),

  // Coupons
  validateCoupon: (code, subtotal) =>
    fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code, subtotal }),
    }).then(handleResponse),

  // Admin
  getDashboardStats: () =>
    fetch(`${API_BASE}/admin/dashboard`, {
      headers: getHeaders(),
    }).then(handleResponse),

  getAdminProducts: () =>
    fetch(`${API_BASE}/admin/products`, {
      headers: getHeaders(),
    }).then(handleResponse),

  createProduct: (data) =>
    fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateProduct: (id, data) =>
    fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteProduct: (id) =>
    fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),

  getAdminOrders: (status) => {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return fetch(`${API_BASE}/admin/orders${q}`, {
      headers: getHeaders(),
    }).then(handleResponse);
  },

  updateOrderStatus: (id, status) =>
    fetch(`${API_BASE}/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    }).then(handleResponse),

  getCustomers: () =>
    fetch(`${API_BASE}/admin/customers`, {
      headers: getHeaders(),
    }).then(handleResponse),

  getCoupons: () =>
    fetch(`${API_BASE}/admin/coupons`, {
      headers: getHeaders(),
    }).then(handleResponse),

  createCoupon: (data) =>
    fetch(`${API_BASE}/admin/coupons`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteCoupon: (id) =>
    fetch(`${API_BASE}/admin/coupons/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),

  getInventory: () =>
    fetch(`${API_BASE}/admin/inventory`, {
      headers: getHeaders(),
    }).then(handleResponse),
};
