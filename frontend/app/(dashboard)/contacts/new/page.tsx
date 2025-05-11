'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Title, Alert, Loader, Center } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import ContactForm from '../../../../components/Contacts/ContactForm';

// Интерфейс для источников и статусов
interface Option {
  value: string;
  label: string;
}

export default function NewContactPage() {
  const router = useRouter();
  const [sources, setSources] = useState<Option[]>([]);
  const [statuses, setStatuses] = useState<Option[]>([]);
  const [users, setUsers] = useState<Option[]>([]);
  const [partners, setPartners] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка справочных данных при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Загружаем источники контактов
        const sourcesResponse = await fetch('/api/contacts/sources/list');
        if (!sourcesResponse.ok) {
          throw new Error('Не удалось загрузить список источников');
        }
        const sourcesData = await sourcesResponse.json();
        
        // Загружаем статусы клиентов
        const statusesResponse = await fetch('/api/contacts/statuses/list');
        if (!statusesResponse.ok) {
          throw new Error('Не удалось загрузить список статусов');
        }
        const statusesData = await statusesResponse.json();
        
        // Загружаем список пользователей (для поля "Ответственный")
        const usersResponse = await fetch('/api/users');
        if (!usersResponse.ok) {
          throw new Error('Не удалось загрузить список пользователей');
        }
        const usersData = await usersResponse.json();
        
        // Загружаем список партнеров
        const partnersResponse = await fetch('/api/partners');
        if (!partnersResponse.ok) {
          throw new Error('Не удалось загрузить список партнеров');
        }
        const partnersData = await partnersResponse.json();
        
        // Преобразуем данные в формат для Select
        setSources(
          Object.entries(sourcesData).map(([value, label]) => ({
            value,
            label: String(label),
          }))
        );
        
        setStatuses(
          Object.entries(statusesData).map(([value, label]) => ({
            value,
            label: String(label),
          }))
        );
        
        setUsers(
          usersData.map((user: any) => ({
            value: user.id,
            label: `${user.lastName} ${user.firstName}`,
          }))
        );
        
        setPartners(
          partnersData.map((partner: any) => ({
            value: partner.id,
            label: partner.name,
          }))
        );
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Обработчик отправки формы
  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось создать контакт');
      }
      
      // После успешного создания переходим на страницу со списком контактов
      router.push('/contacts');
      router.refresh();
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <Center style={{ height: 400 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <div className="p-4">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs">
          <Title order={2}>Создание нового контакта</Title>
        </Card.Section>
        
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Ошибка" color="red" mt="md">
            {error}
          </Alert>
        )}
        
        <div className="mt-4">
          <ContactForm
            onSubmit={handleSubmit}
            sources={sources}
            statuses={statuses}
            users={users}
            partners={partners}
          />
        </div>
      </Card>
    </div>
  );
}
