'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService, { AuthResponse, LoginCredentials, RegisterData } from '../services/authService';

interface AuthState {
  user: AuthResponse['user'] | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Действия
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Ошибка при входе в систему',
          });
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Ошибка при регистрации',
          });
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        set({ isLoading: true, error: null });
        try {
          if (refreshToken) {
            await authService.logout(refreshToken);
          }
        } catch (error) {
          console.error('Ошибка при выходе из системы:', error);
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const tokens = await authService.refreshToken(refreshToken);
          set({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          });
          return true;
        } catch (error) {
          // Если не удалось обновить токен, выходим из системы
          get().logout();
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
