import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE, timeout: 30000, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qja_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, Promise.reject);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('qja_token');
      localStorage.removeItem('qja_user');
      if (!window.location.pathname.includes('/login')) window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (d) => api.post('/auth/login', d),
  register: (d) => api.post('/auth/register', d),
  getMe: () => api.get('/auth/me'),
  updatePassword: (d) => api.put('/auth/password', d),
  adminResetPassword: (userId, d) => api.put(`/auth/reset/${userId}`, d),
};
export const usersAPI = {
  getAll: (p) => api.get('/users', { params: p }),
  getStudents: (p) => api.get('/users/students', { params: p }),
  getTeachers: () => api.get('/users/teachers'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, d) => api.put(`/users/${id}`, d),
  delete: (id) => api.delete(`/users/${id}`),
};
export const coursesAPI = {
  getAll: (p) => api.get('/courses', { params: p }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (d) => api.post('/courses', d),
  update: (id, d) => api.put(`/courses/${id}`, d),
  delete: (id) => api.delete(`/courses/${id}`),
};
export const sessionsAPI = {
  getAll: (p) => api.get('/sessions', { params: p }),
  create: (d) => api.post('/sessions', d),
  update: (id, d) => api.put(`/sessions/${id}`, d),
  delete: (id) => api.delete(`/sessions/${id}`),
};
export const blogAPI = {
  getAll: (p) => api.get('/blog', { params: p }),
  getBySlug: (slug) => api.get(`/blog/${slug}`),
  create: (d) => api.post('/blog', d),
  update: (id, d) => api.put(`/blog/${id}`, d),
  delete: (id) => api.delete(`/blog/${id}`),
};
export const submissionsAPI = {
  create: (d) => api.post('/submissions', d),
  getAll: (p) => api.get('/submissions', { params: p }),
  delete: (id) => api.delete(`/submissions/${id}`),
};
export const paymentsAPI = {
  getAll: (p) => api.get('/payments', { params: p }),
  create: (d) => api.post('/payments', d),
  update: (id, d) => api.put(`/payments/${id}`, d),
};
export const analyticsAPI = { getDashboard: () => api.get('/analytics/dashboard') };
export const testimonialsAPI = {
  getAll: (p) => api.get('/testimonials', { params: p }),
  create: (d) => api.post('/testimonials', d),
  update: (id, d) => api.put(`/testimonials/${id}`, d),
  delete: (id) => api.delete(`/testimonials/${id}`),
};
export const siteContentAPI = {
  getByPage: (page) => api.get(`/site-content/${page}`),
  getAll: () => api.get('/site-content'),
  upsert: (d) => api.post('/site-content', d),
  bulkUpdate: (updates) => api.post('/site-content/bulk', { updates }),
};
export const mediaAPI = {
  upload: (formData) => api.post('/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 }),
  getAll: (p) => api.get('/media', { params: p }),
  getFolders: () => api.get('/media/folders'),
  updateAlt: (id, d) => api.put(`/media/${id}`, d),
  delete: (id) => api.delete(`/media/${id}`),
};

export default api;
