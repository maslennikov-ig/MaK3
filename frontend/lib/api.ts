'use client';

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Перехватчик запросов
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const accessToken = useAuthStore.getState().accessToken;

        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    // Перехватчик ответов
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Если ошибка 401 (Unauthorized) и запрос не помечен как повторный
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Пытаемся обновить токен
            const success = await useAuthStore.getState().refreshAccessToken();

            // Если успешно обновили токен, повторяем запрос
            if (success) {
              const accessToken = useAuthStore.getState().accessToken;
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Если не удалось обновить токен, выходим из системы
            useAuthStore.getState().logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: Record<string, unknown>): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T> {
    const response = await this.api.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: Record<string, unknown>): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
