import { useState } from 'react';
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Group, Checkbox, Anchor, Stack, Text } from '@mantine/core';
import Link from 'next/link';

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Некорректный email'),
      password: (value) => (value.length >= 6 ? null : 'Пароль должен содержать минимум 6 символов'),
    },
  });

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      // Здесь будет логика аутентификации
      console.log('Login values:', values);
      // Имитация задержки для демонстрации состояния загрузки
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack spacing="md">
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

        <Button type="submit" fullWidth loading={loading}>
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
