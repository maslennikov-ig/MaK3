import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Создаем экземпляр axios с базовым URL
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем перехватчик запросов для добавления токена авторизации
axiosInstance.interceptors.request.use(
  config => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Добавляем перехватчик ответов для обработки ошибок авторизации
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Если ошибка 401 (Unauthorized) и запрос не помечен как повторный
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Пытаемся обновить токен
        const success = await useAuthStore.getState().refreshAccessToken();

        // Если успешно обновили токен, повторяем запрос
        if (success) {
          const accessToken = useAuthStore.getState().accessToken;
          if (accessToken) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return axiosInstance(originalRequest);
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

export default axiosInstance;
