'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Paper, Text, Group, Badge, Avatar } from '@mantine/core';
import { IconUser, IconCurrencyRubel } from '@tabler/icons-react';

interface Deal {
  id: string;
  title: string;
  amount: number | null;
  stageId: string;
  contactId: string;
  assignedToId: string | null;
  partnerId: string | null;
  contact?: {
    firstName: string;
    lastName: string;
  };
  assignedTo?: {
    firstName: string;
    lastName: string;
  };
}

interface DealCardProps {
  deal: Deal;
}

const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: deal.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  // Получаем инициалы контакта или ответственного
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return '?';
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  // Получаем полное имя контакта
  const getFullName = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'Не указан';
    return `${firstName || ''} ${lastName || ''}`.trim();
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      shadow="sm"
      p="sm"
      withBorder
      sx={{
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Text weight={500} mb="xs" lineClamp={2}>
        {deal.title}
      </Text>

      {deal.amount && (
        <Group spacing="xs" mb="xs">
          <IconCurrencyRubel size={16} />
          <Text size="sm">
            {new Intl.NumberFormat('ru-RU', { 
              style: 'currency', 
              currency: 'RUB',
              maximumFractionDigits: 0 
            }).format(deal.amount)}
          </Text>
        </Group>
      )}

      {deal.contact && (
        <Group spacing="xs" mb="xs">
          <Avatar size="sm" radius="xl" color="blue">
            {getInitials(deal.contact.firstName, deal.contact.lastName)}
          </Avatar>
          <Text size="sm" lineClamp={1}>
            {getFullName(deal.contact.firstName, deal.contact.lastName)}
          </Text>
        </Group>
      )}

      {deal.assignedTo && (
        <Group spacing="xs">
          <Badge 
            size="sm" 
            leftSection={<IconUser size={12} />}
            variant="outline"
          >
            {getFullName(deal.assignedTo.firstName, deal.assignedTo.lastName)}
          </Badge>
        </Group>
      )}
    </Paper>
  );
};

export default DealCard;
