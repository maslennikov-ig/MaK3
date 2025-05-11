'use client';

import React, { useState } from 'react';
import { Container, Title, Tabs, Button, Group, Select } from '@mantine/core';
import { IconList, IconLayoutKanban, IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import DealsKanbanBoard from '@/components/Deals/DealsKanbanBoard';

const DealsPage = () => {
  const [activeTab, setActiveTab] = useState<string | null>('kanban');
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const router = useRouter();

  const handleCreateDeal = () => {
    router.push('/deals/new');
  };

  return (
    <Container fluid>
      <Group position="apart" mb="md">
        <Title order={2}>Сделки</Title>
        <Button 
          leftIcon={<IconPlus size={16} />} 
          onClick={handleCreateDeal}
        >
          Новая сделка
        </Button>
      </Group>

      <Tabs value={activeTab} onTabChange={setActiveTab} mb="md">
        <Tabs.List>
          <Tabs.Tab value="kanban" icon={<IconLayoutKanban size={16} />}>
            Канбан
          </Tabs.Tab>
          <Tabs.Tab value="list" icon={<IconList size={16} />}>
            Список
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {activeTab === 'kanban' && (
        <DealsKanbanBoard pipelineId={selectedPipeline} />
      )}

      {activeTab === 'list' && (
        <div>
          <p>Список сделок будет реализован в следующих задачах</p>
        </div>
      )}
    </Container>
  );
};

export default DealsPage;
