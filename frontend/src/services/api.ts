import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

class APIService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const response = await this.post('/auth/refresh-token', { refreshToken });
              const { accessToken } = response.data;
              localStorage.setItem('accessToken', accessToken);

              // Retry the original request
              error.config.headers.Authorization = `Bearer ${accessToken}`;
              return this.api.request(error.config);
            } catch {
              // Refresh failed, logout
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              window.location.href = '/login';
            }
          } else {
            // No refresh token, logout
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }
}

export const apiService = new APIService();

// Auth API
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    apiService.post('/auth/login', credentials),

  register: (userData: any) =>
    apiService.post('/auth/register', userData),

  getProfile: () =>
    apiService.get('/auth/profile'),

  updateProfile: (data: any) =>
    apiService.put('/auth/profile', data),

  changePassword: (data: { current_password: string; new_password: string }) =>
    apiService.post('/auth/change-password', data),
};

// Products API
export const productsAPI = {
  getAll: (params?: any) =>
    apiService.get('/products', { params }),

  search: (q: string) =>
    apiService.get('/products/search', { params: { q } }),

  getById: (id: number) =>
    apiService.get(`/products/${id}`),

  create: (data: any) =>
    apiService.post('/products', data),

  update: (id: number, data: any) =>
    apiService.put(`/products/${id}`, data),

  delete: (id: number) =>
    apiService.delete(`/products/${id}`),
};

// Inventory API
export const inventoryAPI = {
  getAll: (params?: any) =>
    apiService.get('/inventory', { params }),

  getByProduct: (productId: number, params?: any) =>
    apiService.get(`/inventory/product/${productId}`, { params }),

  add: (data: any) =>
    apiService.post('/inventory', data),

  update: (id: number, data: any) =>
    apiService.put(`/inventory/${id}`, data),

  adjust: (id: number, data: { quantity_adjustment: number; reason: string }) =>
    apiService.post(`/inventory/${id}/adjust`, data),

  getExpiring: (params?: any) =>
    apiService.get('/inventory/expiring', { params }),

  getSummary: (params?: any) =>
    apiService.get('/inventory/summary', { params }),
};

// Patients API
export const patientsAPI = {
  getAll: (params?: any) =>
    apiService.get('/patients', { params }),

  search: (q: string) =>
    apiService.get('/patients/search', { params: { q } }),

  getById: (id: number) =>
    apiService.get(`/patients/${id}`),

  getByPhone: (phone: string) =>
    apiService.get(`/patients/phone/${phone}`),

  create: (data: any) =>
    apiService.post('/patients', data),

  update: (id: number, data: any) =>
    apiService.put(`/patients/${id}`, data),

  delete: (id: number) =>
    apiService.delete(`/patients/${id}`),
};

// Sales API
export const salesAPI = {
  create: (data: any) =>
    apiService.post('/sales', data),

  getAll: (params?: any) =>
    apiService.get('/sales', { params }),

  getById: (id: number) =>
    apiService.get(`/sales/${id}`),

  getDailyReport: (params?: any) =>
    apiService.get('/sales/daily-report', { params }),

  cancel: (id: number, reason: string) =>
    apiService.post(`/sales/${id}/cancel`, { reason }),
};

export default apiService;
