import React, { useEffect } from 'react';

import dynamic from 'next/dynamic';
import Meta from '@/components/meta';
import { useProtectedRoute } from '@/shared/lib/session/useProtectedRoute';

const DynamicHeader = dynamic(() => import('@/modules/header.jsx'));
const DynamicHomePage = dynamic(() => import('@/modules/statistics_page.jsx'));

import { useHeaderStore } from '@/components/store.js';

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
      <DynamicHeader />
      <DynamicHomePage />
    </Meta>
  );
}
