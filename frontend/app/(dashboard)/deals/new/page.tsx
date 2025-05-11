'use client';

import React from 'react';
import { Container, Title } from '@mantine/core';
import DealForm from '@/components/Deals/DealForm';

const NewDealPage = () => {
  return (
    <Container size="md">
      <Title order={2} mb="xl">Создание новой сделки</Title>
      <DealForm />
    </Container>
  );
};

export default NewDealPage;
