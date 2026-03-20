import api from './client';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me')
};

export const eventApi = {
  list: (params) => api.get('/events', { params }),
  detail: (id) => api.get(`/events/${id}`),
  create: (payload) => api.post('/events', payload),
  update: (id, payload) => api.put(`/events/${id}`, payload),
  remove: (id) => api.delete(`/events/${id}`)
};

export const bookingApi = {
  create: (payload) => api.post('/bookings', payload),
  byUser: (userId) => api.get(`/bookings/user/${userId}`),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`)
};

export const notificationApi = {
  byUser: (userId) => api.get(`/notifications/user/${userId}`)
};
