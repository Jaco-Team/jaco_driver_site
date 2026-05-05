import React from 'react';
import { AppHeader } from '@/widgets/app-header/ui/AppHeader';
import Meta from '@/components/meta';
import { useProtectedRoute } from '@/shared/lib/session/useProtectedRoute';
import { OrdersPage } from '@/widgets/order/ui/OrdersPage';
import FeedbackPage from '@/widgets/feedback/ui/FeedbackPage';

export default function List() {
  const { isAuthenticated } = useProtectedRoute();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Meta title="Предложения">
      <AppHeader />
      <FeedbackPage />
    </Meta>
  );
}
