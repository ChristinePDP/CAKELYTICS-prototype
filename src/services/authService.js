import api from './api';

export const authService = {
  login:         (data)         => api.post('/auth/login', data),
  logout:        ()             => api.post('/auth/logout'),
  sendResetCode: (email)        => api.post('/auth/forgot-password', { email }),
  verifyOtp:     (data)         => api.post('/auth/verify-otp', data),
  resetPassword: (data)         => api.post('/auth/reset-password', data),
  me:            ()             => api.get('/auth/me'),
};
