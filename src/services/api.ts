import axios from 'axios';
import type { AuthResponse, Customer, Deal, Interaction, LoginCredentials, User, PaginatedResponse } from '../types';

const api = axios.create({
  baseURL: 'http://13.60.16.62:3001/api',
  withCredentials: true, // Important for session cookies
});

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'SALES_TEAM';
}

// Auth API
export const authAPI = {
  login: (credentials: LoginCredentials) => 
    api.post<AuthResponse>('/auth/login', credentials),
  register: (data: RegisterData) => 
    api.post<AuthResponse>('/auth/register', data),
  logout: () => 
    api.post('/auth/logout'),
  getProfile: () => 
    api.get<{ user: User }>('/auth/me'),
  updateProfile: (data: Partial<User>) => 
    api.patch<{ user: User }>('/auth/me', data),
};

// Customers API
export const customersAPI = {
  getAll: (page = 1, limit = 10, search?: string) => 
    api.get<PaginatedResponse<Customer>>('/customers', { params: { page, limit, search } }),
  getOne: (id: string) => 
    api.get<Customer>(`/customers/${id}`),
  create: (data: Partial<Customer>) => 
    api.post<Customer>('/customers', data),
  update: (id: string, data: Partial<Customer>) => 
    api.patch<Customer>(`/customers/${id}`, data),
  delete: (id: string) => 
    api.delete(`/customers/${id}`),
};

// Deals API
export const dealsAPI = {
  getAll: (page = 1, limit = 10, status?: string, customerId?: string) => 
    api.get<PaginatedResponse<Deal>>('/deals', { params: { page, limit, status, customerId } }),
  getOne: (id: string) => 
    api.get<Deal>(`/deals/${id}`),
  create: (data: Partial<Deal>) => 
    api.post<Deal>('/deals', data),
  update: (id: string, data: Partial<Deal>) => 
    api.patch<Deal>(`/deals/${id}`, data),
  delete: (id: string) => 
    api.delete(`/deals/${id}`),
  getStatistics: () => 
    api.get('/deals/statistics'),
};

// Interactions API
export const interactionsAPI = {
  getAll: (page = 1, limit = 10, customerId?: string) => 
    api.get<PaginatedResponse<Interaction>>('/interactions', { params: { page, limit, customerId } }),
  getOne: (id: string) => 
    api.get<Interaction>(`/interactions/${id}`),
  create: (data: Partial<Interaction>) => 
    api.post<Interaction>('/interactions', data),
  update: (id: string, data: Partial<Interaction>) => 
    api.patch<Interaction>(`/interactions/${id}`, data),
  delete: (id: string) => 
    api.delete(`/interactions/${id}`),
}; 