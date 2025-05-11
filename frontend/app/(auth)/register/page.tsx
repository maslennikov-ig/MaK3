'use client';

import { Container, Title, Text, Paper, Stack } from '@mantine/core';
import RegisterForm from '@/components/forms/RegisterForm';

export default function RegisterPage() {
  return (
    <Container size="xs" py="xl">
      <Paper shadow="md" p="xl" radius="md" withBorder>
        <Stack spacing="md">
          <Title order={2} align="center">
            Регистрация
          </Title>
          <Text color="dimmed" size="sm" align="center">
            Создайте учетную запись для доступа к MaK 3 CRM
          </Text>
          <RegisterForm />
        </Stack>
      </Paper>
    </Container>
  );
}
