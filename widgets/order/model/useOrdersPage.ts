import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useSession from '@/components/sessionHook';
import { useOrdersStore } from '@/entities/order/model/order.store';
import { useHeaderStore } from '@/features/header/model/header.store';

export interface UseOrdersPageReturn {
  isLoading: boolean;
  isAuth: boolean | 'load';
}

export const useOrdersPage = (): UseOrdersPageReturn => {
  const router = useRouter();
  const session = useSession();
  const setActivePageRU = useHeaderStore((state: any) => state.setActivePageRU);
  const pointId = useHeaderStore((state: any) => state.pointId);
  const { getOrders, setToken, orders, is_check } = useOrdersStore((state: any) => ({
    getOrders: state.getOrders,
    setToken: state.setToken,
    orders: state.orders,
    is_check: state.is_check,
  }));

  const hasInitialized = useRef<boolean>(false);

  // Устанавливаем заголовок страницы
  useEffect(() => {
    setActivePageRU('Список заказов');
  }, [setActivePageRU]);

  // Логируем pointId для отладки
  useEffect(() => {
    console.log('Current pointId from header store:', pointId);
  }, [pointId]);

  // Основная логика авторизации и первой загрузки
  useEffect(() => {
    console.log('Session state:', session.isAuth);
    console.log('PointId available:', pointId);

    if (session.isAuth === 'load') {
      console.log('Session loading...');
      return;
    }

    if (session.isAuth === false) {
      console.log('Not authenticated, redirecting to auth...');
      router.push('/auth', { scroll: false });
      return;
    }

    if (session.isAuth === true && !hasInitialized.current) {
      console.log('Authenticated, initializing orders...');
      hasInitialized.current = true;

      // Устанавливаем токен
      if (session?.token) {
        setToken(session.token);
        console.log('Token set:', session.token);
      }

      // Загружаем настройки, чтобы получить pointId
      const loadSettingsAndOrders = async () => {
        try {
          // Если pointId еще не загружен, ждем его
          if (!pointId) {
            console.log('Waiting for pointId to load...');
            // Подписываемся на изменение pointId
            const unsubscribe = useHeaderStore.subscribe((state) => {
              const newPointId = (state as any).pointId;
              if (newPointId) {
                console.log('PointId loaded:', newPointId);
                unsubscribe();
                console.log('Calling getOrders with pointId:', newPointId);
                getOrders(false, newPointId);
              }
            });

            // Таймаут на случай, если pointId не загрузится
            setTimeout(() => {
              unsubscribe();
              const currentPointId = useHeaderStore.getState().pointId;
              if (currentPointId) {
                console.log('Calling getOrders with pointId (timeout):', currentPointId);
                getOrders(false, currentPointId);
              } else {
                console.warn('PointId not loaded after timeout, calling without pointId');
                getOrders(false, undefined);
              }
            }, 3000);
          } else {
            console.log('Calling getOrders with pointId:', pointId);
            getOrders(false, pointId);
          }
        } catch (error) {
          console.error('Error loading settings:', error);
          getOrders(false, undefined);
        }
      };

      loadSettingsAndOrders();
    }
  }, [session.isAuth, session?.token, router, setToken, getOrders, pointId]);

  // Отладка - логируем состояние заказов
  useEffect(() => {
    if (orders.length > 0) {
      console.log(`Loaded ${orders.length} orders`);
    }
    if (is_check) {
      console.log('Orders are being fetched...');
    }
  }, [orders.length, is_check]);

  return {
    isLoading: session.isAuth === 'load',
    isAuth: session.isAuth,
  };
};
