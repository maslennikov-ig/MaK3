'use client';

import { Container, Title, Text, Paper, Stack } from '@mantine/core';
import LoginForm from '@/components/forms/LoginForm';

export default function LoginPage() {
  return (
    <Container size="xs" py="xl">
      <Paper shadow="md" p="xl" radius="md" withBorder>
        <Stack spacing="md">
          <Title order={2} align="center">
            Вход в систему
          </Title>
          <Text color="dimmed" size="sm" align="center">
            Введите ваши учетные данные для доступа к MaK 3 CRM
          </Text>
          <LoginForm />
        </Stack>
      </Paper>
    </Container>
  );
}
