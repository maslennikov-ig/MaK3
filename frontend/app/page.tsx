import { Button, Container, Title, Text, Group, Stack } from '@mantine/core';
import Link from 'next/link';

export default function Home() {
  return (
    <Container size="md" py="xl">
      <Stack spacing="xl" align="center" mt={50}>
        <Title order={1} align="center">
          MaK 3 CRM
        </Title>
        <Text size="lg" align="center" maw={600}>
          Современная CRM-система для автоматизации и стандартизации бизнес-процессов в сфере
          кредитного брокериджа
        </Text>
        <Group mt="xl">
          <Button component={Link} href="/login" size="lg">
            Войти в систему
          </Button>
          <Button component={Link} href="/register" variant="outline" size="lg">
            Регистрация
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
