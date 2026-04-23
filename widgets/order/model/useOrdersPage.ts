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

  useEffect(() => {
    console.log('Session state:', session.isAuth);

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

      const loadSettingsAndOrders = async () => {
        try {
          getOrders(false);
        } catch (error) {
          console.error('Error loading settings:', error);
          getOrders(false);
        }
      };

      loadSettingsAndOrders();
    }
  }, [session.isAuth, session?.token, router, setToken, getOrders]);

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
