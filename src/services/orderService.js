import api from './api';

export const orderService = {
  getAll:        (params) => api.get('/orders', { params }),
  create:        (data) => api.post('/orders', data),
  updateStatus:  (id, status) => api.patch(`/orders/${id}/status`, { status }),
};