import { logoutWeb } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { useOrdersStore } from '@/entities/order/model/order.store';
import { useHeaderStore } from '@/features/header/model/header.store';
import { useSettingsStore } from '@/entities/settings';
import { clearOfflineCache } from '@/shared/lib/offline/cache';
import { devLog } from '@/shared/lib/devLog';

export async function logoutAndClearSession(): Promise<void> {
  try {
    await logoutWeb();
  } catch (error) {
    devLog('logout_request_failed', 'Logout request failed', error);
  } finally {
    useAuthStore.getState().setUnauthorized();
    useOrdersStore.setState({
      token: '',
      orders: [],
      sourceOrders: [],
      ordersByContext: {},
      showOrders: [],
    });
    useHeaderStore.setState({ token: '', phones: null });
    useHeaderStore.getState().setAppTheme('system');
    useSettingsStore.setState({
      settings: null,
      settingsSynced: false,
      points: [],
      pointId: null,
      point_id: null,
    });
    clearOfflineCache();
  }
}
