import React from 'react';
import dynamic from 'next/dynamic';
import { OrdersPage } from '@/widgets/order/ui/OrdersPage';

const DynamicHeader = dynamic(() => import('@/modules/header.jsx'));

export default function List() {
  return (
    <>
      <DynamicHeader />
      <OrdersPage />
    </>
  );
}
