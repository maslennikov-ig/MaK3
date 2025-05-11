'use client';

import { useEffect, useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Paper, 
  Stack, 
  Group, 
  Loader, 
  Center, 
  Grid, 
  Card, 
  RingProgress,
  ThemeIcon,
  SimpleGrid,
  useMantineTheme
} from '@mantine/core';
import { 
  IconUsers, 
  IconBuildingStore, 
  IconChartBar, 
  IconCalendarStats, 
  IconArrowUpRight, 
  IconArrowDownRight 
} from '@tabler/icons-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const theme = useMantineTheme();

  useEffect(() => {
    // Проверяем аутентификацию
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="xl" />
      </Center>
    );
  }

  // Демо-данные для дашборда
  const stats = [
    { title: 'Клиенты', value: '147', icon: <IconUsers size={24} />, diff: 12 },
    { title: 'Сделки', value: '32', icon: <IconBuildingStore size={24} />, diff: -2 },
    { title: 'Конверсия', value: '24%', icon: <IconChartBar size={24} />, diff: 4 },
    { title: 'Задачи', value: '18', icon: <IconCalendarStats size={24} />, diff: 8 },
  ];

  return (
    <Container size="lg" py="md">
      <Stack spacing="lg">
        <Group position="apart">
          <Title order={2}>Панель управления</Title>
          <Text>
            Добро пожаловать, {user?.firstName} {user?.lastName}!
          </Text>
        </Group>

        <SimpleGrid cols={4} breakpoints={[{ maxWidth: 'sm', cols: 1 }, { maxWidth: 'md', cols: 2 }]}>
          {stats.map((stat) => (
            <Paper key={stat.title} p="md" radius="md" shadow="xs" withBorder>
              <Group position="apart">
                <div>
                  <Text color="dimmed" transform="uppercase" weight={700} size="xs">
                    {stat.title}
                  </Text>
                  <Text weight={700} size="xl">
                    {stat.value}
                  </Text>
                </div>
                <ThemeIcon
                  color={stat.diff > 0 ? 'teal' : 'red'}
                  variant="light"
                  size="lg"
                  radius="md"
                >
                  {stat.icon}
                </ThemeIcon>
              </Group>
              <Text color={stat.diff > 0 ? 'teal' : 'red'} size="sm" mt="md">
                <Group spacing={5}>
                  {stat.diff > 0 ? <IconArrowUpRight size={16} /> : <IconArrowDownRight size={16} />}
                  <span>{Math.abs(stat.diff)}% по сравнению с прошлым месяцем</span>
                </Group>
              </Text>
            </Paper>
          ))}
        </SimpleGrid>

        <Grid>
          <Grid.Col md={8}>
            <Paper p="md" radius="md" shadow="xs" withBorder>
              <Title order={3} mb="md">Последние сделки</Title>
              <Text color="dimmed" size="sm">
                Здесь будет отображаться список последних сделок.
              </Text>
            </Paper>
          </Grid.Col>
          <Grid.Col md={4}>
            <Paper p="md" radius="md" shadow="xs" withBorder h="100%">
              <Title order={3} mb="md">Статистика конверсии</Title>
              <Center>
                <RingProgress
                  sections={[
                    { value: 40, color: theme.colors.blue[6] },
                    { value: 15, color: theme.colors.orange[6] },
                    { value: 15, color: theme.colors.grape[6] },
                  ]}
                  label={
                    <Text size="xl" align="center" weight={700}>
                      70%
                    </Text>
                  }
                />
              </Center>
              <Group position="apart" mt="md">
                <div>
                  <Text size="xs" color="dimmed">Новые</Text>
                  <Text size="sm" weight={500}>40%</Text>
                </div>
                <div>
                  <Text size="xs" color="dimmed">В работе</Text>
                  <Text size="sm" weight={500}>15%</Text>
                </div>
                <div>
                  <Text size="xs" color="dimmed">Завершено</Text>
                  <Text size="sm" weight={500}>15%</Text>
                </div>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
