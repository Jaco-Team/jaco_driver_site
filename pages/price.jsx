import React, { useEffect } from 'react';

import dynamic from 'next/dynamic';
import Meta from '@/components/meta';
import { useProtectedRoute } from '@/shared/lib/session/useProtectedRoute';

const DynamicHeader = dynamic(() => import('@/modules/header.jsx'));
const DynamicHomePage = dynamic(() => import('@/modules/price_page.jsx'));

import { useHeaderStore } from '@/components/store.js';

export default function Price() {
  const { isAuthenticated } = useProtectedRoute();

  const [setActivePageRU] = useHeaderStore((state) => [state.setActivePageRU]);

  useEffect(() => {
    setActivePageRU('Расчет');
  }, [setActivePageRU]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Meta title="Расчет">
      <DynamicHeader />
      <DynamicHomePage />
    </Meta>
  );
}
