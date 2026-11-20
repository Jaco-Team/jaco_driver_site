import { useOrdersStore } from './order.store';
import { useSettingsStore } from '@/entities/settings';
import { emitSuccessfulOrderAction } from '@/shared/lib/orderActionEvents';
import { useSyncExternalStore } from 'react';
import { createFinishQueue } from '@/shared/lib/offline/finishQueue';
import { getAuthToken } from '@/shared/api/token';
import { getApiErrorInfo } from '@/shared/api/errors';
import { isAppOnline } from '@/features/offline/model/connectivity.store';
import { actionOrder } from '../api/order.api';

const OWNER_KEY = 'jaco_driver_finish_owner';
const QUEUE_KEY = 'jaco_driver_pending_finishes_v1';
export function setFinishOwner(owner: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(OWNER_KEY);
    if (owner) window.localStorage.setItem(OWNER_KEY, owner);
  } catch {
    /* Completion commands still require a successful durable write. */
  }
}
export function finishOwner(): string | null {
  if (typeof window === 'undefined' || !getAuthToken()) return null;
  try {
    return window.localStorage.getItem(OWNER_KEY);
  } catch {
    return null;
  }
}
export const pendingFinishes = createFinishQueue({
  exclusive: (work) =>
    typeof navigator !== 'undefined' && navigator.locks
      ? navigator.locks.request(QUEUE_KEY, work)
      : work(),
  read: async () => (typeof window === 'undefined' ? null : window.localStorage.getItem(QUEUE_KEY)),
  write: async (value) => {
    window.localStorage.setItem(QUEUE_KEY, value);
  },
  owner: finishOwner,
  session: getAuthToken,
  online: isAppOnline,
  retainAcknowledged: true,
  acknowledged: (entry, newlyAcknowledged) => {
    if (useSettingsStore.getState().pointId !== entry.pointId) return;
    if (newlyAcknowledged) emitSuccessfulOrderAction({ orderId: entry.orderId, type: 'finish' });
    void useOrdersStore
      .getState()
      .getOrders()
      .catch(() => undefined);
  },
  rejected: (entry, text) => {
    useOrdersStore.getState().openErrOrder(`Заказ #${entry.orderId}: ${text}`);
  },
  send: async (entry) => {
    try {
      const response = await actionOrder(
        {
          type: 'actionOrder',
          id: entry.orderId,
          point_id: entry.pointId,
          type_action: 3,
          completed_at: entry.completedAt,
          latitude: entry.latitude,
          longitude: entry.longitude,
        },
        getAuthToken() ?? undefined
      );
      return {
        ok: response.st === true,
        retryable: response.retryable === true,
        text: response.text,
      };
    } catch (error) {
      const info = getApiErrorInfo(error);
      return {
        ok: false,
        retryable:
          info.status === null ||
          info.isNetwork ||
          info.status === 401 ||
          info.status === 429 ||
          (info.status ?? 0) >= 500,
        text: info.message,
      };
    }
  },
});
export function usePendingFinish(pointId: number | null, orderId: number) {
  useSyncExternalStore(pendingFinishes.subscribe, pendingFinishes.revision, () => 0);
  return pendingFinishes.find(finishOwner(), pointId, orderId);
}
