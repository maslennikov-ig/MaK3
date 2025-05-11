'use client';

import { useState } from 'react';
import { 
  Navbar as MantineNavbar, 
  ScrollArea, 
  createStyles, 
  rem,
  UnstyledButton,
  Group,
  ThemeIcon,
  Text
} from '@mantine/core';
import { 
  IconHome2, 
  IconUsers, 
  IconBuildingStore, 
  IconChartBar, 
  IconSettings,
  IconChevronRight,
  IconChevronLeft
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const useStyles = createStyles((theme) => ({
  navbar: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
    paddingBottom: 0,
  },

  links: {
    marginLeft: `calc(${theme.spacing.md} * -1)`,
    marginRight: `calc(${theme.spacing.md} * -1)`,
  },

  linksInner: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },

  link: {
    display: 'block',
    width: '100%',
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    borderRadius: theme.radius.sm,
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
    textDecoration: 'none',
    
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
    },
  },

  linkActive: {
    '&, &:hover': {
      backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
      color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
    },
  },
}));

interface NavbarLinkProps {
  icon: React.FC<any>;
  label: string;
  href: string;
  active?: boolean;
}

function NavbarLink({ icon: Icon, label, href, active }: NavbarLinkProps) {
  const { classes, cx } = useStyles();
  
  return (
    <UnstyledButton 
      component={Link} 
      href={href}
      className={cx(classes.link, { [classes.linkActive]: active })}
    >
      <Group>
        <ThemeIcon variant={active ? 'filled' : 'light'} size={30}>
          <Icon size={18} />
        </ThemeIcon>
        <Text size="sm">{label}</Text>
      </Group>
    </UnstyledButton>
  );
}

const navItems = [
  { icon: IconHome2, label: 'Дашборд', href: '/dashboard' },
  { icon: IconUsers, label: 'Клиенты', href: '/clients' },
  { icon: IconBuildingStore, label: 'Сделки', href: '/deals' },
  { icon: IconChartBar, label: 'Аналитика', href: '/analytics' },
  { icon: IconSettings, label: 'Настройки', href: '/settings' },
];

interface NavbarProps {
  opened: boolean;
}

export default function Navbar({ opened }: NavbarProps) {
  const { classes } = useStyles();
  const pathname = usePathname();

  return (
    <MantineNavbar
      p="md"
      hiddenBreakpoint="sm"
      hidden={!opened}
      width={{ sm: 200, lg: 250 }}
      className={classes.navbar}
    >
      <MantineNavbar.Section grow component={ScrollArea} className={classes.links}>
        <div className={classes.linksInner}>
          {navItems.map((item) => (
            <NavbarLink
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={pathname === item.href || pathname?.startsWith(`${item.href}/`)}
            />
          ))}
        </div>
      </MantineNavbar.Section>
    </MantineNavbar>
  );
}
