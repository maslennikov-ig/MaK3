'use client';

import { ReactNode, createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Center, Loader } from '@mantine/core';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: UserType | null;
}

// Определение типа пользователя
interface UserType {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  [key: string]: unknown;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  user: null,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, refreshAccessToken, user } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // Список публичных маршрутов, не требующих аутентификации
  const publicRoutes = useMemo(() => ['/login', '/register', '/forgot-password'], []);

  // При первой загрузке пытаемся обновить токен, если он есть
  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshAccessToken();
      } catch (error) {
        console.error('Ошибка при инициализации аутентификации:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [refreshAccessToken]);

  // Перенаправление пользователя в зависимости от статуса аутентификации
  useEffect(() => {
    if (!isInitializing && !isLoading) {
      if (!isAuthenticated && !publicRoutes.includes(pathname)) {
        router.push('/login');
      } else if (isAuthenticated && publicRoutes.includes(pathname)) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, isInitializing, pathname, router, publicRoutes]);

  // Показываем индикатор загрузки во время инициализации
  if (isInitializing) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="xl" />
      </Center>
    );
  }

  // Предоставляем контекст аутентификации для дочерних компонентов
  const authContextValue: AuthContextType = {
    isLoading,
    isAuthenticated,
    user,
  };

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
}
