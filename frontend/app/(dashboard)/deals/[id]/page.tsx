'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Group,
  Button,
  Tabs,
  Paper,
  Text,
  Grid,
  Badge,
  Loader,
  Alert,
  Box,
  ActionIcon,
} from '@mantine/core';
import { 
  IconEdit, 
  IconTrash, 
  IconArrowLeft, 
  IconInfoCircle, 
  IconHistory, 
  IconMessageCircle, 
  IconPaperclip,
  IconAlertCircle,
} from '@tabler/icons-react';
import { modals } from '@mantine/modals';

interface Deal {
  id: string;
  title: string;
  amount: number | null;
  description: string | null;
  stageId: string;
  contactId: string;
  assignedToId: string | null;
  partnerId: string | null;
  createdAt: string;
  updatedAt: string;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  partner?: {
    id: string;
    name: string;
  };
  stage?: {
    id: string;
    name: string;
    pipeline: {
      id: string;
      name: string;
    };
  };
}

interface DealPageProps {
  params: {
    id: string;
  };
}

const DealPage = ({ params }: DealPageProps) => {
  const { id } = params;
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('info');

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/deals/${id}`);
        if (!response.ok) {
          throw new Error('Не удалось загрузить данные сделки');
        }
        
        const data = await response.json();
        setDeal(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeal();
  }, [id]);

  const handleDelete = () => {
    modals.openConfirmModal({
      title: 'Удаление сделки',
      centered: true,
      children: (
        <Text size="sm">
          Вы уверены, что хотите удалить эту сделку? Это действие нельзя отменить.
        </Text>
      ),
      labels: { confirm: 'Удалить', cancel: 'Отмена' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/deals/${id}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error('Не удалось удалить сделку');
          }
          
          router.push('/deals');
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Произошла ошибка при удалении сделки');
        }
      },
    });
  };

  if (loading) {
    return (
      <Container fluid>
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <Loader size="xl" />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid>
        <Alert icon={<IconAlertCircle size="1rem" />} title="Ошибка" color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  if (!deal) {
    return (
      <Container fluid>
        <Alert icon={<IconAlertCircle size="1rem" />} title="Информация" color="blue">
          Сделка не найдена
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Group position="apart" mb="md">
        <Group>
          <ActionIcon variant="subtle" onClick={() => router.back()}>
            <IconArrowLeft size={16} />
          </ActionIcon>
          <Title order={2}>{deal.title}</Title>
        </Group>
        <Group>
          <Button 
            variant="outline" 
            leftIcon={<IconEdit size={16} />}
            onClick={() => router.push(`/deals/${id}/edit`)}
          >
            Редактировать
          </Button>
          <Button 
            color="red" 
            variant="outline" 
            leftIcon={<IconTrash size={16} />}
            onClick={handleDelete}
          >
            Удалить
          </Button>
        </Group>
      </Group>

      <Tabs value={activeTab} onTabChange={setActiveTab} mb="md">
        <Tabs.List>
          <Tabs.Tab value="info" icon={<IconInfoCircle size={16} />}>
            Информация
          </Tabs.Tab>
          <Tabs.Tab value="history" icon={<IconHistory size={16} />}>
            История изменений
          </Tabs.Tab>
          <Tabs.Tab value="comments" icon={<IconMessageCircle size={16} />}>
            Комментарии
          </Tabs.Tab>
          <Tabs.Tab value="attachments" icon={<IconPaperclip size={16} />}>
            Вложения
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {activeTab === 'info' && (
        <Paper p="md" withBorder>
          <Grid>
            <Grid.Col span={6}>
              <Text weight={500}>Название:</Text>
              <Text mb="md">{deal.title}</Text>

              <Text weight={500}>Сумма:</Text>
              <Text mb="md">
                {deal.amount 
                  ? new Intl.NumberFormat('ru-RU', { 
                      style: 'currency', 
                      currency: 'RUB',
                      maximumFractionDigits: 0 
                    }).format(deal.amount)
                  : 'Не указана'
                }
              </Text>

              <Text weight={500}>Воронка:</Text>
              <Text mb="md">{deal.stage?.pipeline.name || 'Не указана'}</Text>

              <Text weight={500}>Этап:</Text>
              <Badge mb="md">{deal.stage?.name || 'Не указан'}</Badge>
            </Grid.Col>

            <Grid.Col span={6}>
              <Text weight={500}>Контакт:</Text>
              <Text mb="md">
                {deal.contact 
                  ? `${deal.contact.firstName} ${deal.contact.lastName}`
                  : 'Не указан'
                }
              </Text>

              <Text weight={500}>Ответственный:</Text>
              <Text mb="md">
                {deal.assignedTo 
                  ? `${deal.assignedTo.firstName} ${deal.assignedTo.lastName}`
                  : 'Не назначен'
                }
              </Text>

              <Text weight={500}>Партнер:</Text>
              <Text mb="md">{deal.partner?.name || 'Не указан'}</Text>

              <Text weight={500}>Дата создания:</Text>
              <Text mb="md">
                {new Date(deal.createdAt).toLocaleString('ru-RU')}
              </Text>
            </Grid.Col>
          </Grid>

          {deal.description && (
            <>
              <Text weight={500} mt="md">Описание:</Text>
              <Text>{deal.description}</Text>
            </>
          )}
        </Paper>
      )}

      {activeTab === 'history' && (
        <Paper p="md" withBorder>
          <Text>История изменений будет реализована в следующих задачах</Text>
        </Paper>
      )}

      {activeTab === 'comments' && (
        <Paper p="md" withBorder>
          <Text>Комментарии будут реализованы в следующих задачах</Text>
        </Paper>
      )}

      {activeTab === 'attachments' && (
        <Paper p="md" withBorder>
          <Text>Вложения будут реализованы в следующих задачах</Text>
        </Paper>
      )}
    </Container>
  );
};

export default DealPage;
