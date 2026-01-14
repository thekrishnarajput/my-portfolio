import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.post(`/projects/${id}/update`, data),
  delete: (id: string) => api.post(`/projects/${id}/delete`),
};

export const skillsAPI = {
  getAll: () => api.get('/skills'),
  getById: (id: string) => api.get(`/skills/${id}`),
  create: (data: any) => api.post('/skills', data),
  update: (id: string, data: any) => api.post(`/skills/${id}/update`, data),
  delete: (id: string) => api.post(`/skills/${id}/delete`),
};

export const contactAPI = {
  send: (data: { name: string; email: string; subject: string; message: string }) =>
    api.post('/contact', data),
};

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  verify: (token: string) =>
    api.post('/auth/verify', {}, { headers: { Authorization: `Bearer ${token}` } }),
};

export const linkedinAPI = {
  getFollowers: () => api.get('/linkedin/followers'),
};

export const visitorsAPI = {
  trackVisit: () => api.post('/visitors/track'),
  getCount: () => api.get('/visitors/count'),
  getAll: (page?: number, limit?: number, sortBy?: string, sortOrder?: 'asc' | 'desc') => {
    const params: any = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    return api.get('/visitors', { params });
  },
};

export const techStacksAPI = {
  search: (query?: string) => {
    const params = query ? { params: { query } } : {};
    return api.get('/tech-stacks', params);
  },
  create: (name: string) => api.post('/tech-stacks', { name }),
  delete: (id: string) => api.post(`/tech-stacks/${id}/delete`),
  getAll: () => api.get('/tech-stacks'),
};

export const homepageConfigAPI = {
  getActive: () => api.get('/homepage-config'),
  getAll: () => api.get('/homepage-config/all'),
  getById: (id: string) => api.get(`/homepage-config/${id}`),
  create: (data: any) => api.post('/homepage-config', data),
  update: (id: string, data: any) => api.post(`/homepage-config/${id}/update`, data),
  delete: (id: string) => api.post(`/homepage-config/${id}/delete`),
  activate: (id: string) => api.post(`/homepage-config/${id}/activate`),
};

export default api;

