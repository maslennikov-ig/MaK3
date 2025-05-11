'use client';

import React from 'react';
import { Container, Title } from '@mantine/core';
import DealForm from '@/components/Deals/DealForm';

interface EditDealPageProps {
  params: {
    id: string;
  };
}

const EditDealPage = ({ params }: EditDealPageProps) => {
  return (
    <Container size="md">
      <Title order={2} mb="xl">Редактирование сделки</Title>
      <DealForm dealId={params.id} />
    </Container>
  );
};

export default EditDealPage;
