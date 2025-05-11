'use client';

import { apiClient } from '@/lib/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>('/auth/register', data);
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post<void>('/auth/logout', { refreshToken });
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    return await apiClient.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh-token',
      { refreshToken }
    );
  },

  async getCurrentUser(): Promise<AuthResponse['user']> {
    return await apiClient.get<AuthResponse['user']>('/auth/me');
  },
};

export default authService;
