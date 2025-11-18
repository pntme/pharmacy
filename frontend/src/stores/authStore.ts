import { create } from 'zustand';
import { authAPI } from '../services/api';

interface User {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  role_id: number;
  location_id?: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response: any = await authAPI.login({ username, password });

      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        set({
          user,
          accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },

  loadUser: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }

    try {
      const response: any = await authAPI.getProfile();
      if (response.success) {
        set({
          user: response.data,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      });
    }
  },
}));
