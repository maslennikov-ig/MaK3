'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextInput,
  NumberInput,
  Textarea,
  Button,
  Group,
  Box,
  Select,
  LoadingOverlay,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface Partner {
  id: string;
  name: string;
}

interface PipelineStage {
  id: string;
  name: string;
  pipelineId: string;
}

interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
}

interface DealFormProps {
  dealId?: string;
}

const DealForm: React.FC<DealFormProps> = ({ dealId }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);

  const form = useForm({
    initialValues: {
      title: '',
      amount: null as number | null,
      description: '',
      stageId: '',
      contactId: '',
      assignedToId: '',
      partnerId: '',
    },
    validate: {
      title: (value) => (value ? null : 'Название сделки обязательно'),
      stageId: (value) => (value ? null : 'Этап сделки обязателен'),
      contactId: (value) => (value ? null : 'Контакт обязателен'),
    },
  });

  // Загрузка данных для формы
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Загружаем контакты
        const contactsResponse = await fetch('/api/contacts');
        if (!contactsResponse.ok) {
          throw new Error('Не удалось загрузить контакты');
        }
        const contactsData = await contactsResponse.json();
        setContacts(contactsData.contacts || []);

        // Загружаем пользователей
        const usersResponse = await fetch('/api/users');
        if (!usersResponse.ok) {
          throw new Error('Не удалось загрузить пользователей');
        }
        const usersData = await usersResponse.json();
        setUsers(usersData || []);

        // Загружаем партнеров
        const partnersResponse = await fetch('/api/partners');
        if (!partnersResponse.ok) {
          throw new Error('Не удалось загрузить партнеров');
        }
        const partnersData = await partnersResponse.json();
        setPartners(partnersData || []);

        // Загружаем воронки продаж
        const pipelinesResponse = await fetch('/api/pipelines');
        if (!pipelinesResponse.ok) {
          throw new Error('Не удалось загрузить воронки продаж');
        }
        const pipelinesData = await pipelinesResponse.json();
        setPipelines(pipelinesData || []);

        // Если есть хотя бы одна воронка, загружаем ее этапы
        if (pipelinesData && pipelinesData.length > 0) {
          const firstPipeline = pipelinesData[0];
          setStages(firstPipeline.stages || []);
        }

        // Если редактируем существующую сделку, загружаем ее данные
        if (dealId) {
          const dealResponse = await fetch(`/api/deals/${dealId}`);
          if (!dealResponse.ok) {
            throw new Error('Не удалось загрузить данные сделки');
          }
          const dealData = await dealResponse.json();
          
          // Загружаем этапы для воронки этой сделки
          if (dealData.stage && dealData.stage.pipelineId) {
            const pipelineResponse = await fetch(`/api/pipelines/${dealData.stage.pipelineId}`);
            if (pipelineResponse.ok) {
              const pipelineData = await pipelineResponse.json();
              setStages(pipelineData.stages || []);
            }
          }
          
          // Заполняем форму данными сделки
          form.setValues({
            title: dealData.title || '',
            amount: dealData.amount || null,
            description: dealData.description || '',
            stageId: dealData.stageId || '',
            contactId: dealData.contactId || '',
            assignedToId: dealData.assignedToId || '',
            partnerId: dealData.partnerId || '',
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [dealId, form]);

  // Обработчик изменения воронки
  const handlePipelineChange = (pipelineId: string) => {
    const selectedPipeline = pipelines.find(p => p.id === pipelineId);
    if (selectedPipeline) {
      setStages(selectedPipeline.stages || []);
      form.setFieldValue('stageId', ''); // Сбрасываем выбранный этап
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      setError(null);

      const url = dealId ? `/api/deals/${dealId}` : '/api/deals';
      const method = dealId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Произошла ошибка при сохранении сделки');
      }

      // Перенаправляем на страницу сделок
      router.push('/deals');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при сохранении сделки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} overlayBlur={2} />
      
      {error && (
        <Alert icon={<IconAlertCircle size="1rem" />} title="Ошибка" color="red" mb="md">
          {error}
        </Alert>
      )}
      
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Название сделки"
          placeholder="Введите название сделки"
          required
          mb="md"
          {...form.getInputProps('title')}
        />
        
        <NumberInput
          label="Сумма сделки"
          placeholder="Введите сумму сделки"
          mb="md"
          {...form.getInputProps('amount')}
        />
        
        <Textarea
          label="Описание"
          placeholder="Введите описание сделки"
          mb="md"
          {...form.getInputProps('description')}
        />
        
        <Select
          label="Контакт"
          placeholder="Выберите контакт"
          required
          mb="md"
          data={contacts.map(contact => ({
            value: contact.id,
            label: `${contact.firstName} ${contact.lastName}`,
          }))}
          {...form.getInputProps('contactId')}
        />
        
        <Select
          label="Воронка продаж"
          placeholder="Выберите воронку продаж"
          mb="md"
          data={pipelines.map(pipeline => ({
            value: pipeline.id,
            label: pipeline.name,
          }))}
          onChange={handlePipelineChange}
        />
        
        <Select
          label="Этап сделки"
          placeholder="Выберите этап сделки"
          required
          mb="md"
          data={stages.map(stage => ({
            value: stage.id,
            label: stage.name,
          }))}
          {...form.getInputProps('stageId')}
        />
        
        <Select
          label="Ответственный"
          placeholder="Выберите ответственного"
          mb="md"
          data={users.map(user => ({
            value: user.id,
            label: `${user.firstName} ${user.lastName}`,
          }))}
          {...form.getInputProps('assignedToId')}
        />
        
        <Select
          label="Партнер"
          placeholder="Выберите партнера"
          mb="md"
          data={partners.map(partner => ({
            value: partner.id,
            label: partner.name,
          }))}
          {...form.getInputProps('partnerId')}
        />
        
        <Group position="right" mt="xl">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Отмена
          </Button>
          <Button type="submit" loading={loading}>
            {dealId ? 'Сохранить' : 'Создать'}
          </Button>
        </Group>
      </form>
    </Box>
  );
};

export default DealForm;
