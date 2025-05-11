'use client';

import { useState } from 'react';
import {
  AppShell,
  Navbar,
  Header,
  Group,
  Title,
  UnstyledButton,
  ThemeIcon,
  Text,
  Burger,
  MediaQuery,
  useMantineTheme,
  useMantineColorScheme,
  ActionIcon,
  Avatar,
  Menu,
  Divider,
  Box,
} from '@mantine/core';
import {
  IconDashboard,
  IconUsers,
  IconBuildingStore,
  IconChartBar,
  IconSettings,
  IconLogout,
  IconSun,
  IconMoonStars,
  IconUser,
} from '@tabler/icons-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface NavLinkProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
}

function NavLink({ icon, label, href, active, onClick }: NavLinkProps) {
  const theme = useMantineTheme();
  
  return (
    <UnstyledButton
      component={Link}
      href={href}
      onClick={onClick}
      sx={theme => ({
        display: 'block',
        width: '100%',
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
        backgroundColor: active
          ? theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background
          : 'transparent',
        '&:hover': {
          backgroundColor: active
            ? theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background
            : theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        },
        marginBottom: theme.spacing.xs,
      })}
    >
      <Group>
        <ThemeIcon 
          variant={active ? "filled" : "light"}
          color={active ? theme.primaryColor : undefined}
          size="lg"
        >
          {icon}
        </ThemeIcon>
        <Text size="sm" weight={active ? 600 : 400}>{label}</Text>
      </Group>
    </UnstyledButton>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [opened, setOpened] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navItems = [
    { icon: <IconDashboard size={18} />, label: 'Панель управления', href: '/dashboard' },
    { icon: <IconUsers size={18} />, label: 'Клиенты', href: '/clients' },
    { icon: <IconBuildingStore size={18} />, label: 'Сделки', href: '/deals' },
    { icon: <IconChartBar size={18} />, label: 'Аналитика', href: '/analytics' },
    { icon: <IconSettings size={18} />, label: 'Настройки', href: '/settings' },
  ];

  return (
    <AppShell
      padding="md"
      navbar={
        <Navbar 
          width={{ base: 280 }} 
          p="md" 
          hiddenBreakpoint="sm" 
          hidden={!opened}
          sx={(theme) => ({
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
          })}
        >
          <Navbar.Section grow mt="md">
            {navItems.map(item => (
              <NavLink
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={pathname === item.href || pathname?.startsWith(`${item.href}/`)}
              />
            ))}
          </Navbar.Section>
          <Navbar.Section>
            <Divider my="md" />
            <NavLink
              icon={<IconLogout size={18} />}
              label="Выйти"
              href="#"
              onClick={handleLogout}
            />
          </Navbar.Section>
        </Navbar>
      }
      header={
        <Header height={60} p="md" sx={(theme) => ({
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        })}>
          <Group sx={{ height: '100%' }} position="apart">
            <Group>
              <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                <Burger 
                  opened={opened} 
                  onClick={() => setOpened(o => !o)} 
                  size="sm" 
                  color={theme.colors.gray[6]}
                  mr="xl" 
                />
              </MediaQuery>
              <Title order={3} color={theme.primaryColor}>MaK 3 CRM</Title>
            </Group>
            <Group>
              <ActionIcon
                variant="default"
                onClick={() => toggleColorScheme()}
                size="lg"
                radius="md"
                aria-label="Переключить тему"
              >
                {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoonStars size={18} />}
              </ActionIcon>

              <Menu
                width={200}
                position="bottom-end"
                onClose={() => setUserMenuOpened(false)}
                onOpen={() => setUserMenuOpened(true)}
              >
                <Menu.Target>
                  <UnstyledButton>
                    <Group spacing={7}>
                      <Avatar 
                        src={null} 
                        alt={user?.firstName || 'Пользователь'} 
                        radius="xl" 
                        size={30}
                        color="blue"
                      >
                        {user?.firstName ? user.firstName[0] : 'П'}
                      </Avatar>
                      <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
                        <Box>
                          <Text weight={500} size="sm" sx={{ lineHeight: 1 }} mr={3}>
                            {user?.firstName} {user?.lastName}
                          </Text>
                          <Text color="dimmed" size="xs">
                            {user?.email}
                          </Text>
                        </Box>
                      </MediaQuery>
                    </Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item icon={<IconUser size={14} />} component={Link} href="/profile">
                    Профиль
                  </Menu.Item>
                  <Menu.Item icon={<IconSettings size={14} />} component={Link} href="/settings">
                    Настройки
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item color="red" icon={<IconLogout size={14} />} onClick={handleLogout}>
                    Выйти
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Header>
      }
      styles={theme => ({
        main: {
          backgroundColor:
            theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      })}
    >
      {children}
    </AppShell>
  );
}
