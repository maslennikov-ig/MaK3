'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Title, Alert, Loader, Center } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import ContactForm from '../../../../../components/Contacts/ContactForm';

// Интерфейс для источников и статусов
interface Option {
  value: string;
  label: string;
}

export default function EditContactPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [contact, setContact] = useState<any>(null);
  const [sources, setSources] = useState<Option[]>([]);
  const [statuses, setStatuses] = useState<Option[]>([]);
  const [users, setUsers] = useState<Option[]>([]);
  const [partners, setPartners] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных контакта и справочников
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Загружаем данные контакта
        const contactResponse = await fetch(`/api/contacts/${params.id}`);
        if (!contactResponse.ok) {
          throw new Error('Не удалось загрузить данные контакта');
        }
        const contactData = await contactResponse.json();
        setContact(contactData);
        
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
        
        // Загружаем список пользователей
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
  }, [params.id]);

  // Обработчик обновления контакта
  const handleUpdate = async (data: any) => {
    try {
      const response = await fetch(`/api/contacts/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось обновить контакт');
      }
      
      // После успешного обновления переходим на страницу просмотра контакта
      router.push(`/contacts/${params.id}`);
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

  if (!contact) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Ошибка" color="red" mt="md">
        Контакт не найден
      </Alert>
    );
  }

  return (
    <div className="p-4">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs">
          <Title order={2}>Редактирование контакта</Title>
        </Card.Section>
        
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Ошибка" color="red" mt="md">
            {error}
          </Alert>
        )}
        
        <div className="mt-4">
          <ContactForm
            initialData={contact}
            onSubmit={handleUpdate}
            sources={sources}
            statuses={statuses}
            users={users}
            partners={partners}
            isEditMode={true}
          />
        </div>
      </Card>
    </div>
  );
}
