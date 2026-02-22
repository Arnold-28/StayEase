import api from './api';

export interface Property {
  id: string;
  title: string;
  description: string;
  city: string;
  basePrice: number;
  images: Array<{ url: string }>;
  bedrooms: number;
  bathrooms: number;
  guests: number;
  totalRating?: number;
  reviewCount?: number;
}

export const propertyService = {
  searchProperties: (filters: any) => api.get('/properties/search', { params: filters }),
  getAll: (page = 1, limit = 20) => api.get('/properties', { params: { page, limit } }),
  getById: (id: string) => api.get(`/properties/${id}`),
  create: (data: any) => api.post('/properties', data),
  update: (id: string, data: any) => api.patch(`/properties/${id}`, data),
  delete: (id: string) => api.delete(`/properties/${id}`),
  getOwnerProperties: (ownerId: string) => api.get(`/properties/owner/${ownerId}/properties`),
  addUnavailableDate: (id: string, date: string, reason?: string) =>
    api.post(`/properties/${id}/unavailable-dates`, { date, reason }),
  removeUnavailableDate: (id: string, date: string) =>
    api.delete(`/properties/${id}/unavailable-dates/${date}`),
};

export const bookingService = {
  checkAvailability: (propertyId: string, checkInDate: string, checkOutDate: string) =>
    api.post('/bookings/check-availability', { propertyId, checkInDate, checkOutDate }),
  calculatePrice: (propertyId: string, checkInDate: string, checkOutDate: string) =>
    api.post('/bookings/calculate-price', { propertyId, checkInDate, checkOutDate }),
  create: (data: any) => api.post('/bookings', data),
  getById: (id: string) => api.get(`/bookings/${id}`),
  getAll: (status?: string) => api.get('/bookings', { params: { status } }),
  cancel: (id: string, cancellationReason: string) =>
    api.post(`/bookings/${id}/cancel`, { cancellationReason }),
};

export const paymentService = {
  createStripeIntent: (bookingId: string) =>
    api.post('/payments/stripe/create-intent', { bookingId }),
  confirmStripePayment: (bookingId: string, paymentIntentId: string) =>
    api.post('/payments/stripe/confirm', { bookingId, paymentIntentId }),
  createRazorpayOrder: (bookingId: string) =>
    api.post('/payments/razorpay/create-order', { bookingId }),
  verifyRazorpayPayment: (bookingId: string, paymentId: string, orderId: string, signature: string) =>
    api.post('/payments/razorpay/verify', { bookingId, paymentId, orderId, signature }),
  getPayment: (bookingId: string) => api.get(`/payments/${bookingId}`),
  requestRefund: (bookingId: string, reason: string) =>
    api.post(`/payments/${bookingId}/refund`, { reason }),
};

export const qrCodeService = {
  generate: (bookingId: string, paymentIntentId?: string) =>
    api.post(`/qr-codes/${bookingId}/generate`, { paymentIntentId }),
  get: (bookingId: string) => api.get(`/qr-codes/${bookingId}`),
  verify: (qrString: string) => api.post('/qr-codes/verify', { qrString }),
  getStatistics: () => api.get('/qr-codes/statistics'),
};

export const reviewService = {
  create: (data: any) => api.post('/reviews', data),
  getPropertyReviews: (propertyId: string, limit = 10) =>
    api.get(`/reviews/property/${propertyId}`, { params: { limit } }),
  delete: (id: string) => api.delete(`/reviews/${id}`),
};

export const authService = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  getMe: () => api.get('/auth/me'),
  changePassword: (data: any) => api.post('/auth/change-password', data),
};
