import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/features/auth/model/auth.store';
import { useOrdersStore } from '@/entities/order/model/order.store';
import { useHeaderStore } from '@/features/header/model/header.store';
import { devLog } from '@/shared/lib/devLog';

interface UseOrdersPageReturn {
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
    devLog('orders_session_state', 'Session state', session.isAuth);

    if (session.isAuth === 'load') {
      devLog('orders_session_loading', 'Session loading');
      return;
    }

    if (session.isAuth === false) {
      devLog('orders_session_unauthorized', 'Redirecting to auth');
      router.push('/auth', { scroll: false });
      return;
    }

    if (session.isAuth === true && !hasInitialized.current) {
      devLog('orders_init', 'Initializing orders');
      hasInitialized.current = true;

      // Устанавливаем токен
      if (session?.token) {
        setToken(session.token);
        devLog('orders_token_set', 'Token set');
      }

      const loadSettingsAndOrders = async () => {
        try {
          getOrders(false);
        } catch (error) {
          devLog('orders_settings_load_error', 'Error loading settings', error);
          getOrders(false);
        }
      };

      loadSettingsAndOrders();
    }
  }, [session.isAuth, session?.token, router, setToken, getOrders]);

  // Отладка - логируем состояние заказов
  useEffect(() => {
    if (orders.length > 0) {
      devLog('orders_loaded', 'Loaded orders', orders.length);
    }
    if (is_check) {
      devLog('orders_fetching', 'Orders are being fetched');
    }
  }, [orders.length, is_check]);

  return {
    isLoading: session.isAuth === 'load',
    isAuth: session.isAuth,
  };
};
