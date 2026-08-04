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
  create: (data: Record<string, unknown>) => api.post('/projects', data),
  update: (id: string, data: Record<string, unknown>) => api.post(`/projects/${id}/update`, data),
  delete: (id: string) => api.post(`/projects/${id}/delete`),
};

export const skillsAPI = {
  getAll: () => api.get('/skills'),
  getById: (id: string) => api.get(`/skills/${id}`),
  create: (data: Record<string, unknown>) => api.post('/skills', data),
  update: (id: string, data: Record<string, unknown>) => api.post(`/skills/${id}/update`, data),
  delete: (id: string) => api.post(`/skills/${id}/delete`),
};

export const contactAPI = {
  send: (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    recaptchaToken?: string;
    attachments?: File[];
  }) => {
    const { attachments, ...fields } = data;
    if (attachments && attachments.length > 0) {
      const fd = new FormData();
      Object.entries(fields).forEach(([k, v]) => {
        if (v !== undefined) fd.append(k, v as string);
      });
      attachments.forEach((f) => fd.append('attachments', f));
      return api.post('/contact', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.post('/contact', fields);
  },
  // Admin endpoints
  getAll: () => api.get('/contact/admin'),
  getById: (id: string) => api.get(`/contact/admin/${id}`),
  getReplies: (id: string) => api.get(`/contact/admin/${id}/replies`), // lightweight poll
  reply: (id: string, content: string, attachments?: File[]) => {
    if (attachments && attachments.length > 0) {
      const fd = new FormData();
      fd.append('content', content);
      attachments.forEach((f) => fd.append('attachments', f));
      return api.post(`/contact/admin/${id}/reply`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post(`/contact/admin/${id}/reply`, { content });
  },
  updateStatus: (id: string, status: string) => api.post(`/contact/admin/${id}/status`, { status }),
  delete: (id: string) => api.post(`/contact/admin/${id}/delete`),
  getStats: () => api.get('/contact/admin/stats'),
  bulkMarkAsRead: (ids: string[], read = true) =>
    api.post('/contact/admin/bulk/read', { ids, read }),
  bulkDelete: (ids: string[]) => api.post('/contact/admin/bulk/delete', { ids }),
  markAsRead: (id: string, read = true) => api.post(`/contact/admin/${id}/read`, { read }),
};

export const authAPI = {
  login: (email: string, password: string, recaptchaToken?: string) =>
    api.post('/auth/login', { email, password, recaptchaToken }),
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
    const params: Record<string, string | number> = {};
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
  create: (data: Record<string, unknown>) => api.post('/homepage-config', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.post(`/homepage-config/${id}/update`, data),
  delete: (id: string) => api.post(`/homepage-config/${id}/delete`),
  activate: (id: string) => api.post(`/homepage-config/${id}/activate`),
};

export const uploadAPI = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  /**
   * Converts a relative upload path (e.g. /uploads/foo.png) into an absolute URL
   * pointing at the backend server. Cloudinary URLs are already absolute and are
   * returned unchanged.
   */
  getFileUrl: (relativePath: string): string => {
    if (/^https?:\/\//i.test(relativePath)) return relativePath;
    const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(
      /\/api$/,
      ''
    );
    return `${base}${relativePath}`;
  },
};

export default api;
