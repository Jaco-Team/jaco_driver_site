import React, { useEffect } from 'react';

import dynamic from 'next/dynamic';
import { AppHeader } from '@/widgets/app-header/ui/AppHeader';
import Meta from '@/components/meta';
import { useProtectedRoute } from '@/shared/lib/session/useProtectedRoute';
import { useHeaderStore } from '@/features/header/model/header.store';

const DynamicPriceScreen = dynamic(() => import('@/widgets/price-screen/ui/PriceScreen'));

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
      <AppHeader />
      <DynamicPriceScreen />
    </Meta>
  );
}
