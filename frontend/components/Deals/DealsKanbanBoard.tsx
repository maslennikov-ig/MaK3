'use client';

import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Box, Group, Paper, Text, Title, Loader, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import KanbanColumn from './KanbanColumn';
import DealCard from './DealCard';

// Типы данных
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

interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color?: string;
  pipelineId: string;
}

interface Pipeline {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  stages: PipelineStage[];
}

interface DealsKanbanBoardProps {
  pipelineId?: string;
}

const DealsKanbanBoard: React.FC<DealsKanbanBoardProps> = ({ pipelineId }) => {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Загрузка данных о воронке и сделках
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Получаем список воронок, если pipelineId не указан
        if (!pipelineId) {
          const pipelinesResponse = await fetch('/api/pipelines');
          if (!pipelinesResponse.ok) {
            throw new Error('Не удалось загрузить воронки продаж');
          }
          const pipelinesData = await pipelinesResponse.json();
          if (pipelinesData.length === 0) {
            throw new Error('Нет доступных воронок продаж');
          }
          
          // Используем первую активную воронку по умолчанию
          const activePipeline = pipelinesData.find((p: Pipeline) => p.isActive) || pipelinesData[0];
          setPipeline(activePipeline);
          
          // Загружаем сделки для выбранной воронки
          const dealsResponse = await fetch(`/api/deals?pipelineId=${activePipeline.id}`);
          if (!dealsResponse.ok) {
            throw new Error('Не удалось загрузить сделки');
          }
          const dealsData = await dealsResponse.json();
          setDeals(dealsData.deals || []);
        } else {
          // Если pipelineId указан, загружаем данные конкретной воронки
          const pipelineResponse = await fetch(`/api/pipelines/${pipelineId}`);
          if (!pipelineResponse.ok) {
            throw new Error('Не удалось загрузить воронку продаж');
          }
          const pipelineData = await pipelineResponse.json();
          setPipeline(pipelineData);
          
          // Загружаем сделки для указанной воронки
          const dealsResponse = await fetch(`/api/deals?pipelineId=${pipelineId}`);
          if (!dealsResponse.ok) {
            throw new Error('Не удалось загрузить сделки');
          }
          const dealsData = await dealsResponse.json();
          setDeals(dealsData.deals || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pipelineId]);

  // Обработчик начала перетаскивания
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedDeal = deals.find(deal => deal.id === active.id);
    if (draggedDeal) {
      setActiveDeal(draggedDeal);
    }
  };

  // Обработчик окончания перетаскивания
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    // Если перетаскиваемая сделка перемещена в другой этап
    if (active.id !== over.id) {
      const dealId = active.id.toString();
      const newStageId = over.id.toString();
      
      // Находим сделку, которую перетаскиваем
      const dealToUpdate = deals.find(deal => deal.id === dealId);
      
      if (dealToUpdate) {
        // Оптимистичное обновление UI
        setDeals(currentDeals => 
          currentDeals.map(deal => 
            deal.id === dealId ? { ...deal, stageId: newStageId } : deal
          )
        );
        
        try {
          // Отправляем запрос на обновление этапа сделки
          const response = await fetch(`/api/deals/${dealId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ stageId: newStageId }),
          });
          
          if (!response.ok) {
            throw new Error('Не удалось обновить этап сделки');
          }
          
          // Обновление прошло успешно, ничего делать не нужно
        } catch (err) {
          // В случае ошибки возвращаем сделку на прежнее место
          setDeals(currentDeals => 
            currentDeals.map(deal => 
              deal.id === dealId ? { ...deal, stageId: dealToUpdate.stageId } : deal
            )
          );
          
          setError(err instanceof Error ? err.message : 'Произошла ошибка при обновлении сделки');
        }
      }
    }
    
    setActiveDeal(null);
  };

  // Получение сделок для конкретного этапа
  const getDealsForStage = (stageId: string) => {
    return deals.filter(deal => deal.stageId === stageId);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Loader size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size="1rem" />} title="Ошибка" color="red">
        {error}
      </Alert>
    );
  }

  if (!pipeline) {
    return (
      <Alert icon={<IconAlertCircle size="1rem" />} title="Информация" color="blue">
        Нет доступных воронок продаж
      </Alert>
    );
  }

  return (
    <Box p="md">
      <Title order={2} mb="md">{pipeline.name}</Title>
      {pipeline.description && <Text mb="xl" color="dimmed">{pipeline.description}</Text>}
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Group align="flex-start" spacing="md" style={{ overflowX: 'auto', minHeight: 'calc(100vh - 200px)' }}>
          {pipeline.stages.sort((a, b) => a.order - b.order).map(stage => (
            <KanbanColumn 
              key={stage.id} 
              id={stage.id}
              title={stage.name}
              color={stage.color || '#228be6'}
            >
              <SortableContext 
                items={getDealsForStage(stage.id).map(deal => deal.id)}
                strategy={verticalListSortingStrategy}
              >
                {getDealsForStage(stage.id).map(deal => (
                  <DealCard 
                    key={deal.id} 
                    deal={deal} 
                  />
                ))}
              </SortableContext>
            </KanbanColumn>
          ))}
        </Group>
        
        <DragOverlay>
          {activeDeal ? (
            <Paper shadow="md" p="sm" withBorder style={{ width: '250px' }}>
              <Text weight={500}>{activeDeal.title}</Text>
              {activeDeal.amount && (
                <Text size="sm" color="dimmed">
                  {new Intl.NumberFormat('ru-RU', { 
                    style: 'currency', 
                    currency: 'RUB',
                    maximumFractionDigits: 0 
                  }).format(activeDeal.amount)}
                </Text>
              )}
              {activeDeal.contact && (
                <Text size="sm">
                  {`${activeDeal.contact.firstName} ${activeDeal.contact.lastName}`}
                </Text>
              )}
            </Paper>
          ) : null}
        </DragOverlay>
      </DndContext>
    </Box>
  );
};

export default DealsKanbanBoard;
