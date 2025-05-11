'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  TextInput,
  Textarea,
  Button,
  Group,
  Box,
  Select,
  Switch,
  LoadingOverlay,
  Alert,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

// Схема валидации с использованием Zod
const contactSchema = z.object({
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().min(1, 'Фамилия обязательна'),
  middleName: z.string().optional(),
  phone: z.string().min(1, 'Телефон обязателен'),
  email: z.string().email('Некорректный email').optional().or(z.literal('')),
  source: z.string().min(1, 'Источник обязателен'),
  statusClient: z.string().min(1, 'Статус обязателен'),
  isLead: z.boolean(),
  notes: z.string().optional(),
  assignedToId: z.string().optional(),
  partnerId: z.string().optional(),
});

// Тип данных на основе схемы
type ContactFormData = z.infer<typeof contactSchema>;

// Интерфейс для пропсов компонента
interface ContactFormProps {
  initialData?: Partial<ContactFormData>;
  onSubmit: (data: ContactFormData) => Promise<void>;
  sources: { value: string; label: string }[];
  statuses: { value: string; label: string }[];
  users: { value: string; label: string }[];
  partners?: { value: string; label: string }[];
  isEditMode?: boolean;
}

export default function ContactForm({
  initialData,
  onSubmit,
  sources,
  statuses,
  users,
  partners = [],
  isEditMode = false,
}: ContactFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Инициализация формы с React Hook Form
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      phone: '',
      email: '',
      source: '',
      statusClient: '',
      isLead: true,
      notes: '',
      assignedToId: '',
      partnerId: '',
      ...initialData,
    },
  });

  // Обработчик отправки формы
  const handleFormSubmit = async (data: ContactFormData) => {
    try {
      setLoading(true);
      setError(null);
      await onSubmit(data);
      if (!isEditMode) {
        // Сбрасываем форму только при создании нового контакта
        reset();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при сохранении контакта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} overlayBlur={2} />
      
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Ошибка" color="red" mb="md">
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Group grow mb="md">
          <TextInput
            label="Фамилия"
            placeholder="Введите фамилию"
            {...register('lastName')}
            error={errors.lastName?.message}
            withAsterisk
          />
          
          <TextInput
            label="Имя"
            placeholder="Введите имя"
            {...register('firstName')}
            error={errors.firstName?.message}
            withAsterisk
          />
        </Group>
        
        <Group grow mb="md">
          <TextInput
            label="Отчество"
            placeholder="Введите отчество (если есть)"
            {...register('middleName')}
            error={errors.middleName?.message}
          />
          
          <TextInput
            label="Телефон"
            placeholder="+7 (999) 123-45-67"
            {...register('phone')}
            error={errors.phone?.message}
            withAsterisk
          />
        </Group>
        
        <Group grow mb="md">
          <TextInput
            label="Email"
            placeholder="example@mail.com"
            {...register('email')}
            error={errors.email?.message}
          />
          
          <Controller
            name="source"
            control={control}
            render={({ field }) => (
              <Select
                label="Источник"
                placeholder="Выберите источник"
                data={sources}
                error={errors.source?.message}
                withAsterisk
                {...field}
              />
            )}
          />
        </Group>
        
        <Group grow mb="md">
          <Controller
            name="statusClient"
            control={control}
            render={({ field }) => (
              <Select
                label="Статус"
                placeholder="Выберите статус"
                data={statuses}
                error={errors.statusClient?.message}
                withAsterisk
                {...field}
              />
            )}
          />
          
          <Controller
            name="assignedToId"
            control={control}
            render={({ field }) => (
              <Select
                label="Ответственный"
                placeholder="Выберите ответственного"
                data={users}
                error={errors.assignedToId?.message}
                {...field}
              />
            )}
          />
        </Group>
        
        {partners.length > 0 && (
          <Group grow mb="md">
            <Controller
              name="partnerId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Партнер"
                  placeholder="Выберите партнера"
                  data={partners}
                  error={errors.partnerId?.message}
                  {...field}
                />
              )}
            />
          </Group>
        )}
        
        <Group mb="md">
          <Controller
            name="isLead"
            control={control}
            render={({ field }) => (
              <Switch
                label="Это лид (не клиент)"
                checked={field.value}
                onChange={event => field.onChange(event.currentTarget.checked)}
              />
            )}
          />
        </Group>
        
        <Textarea
          label="Примечания"
          placeholder="Дополнительная информация о контакте"
          minRows={3}
          mb="md"
          {...register('notes')}
          error={errors.notes?.message}
        />
        
        <Group position="right" mt="md">
          <Button type="button" variant="outline" onClick={() => reset()}>
            Сбросить
          </Button>
          <Button type="submit">
            {isEditMode ? 'Сохранить изменения' : 'Создать контакт'}
          </Button>
        </Group>
      </form>
    </Box>
  );
}
