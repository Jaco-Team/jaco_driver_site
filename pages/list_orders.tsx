import React from 'react';
import { AppHeader } from '@/widgets/app-header/ui/AppHeader';
import Meta from '@/components/meta';
import { useProtectedRoute } from '@/shared/lib/session/useProtectedRoute';
import { OrdersPage } from '@/widgets/order/ui/OrdersPage';

export default function List() {
  const { isAuthenticated } = useProtectedRoute();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Meta title="Список заказов">
      <AppHeader />
      <OrdersPage />
    </Meta>
  );
}
