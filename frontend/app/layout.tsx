import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'dayjs/locale/ru';
import './globals.css';
import ClientProviders from '@/components/providers/ClientProviders';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'MaK 3 CRM',
  description: 'Современная CRM-система для кредитного брокериджа',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head />
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
