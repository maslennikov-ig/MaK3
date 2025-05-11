'use client';

import { ReactNode, useState, useEffect } from 'react';
import { MantineProvider, ColorScheme, ColorSchemeProvider } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { AuthProvider } from '@/components/providers/AuthProvider';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  // Используем локальное хранилище для сохранения выбранной темы
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'mantine-color-scheme',
    defaultValue: 'light',
    getInitialValueInEffect: true,
  });

  // Функция для переключения темы
  const toggleColorScheme = (value?: ColorScheme) => {
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider 
        theme={{ 
          colorScheme,
          primaryColor: 'blue',
          fontFamily: 'Inter, sans-serif',
          components: {
            Button: {
              defaultProps: {
                radius: 'md',
              },
            },
            Card: {
              defaultProps: {
                radius: 'md',
                shadow: 'sm',
              },
            },
          },
        }} 
        withGlobalStyles 
        withNormalizeCSS
      >
        <AuthProvider>{children}</AuthProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
