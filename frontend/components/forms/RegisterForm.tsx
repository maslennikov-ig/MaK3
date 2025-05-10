import { useState } from 'react';
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Group, Anchor, Stack, Text } from '@mantine/core';
import Link from 'next/link';

interface RegisterFormValues {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    initialValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Некорректный email'),
      firstName: (value) => (value.length > 0 ? null : 'Имя обязательно'),
      lastName: (value) => (value.length > 0 ? null : 'Фамилия обязательна'),
      password: (value) => (value.length >= 6 ? null : 'Пароль должен содержать минимум 6 символов'),
      confirmPassword: (value, values) =>
        value === values.password ? null : 'Пароли не совпадают',
    },
  });

  const handleSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      // Здесь будет логика регистрации
      console.log('Register values:', values);
      // Имитация задержки для демонстрации состояния загрузки
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Register error:', error);
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

        <Group grow>
          <TextInput
            required
            label="Имя"
            placeholder="Иван"
            {...form.getInputProps('firstName')}
          />
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

        <Button type="submit" fullWidth loading={loading}>
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
