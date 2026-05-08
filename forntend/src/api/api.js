import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Attach JWT ─────────────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auto-refresh on 401 ────────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/api/users/token/refresh/`, { refresh });
          localStorage.setItem('access_token', data.access);
          orig.headers.Authorization = `Bearer ${data.access}`;
          return api(orig);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ───────────────────────────────────────────────────────────────────────
export const sendOtp     = (mobile) => api.post('/api/users/request-otp/', { mobile });
export const verifyOtp   = (mobile, otp) => api.post('/api/users/verify-otp/', { mobile, otp });
export const requestOTP  = sendOtp;   // alias
export const verifyOTP   = verifyOtp; // alias
export const getProfile  = () => api.get('/api/users/profile/');
export const updateProfile = (data) => api.patch('/api/users/profile/', data);

// ── Addresses ──────────────────────────────────────────────────────────────────
export const getAddresses   = () => api.get('/api/users/addresses/');
export const addAddress     = (data) => api.post('/api/users/addresses/', data);
export const updateAddress  = (id, data) => api.patch(`/api/users/addresses/${id}/`, data);
export const deleteAddress  = (id) => api.delete(`/api/users/addresses/${id}/`);
export const setDefaultAddress = (id) => api.patch(`/api/users/addresses/${id}/`, { is_default: true });

// ── Products ───────────────────────────────────────────────────────────────────
export const getProducts      = (params = {}) => api.get('/api/products/', { params });
export const getProductDetail = (id) => api.get(`/api/products/${id}/`);
export const getCategories    = () => api.get('/api/products/categories/');

// ── Cart ───────────────────────────────────────────────────────────────────────
export const getCart        = () => api.get('/api/cart/');
export const addToCart      = (product_variant_id, quantity = 1) =>
  api.post('/api/cart/add/', { product_variant_id, quantity });
export const updateCartItem = (item_id, quantity) =>
  api.put(`/api/cart/update/${item_id}/`, { quantity });
export const removeCartItem = (item_id) => api.delete(`/api/cart/remove/${item_id}/`);
export const clearCart      = () => api.delete('/api/cart/clear/');

// ── Orders ─────────────────────────────────────────────────────────────────────
export const checkout       = (data) => api.post('/api/orders/checkout/', data);
export const getOrders      = () => api.get('/api/orders/');
export const getOrderDetail = (id) => api.get(`/api/orders/${id}/`);
export const cancelOrder    = (id) => api.post(`/api/orders/${id}/cancel/`);
export const getInvoiceUrl  = (id) => `${BASE_URL}/api/orders/${id}/invoice/`;

// ── Content (homepage sections) ────────────────────────────────────────────────
// Public endpoints — no auth needed
const publicApi = axios.create({ baseURL: BASE_URL });

export const getAllContent     = () => publicApi.get('/api/content/');
export const getHeroSlides     = () => publicApi.get('/api/content/hero-slides/');
export const getQuickCategories= () => publicApi.get('/api/content/quick-categories/');
export const getAgeGroups      = () => publicApi.get('/api/content/age-groups/');
export const getTrustItems     = () => publicApi.get('/api/content/trust-items/');
export const getFeatureCards   = () => publicApi.get('/api/content/feature-cards/');
export const getStoreInfo      = () => publicApi.get('/api/content/store-info/');

export default api;
