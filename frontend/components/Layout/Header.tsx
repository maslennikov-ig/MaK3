'use client';

import { useState } from 'react';
import { 
  Header as MantineHeader, 
  Group, 
  ActionIcon, 
  useMantineColorScheme, 
  Title, 
  Burger, 
  MediaQuery,
  useMantineTheme,
  Box,
  Avatar,
  Menu,
  UnstyledButton,
  Text
} from '@mantine/core';
import { IconSun, IconMoonStars, IconUser, IconLogout, IconSettings } from '@tabler/icons-react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

interface HeaderProps {
  opened: boolean;
  toggle: () => void;
}

export default function Header({ opened, toggle }: HeaderProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const { user, logout } = useAuthStore();
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <MantineHeader height={60} p="md">
      <Group position="apart" sx={{ height: '100%' }}>
        <Group>
          <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
            <Burger
              opened={opened}
              onClick={toggle}
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
    </MantineHeader>
  );
}
