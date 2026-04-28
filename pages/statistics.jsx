import React, { useEffect } from 'react';

import dynamic from 'next/dynamic';
import { AppHeader } from '@/widgets/app-header/ui/AppHeader';
import Meta from '@/components/meta';
import { useProtectedRoute } from '@/shared/lib/session/useProtectedRoute';
import { useHeaderStore } from '@/features/header/model/header.store';

const DynamicHomePage = dynamic(() => import('@/modules/statistics_page.jsx'));

export default function Statistics() {
  const { isAuthenticated } = useProtectedRoute();

  const [setActivePageRU] = useHeaderStore((state) => [state.setActivePageRU]);

  useEffect(() => {
    setActivePageRU('Статистика');
  }, [setActivePageRU]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Meta title="Статистика">
      <AppHeader />
      <DynamicHomePage />
    </Meta>
  );
}
