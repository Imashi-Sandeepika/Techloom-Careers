import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
if (API_URL && !API_URL.endsWith('/api')) {
  API_URL = API_URL.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productApi = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const cartApi = {
  create: () => api.post('/carts'),
  get: (id) => api.get(`/carts/${id}`),
  addItem: (cartId, item) => api.post(`/carts/${cartId}/items`, item),
  updateItem: (cartId, itemId, data) => api.put(`/carts/${cartId}/items/${itemId}`, data),
  removeItem: (cartId, itemId) => api.delete(`/carts/${cartId}/items/${itemId}`),
};

export const checkoutApi = {
  process: (cartId) => api.post('/checkout', { cart_id: cartId }),
};

export const paymentApi = {
  process: (data) => api.post('/payments', data),
  refund: (id) => api.post(`/payments/${id}/refund`),
};

export const orderApi = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
};

export const reservationApi = {
  getAll: () => api.get('/reservations'),
  expire: (id) => api.post(`/reservations/${id}/expire`),
};

export default api;
