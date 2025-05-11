'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Paper, Text, Box } from '@mantine/core';

interface KanbanColumnProps {
  id: string;
  title: string;
  color?: string;
  children: React.ReactNode;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, color = '#228be6', children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <Paper
      ref={setNodeRef}
      shadow="xs"
      p="md"
      withBorder
      sx={{
        width: 280,
        minHeight: 500,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isOver ? '#f1f3f5' : 'white',
        transition: 'background-color 0.2s ease',
      }}
    >
      <Box
        mb="md"
        p="xs"
        sx={{
          borderBottom: `3px solid ${color}`,
          borderRadius: '3px 3px 0 0',
        }}
      >
        <Text weight={600} size="lg">
          {title}
        </Text>
      </Box>
      
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {children}
      </Box>
    </Paper>
  );
};

export default KanbanColumn;
