'use client';

import { useState } from 'react';
import { AppShell, useMantineTheme } from '@mantine/core';
import Header from './Header';
import Navbar from './Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);

  return (
    <AppShell
      styles={{
        main: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      navbar={<Navbar opened={opened} />}
      header={<Header opened={opened} toggle={() => setOpened((o) => !o)} />}
    >
      {children}
    </AppShell>
  );
}
