import React, { useEffect } from 'react';

import dynamic from 'next/dynamic';

import Meta from '@/components/meta';
import { useProtectedRoute } from '@/shared/lib/session/useProtectedRoute';

const DynamicHeader = dynamic(() => import('@/modules/header.jsx'));
const DynamicHomePage = dynamic(() => import('@/modules/map.jsx'));

import { useOrdersStore, useHeaderStore } from '@/components/store.js';

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
      <DynamicHeader />
      <DynamicHomePage />
    </Meta>
  );
}
