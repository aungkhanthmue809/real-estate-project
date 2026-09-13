import axios from 'axios';
import type {
  AuthResponse,
  ContactMessage,
  CreateContactMessageRequest,
  Notification,
  Property,
  PropertyPostingFee,
  PropertyRequest,
  PropertyType,
  User,
} from '../types';
import { BACKEND_BASE_URL } from './imageUrl';

const api = axios.create({
  baseURL: BACKEND_BASE_URL,
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
  updateProfile: (data: { email?: string; phone?: string; avatar?: string }) =>
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
};

export const propertyPostingFeeAPI = {
  getAll: () => api.get<PropertyPostingFee[]>('/api/property-posting-fees'),
};

export const contactMessageAPI = {
  create: (data: CreateContactMessageRequest) =>
    api.post<ContactMessage>('/api/contact-messages', data),
};

export const notificationAPI = {
  getAll: () => api.get<Notification[]>('/api/notifications'),
  markRead: (id: number) => api.put<Notification>(`/api/notifications/${id}/read`),
  markAllRead: () => api.put<void>('/api/notifications/read-all'),
};

export const uploadAPI = {
  uploadPropertyImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ url: string }>('/api/uploads/properties', formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data.url;
  },
  uploadNrcDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ token: string }>('/api/uploads/verification/nrc', formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data.token;
  },
  uploadOwnershipDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ token: string }>('/api/uploads/verification/ownership', formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data.token;
  },
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
  downloadNrcDocument: (id: number) =>
    api.get(`/api/admin/properties/${id}/verification/nrc`, { responseType: 'blob' }),
  downloadOwnershipDocument: (id: number) =>
    api.get(`/api/admin/properties/${id}/verification/ownership`, { responseType: 'blob' }),
  updatePostingFee: (propertyType: PropertyType, feeAmount: number) =>
    api.put<PropertyPostingFee>(`/api/admin/property-posting-fees/${propertyType}`, { feeAmount }),
  getContactMessages: () => api.get<ContactMessage[]>('/api/admin/contact-messages'),
};

export default api;
