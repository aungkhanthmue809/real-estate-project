import axios from 'axios';
import type { AuthResponse, Property, PropertyRequest, User } from '../types';

const API_BASE = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('urbannest-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('urbannest-token');
      localStorage.removeItem('urbannest-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { username: string; email: string; password: string; phone: string }) =>
    api.post<AuthResponse>('/api/auth/register', data),
  login: (data: { username: string; password: string }) =>
    api.post<AuthResponse>('/api/auth/login', data),
  me: () => api.get<AuthResponse>('/api/auth/me'),
};

export const userAPI = {
  updateProfile: (data: { email?: string; phone?: string }) =>
    api.put<User>('/api/users/me', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<{ message: string }>('/api/users/me/password', data),
  getAll: () => api.get<User[]>('/api/users'),
  updateRole: (id: number, role: string) =>
    api.put<User>(`/api/users/${id}`, { role }),
  delete: (id: number) =>
    api.delete<{ message: string }>(`/api/users/${id}`),
};

export const propertyAPI = {
  search: (params: {
    keyword?: string;
    type?: string;
    status?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => api.get<Property[]>('/api/properties', { params }),
  getById: (id: number) => api.get<Property>(`/api/properties/${id}`),
  getMine: () => api.get<Property[]>('/api/properties/mine'),
  create: (data: PropertyRequest) => api.post<Property>('/api/properties', data),
  update: (id: number, data: PropertyRequest) => api.put<Property>(`/api/properties/${id}`, data),
  delete: (id: number) => api.delete<{ message: string }>(`/api/properties/${id}`),
  getFavorites: () => api.get<Property[]>('/api/favorites'),
  addFavorite: (id: number) => api.post<{ message: string }>(`/api/properties/${id}/favorite`),
  removeFavorite: (id: number) => api.delete<{ message: string }>(`/api/properties/${id}/favorite`),
};

export const adminAPI = {
  getAllProperties: (approvalStatus?: string) =>
    api.get<Property[]>('/api/admin/properties', { params: { approvalStatus } }),
  approve: (id: number) => api.put<{ message: string }>(`/api/admin/properties/${id}/approve`),
  reject: (id: number) => api.put<{ message: string }>(`/api/admin/properties/${id}/reject`),
  updateProperty: (id: number, data: PropertyRequest) =>
    api.put<Property>(`/api/admin/properties/${id}`, data),
  deleteProperty: (id: number) =>
    api.delete<{ message: string }>(`/api/admin/properties/${id}`),
};

export default api;
