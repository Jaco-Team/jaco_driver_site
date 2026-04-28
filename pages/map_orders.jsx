import React, { useEffect } from 'react';

import dynamic from 'next/dynamic';
import { AppHeader } from '@/widgets/app-header/ui/AppHeader';

import Meta from '@/components/meta';
import { useProtectedRoute } from '@/shared/lib/session/useProtectedRoute';
import { useHeaderStore } from '@/features/header/model/header.store';

const DynamicHomePage = dynamic(() => import('@/modules/map.jsx'));

import { useOrdersStore } from '@/components/store.js';

export default function Map() {
  const { isAuthenticated, session } = useProtectedRoute();

  const [setActivePageRU] = useHeaderStore((state) => [state.setActivePageRU]);
  const [getOrders, setToken, clearMap] = useOrdersStore((state) => [
    state.getOrders,
    state.setToken,
    state.clearMap,
  ]);

  useEffect(() => {
    setActivePageRU('Карта заказов');
    clearMap();

    if (session.isAuth === true) {
      setToken(session?.token ?? '');
      getOrders(true);
    }
  }, [clearMap, getOrders, session.isAuth, session?.token, setActivePageRU, setToken]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Meta title="Карта заказов">
      <AppHeader />
      <DynamicHomePage />
    </Meta>
  );
}
