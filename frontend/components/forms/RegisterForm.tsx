'use client';

import { useEffect } from 'react';
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Group, Anchor, Stack, Text, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface RegisterFormValues {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const { register, isLoading, error, isAuthenticated, clearError } = useAuthStore();

  const form = useForm<RegisterFormValues>({
    initialValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      email: value => (/^\S+@\S+$/.test(value) ? null : 'Некорректный email'),
      firstName: value => (value.length > 0 ? null : 'Имя обязательно'),
      lastName: value => (value.length > 0 ? null : 'Фамилия обязательна'),
      password: value => (value.length >= 6 ? null : 'Пароль должен содержать минимум 6 символов'),
      confirmPassword: (value, values) =>
        value === values.password ? null : 'Пароли не совпадают',
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

  const handleSubmit = async (values: RegisterFormValues) => {
    await register({
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
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

        <Group grow>
          <TextInput required label="Имя" placeholder="Иван" {...form.getInputProps('firstName')} />
          <TextInput
            required
            label="Фамилия"
            placeholder="Иванов"
            {...form.getInputProps('lastName')}
          />
        </Group>

        <PasswordInput
          required
          label="Пароль"
          placeholder="Ваш пароль"
          {...form.getInputProps('password')}
        />

        <PasswordInput
          required
          label="Подтверждение пароля"
          placeholder="Повторите пароль"
          {...form.getInputProps('confirmPassword')}
        />

        <Button type="submit" fullWidth loading={isLoading}>
          Зарегистрироваться
        </Button>

        <Group position="center">
          <Text size="sm">
            Уже есть аккаунт?{' '}
            <Anchor component={Link} href="/login" size="sm">
              Войти
            </Anchor>
          </Text>
        </Group>
      </Stack>
    </form>
  );
}
