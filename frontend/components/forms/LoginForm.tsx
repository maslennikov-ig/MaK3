'use client';

import { useEffect } from 'react';
import { useForm } from '@mantine/form';
import {
  TextInput,
  PasswordInput,
  Button,
  Group,
  Checkbox,
  Anchor,
  Stack,
  Text,
  Alert,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore();

  const form = useForm<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validate: {
      email: value => (/^\S+@\S+$/.test(value) ? null : 'Некорректный email'),
      password: value => (value.length >= 6 ? null : 'Пароль должен содержать минимум 6 символов'),
    },
  });

  // Очищаем ошибку при изменении формы
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [form.values, error, clearError]);

  // Редирект после успешной аутентификации
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (values: LoginFormValues) => {
    await login({
      email: values.email,
      password: values.password,
    });
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack spacing="md">
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Ошибка" color="red" variant="filled">
            {error}
          </Alert>
        )}
        <TextInput
          required
          label="Email"
          placeholder="your@email.com"
          {...form.getInputProps('email')}
        />

        <PasswordInput
          required
          label="Пароль"
          placeholder="Ваш пароль"
          {...form.getInputProps('password')}
        />

        <Group position="apart">
          <Checkbox
            label="Запомнить меня"
            {...form.getInputProps('rememberMe', { type: 'checkbox' })}
          />
          <Anchor component={Link} href="/forgot-password" size="sm">
            Забыли пароль?
          </Anchor>
        </Group>

        <Button type="submit" fullWidth loading={isLoading}>
          Войти
        </Button>

        <Group position="center">
          <Text size="sm">
            Нет аккаунта?{' '}
            <Anchor component={Link} href="/register" size="sm">
              Зарегистрироваться
            </Anchor>
          </Text>
        </Group>
      </Stack>
    </form>
  );
}
