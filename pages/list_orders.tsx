import React from 'react';
import dynamic from 'next/dynamic';
import Meta from '@/components/meta';
import { useProtectedRoute } from '@/shared/lib/session/useProtectedRoute';
import { OrdersPage } from '@/widgets/order/ui/OrdersPage';

const DynamicHeader = dynamic(() => import('@/modules/header.jsx'));

export default function List() {
  const { isAuthenticated } = useProtectedRoute();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Meta title="Список заказов">
      <DynamicHeader />
      <OrdersPage />
    </Meta>
  );
}
