import React, { useEffect } from 'react';

import { AppHeader } from '@/widgets/app-header/ui/AppHeader';
import Meta from '@/components/meta';
import { useProtectedRoute } from '@/shared/lib/session/useProtectedRoute';
import { useHeaderStore } from '@/features/header/model/header.store';
import { useOrdersStore } from '@/entities/order/model/order.store';
import { OrdersMapScreen } from '@/widgets/orders-map-screen/ui/OrdersMapScreen';

export default function Map() {
  const { isAuthenticated, session } = useProtectedRoute();
  const setActivePageRU = useHeaderStore((state) => state.setActivePageRU);
  const { getOrders, setToken, clearMap } = useOrdersStore((state) => ({
    getOrders: state.getOrders,
    setToken: state.setToken,
    clearMap: state.clearMap,
  }));

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
      <OrdersMapScreen />
    </Meta>
  );
}
