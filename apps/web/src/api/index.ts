import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor - add access token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        useAuthStore.getState().setAccessToken(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API functions
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  registerCompany: (data: {
    companyName: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
  }) => api.post('/auth/register-company', data),
  
  logout: () => api.post('/auth/logout'),
  
  getMe: () => api.get('/auth/me'),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
  
  activateAccount: (token: string) =>
    api.post('/auth/activate', { token }),
  
  resendActivation: (email: string) =>
    api.post('/auth/resend-activation', { email }),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

export const outletsApi = {
  getAll: () => api.get('/outlets'),
  get: (id: string) => api.get(`/outlets/${id}`),
  create: (data: any) => api.post('/outlets', data),
  update: (id: string, data: any) => api.patch(`/outlets/${id}`, data),
  delete: (id: string) => api.delete(`/outlets/${id}`),
};

export const tablesApi = {
  getAll: (params?: { outletId?: string }) => 
    api.get('/tables', { params }),
  get: (id: string) => api.get(`/tables/${id}`),
  create: (data: any) => api.post('/tables', data),
  update: (id: string, data: any) => api.patch(`/tables/${id}`, data),
  delete: (id: string) => api.delete(`/tables/${id}`),
  regenerateQr: (id: string) => api.post(`/tables/${id}/regenerate-qr`),
};

export const categoriesApi = {
  getAll: (params?: { outletId?: string }) => 
    api.get('/categories', { params }),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.patch(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export const addonsApi = {
  getAll: (params?: { outletId?: string }) => 
    api.get('/addons', { params }),
  create: (data: any) => api.post('/addons', data),
  update: (id: string, data: any) => api.patch(`/addons/${id}`, data),
  delete: (id: string) => api.delete(`/addons/${id}`),
};

export const menuItemsApi = {
  getAll: (params?: { outletId?: string; categoryId?: string }) => 
    api.get('/menu-items', { params }),
  create: (data: any) => api.post('/menu-items', data),
  update: (id: string, data: any) => api.patch(`/menu-items/${id}`, data),
  delete: (id: string) => api.delete(`/menu-items/${id}`),
  updateStock: (id: string, data: { stock?: number | null; isAvailable?: boolean }) => 
    api.patch(`/menu-items/${id}/stock`, data),
};

export const usersApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get('/users', { params }),
  get: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const ordersApi = {
  // Use posApi.getOrders() instead for staff access
  // This is kept for any legacy code that might use it
  getAll: (params?: { outletId?: string; status?: string; limit?: number }) =>
    posApi.getOrders(params),
  get: (id: string) => api.get(`/pos/orders/${id}`),
};

export const publicApi = {
  resolveQR: (qrToken: string) => api.get(`/public/resolve/${qrToken}`),
  getMenu: (outletId: string) => api.get(`/public/menu?outletId=${outletId}`),
  createOrder: (data: any) => api.post('/public/orders', data),
  getOrder: (orderId: string) => api.get(`/public/orders/${orderId}`),
  getOrderByCode: (orderCode: string) => api.get(`/public/orders/by-code/${orderCode}`),
  createPayment: (data: any) => api.post('/public/payments', data),
};

export const posApi = {
  createOrder: (data: any) => api.post('/pos/orders', data),
  getOrders: (params?: { outletId?: string; status?: string; page?: number; limit?: number }) =>
    api.get('/pos/orders', { params }),
  updateOrderStatus: (id: string, status: string) =>
    api.patch(`/pos/orders/${id}/status`, { status }),
  createPayment: (data: any) => api.post('/pos/payments', data),
  openShift: (data: any) => api.post('/pos/shifts/open', data),
  closeShift: (data: any) => api.post('/pos/shifts/close', data),
};

export const paymentsApi = {
  confirm: (id: string, note?: string) =>
    api.patch(`/pos/payments/${id}/confirm`, { note }),
  confirmByOrder: (orderId: string, note?: string) =>
    api.patch(`/pos/orders/${orderId}/confirm-payment`, { note }),
  reject: (id: string, note?: string) =>
    api.patch(`/pos/payments/${id}/reject`, { note }),
};

export const kdsApi = {
  getOrders: (params?: { outletId?: string; status?: string }) =>
    api.get('/kds/orders', { params }),
  updateStatus: (id: string, status: string) =>
    api.patch(`/kds/orders/${id}/status`, { status }),
};

export const reportsApi = {
  getDaily: (outletId: string, date?: string) =>
    api.get('/reports/daily', { params: { outletId, date } }),
  getRange: (outletId: string, startDate: string, endDate: string) =>
    api.get('/reports/range', { params: { outletId, startDate, endDate } }),
  getFinancial: (params: { startDate: string; endDate: string; outletId?: string; period?: 'daily' | 'monthly' | 'yearly' }) =>
    api.get('/reports/financial', { params }),
};

export const expensesApi = {
  getAll: (params?: { outletId?: string; category?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) =>
    api.get('/expenses', { params }),
  getOne: (id: string) => api.get(`/expenses/${id}`),
  create: (outletId: string, data: any) => api.post(`/expenses/${outletId}`, data),
  update: (id: string, data: any) => api.patch(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
  getSummary: (params?: { outletId?: string; startDate?: string; endDate?: string; period?: 'daily' | 'monthly' | 'yearly' }) =>
    api.get('/expenses/summary', { params }),
  export: (params?: { outletId?: string; category?: string; startDate?: string; endDate?: string }) =>
    api.get('/expenses/export', { params }),
};

export const superAdminApi = {
  getCompanies: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/sa/companies', { params }),
  getCompany: (id: string) => api.get(`/sa/companies/${id}`),
  updateCompanyPlan: (id: string, plan: string) => 
    api.patch(`/sa/companies/${id}/plan`, { plan }),
  toggleActive: (id: string, isActive: boolean) =>
    api.patch(`/sa/companies/${id}/active`, { isActive }),
  getAuditLogs: (params?: { page?: number; limit?: number }) => 
    api.get('/sa/audit', { params }),
};
