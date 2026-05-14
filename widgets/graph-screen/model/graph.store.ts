import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';

import {
  fetchGraph,
  submitGraphCameraAppeal as submitGraphCameraAppealRequest,
  submitGraphOrderAppeal as submitGraphOrderAppealRequest,
} from '@/entities/graph/api/graph.api';
import {
  normalizeGraphCameraError,
  normalizeGraphOrderError,
  normalizeGraphResponse,
} from '@/entities/graph/model/graph.utils';
import { useSettingsStore } from '@/entities/settings';
import { log } from '@/components/analytics';
import type { GraphStore, GraphStoreState } from './graph.store.type';

let graphLoadPromise: Promise<void> | null = null;
let graphLoadKey = '';
let graphLoadPendingCount = 0;

const initialGraphState = {
  selectedPointId: '',
  monthList: [],
  dates: [],
  users: [],
  currentUserId: '',
  currentUserName: '',
  errOrders: [],
  errCam: [],
  chooseDate: '',
};

function closeModalState(): Pick<GraphStoreState, 'errorModal' | 'appealText'> {
  return {
    errorModal: null,
    appealText: '',
  };
}

function resolveGraphPointId(explicitPointId: string | undefined, selectedPointId: string): string {
  if (explicitPointId !== undefined) {
    return explicitPointId;
  }

  if (selectedPointId !== '') {
    return selectedPointId;
  }

  const settingsPointId = useSettingsStore.getState().point_id;

  if (
    settingsPointId === null ||
    settingsPointId === undefined ||
    `${settingsPointId}`.trim() === ''
  ) {
    return '';
  }

  return `${settingsPointId}`.trim();
}

async function ensureSettingsLoaded(): Promise<void> {
  if (useSettingsStore.getState().settings) {
    return;
  }

  try {
    await useSettingsStore.getState().getMySetting('');
  } catch {
    // Graph will surface the API error if a point cannot be resolved.
  }
}

export const useGraphStore = createWithEqualityFn<GraphStore>(
  (set, get) => ({
    isGraphLoading: false,
    isMonthDrawerOpen: false,
    errorModal: null,
    alertText: '',
    isAlertOpen: false,
    appealText: '',
    isSubmittingAppeal: false,
    ...initialGraphState,

    setMonthDrawerOpen: (open) => {
      set({ isMonthDrawerOpen: open });
    },

    setSelectedPointId: (value) => {
      set({ selectedPointId: value });
    },

    setAppealText: (value) => {
      set({ appealText: value });
    },

    closeAlert: () => {
      set({ isAlertOpen: false, alertText: '' });
    },

    closeErrorModal: () => {
      set(closeModalState());
    },

    openOrderErrorModal: (item) => {
      set({
        errorModal: {
          kind: 'order',
          item: normalizeGraphOrderError(item),
        },
        appealText: '',
      });
    },

    openCameraErrorModal: (item) => {
      set({
        errorModal: {
          kind: 'camera',
          item: normalizeGraphCameraError(item),
        },
        appealText: '',
      });
    },

    loadGraph: async (date, pointId) => {
      await ensureSettingsLoaded();

      const nextPointId = resolveGraphPointId(pointId, get().selectedPointId);
      const nextKey = `${date}:${nextPointId}`;

      if (graphLoadPromise && graphLoadKey === nextKey) {
        return graphLoadPromise;
      }

      graphLoadPendingCount += 1;
      if (graphLoadPendingCount === 1) {
        set({ isGraphLoading: true });
      }

      graphLoadKey = nextKey;
      graphLoadPromise = (async () => {
        const response = await fetchGraph(date, nextPointId || undefined);

        set({
          ...normalizeGraphResponse(response, date),
          selectedPointId: nextPointId,
        });
      })();

      try {
        return await graphLoadPromise;
      } finally {
        graphLoadPromise = null;
        graphLoadKey = '';
        graphLoadPendingCount = Math.max(0, graphLoadPendingCount - 1);
        if (graphLoadPendingCount === 0) {
          set({ isGraphLoading: false });
        }
      }
    },

    submitOrderAppeal: async () => {
      const { errorModal, appealText, chooseDate } = get();

      if (!errorModal || errorModal.kind !== 'order') {
        return { st: false, text: 'Ошибка не выбрана.' };
      }

      if (get().isSubmittingAppeal) {
        return { st: false, text: 'Подождите' };
      }

      set({ isSubmittingAppeal: true });

      try {
        const response = await submitGraphOrderAppealRequest(
          errorModal.item.err_id ?? '',
          errorModal.item.row_id ?? '',
          appealText
        );

        if (response?.st === false) {
          log('graph_err_order_answer_fail', 'Обжалование ошибки по заказу: ошибка отправки');
          set({
            isAlertOpen: true,
            alertText: response.text ?? 'Не удалось отправить обжалование.',
          });
          return response;
        }

        log('graph_err_order_answer_success', 'Обжалование ошибки по заказу: отправлено');
        set(closeModalState());

        if (chooseDate) {
          await get().loadGraph(chooseDate);
        }

        return response;
      } finally {
        set({ isSubmittingAppeal: false });
      }
    },

    submitCameraAppeal: async () => {
      const { errorModal, appealText, chooseDate } = get();

      if (!errorModal || errorModal.kind !== 'camera') {
        return { st: false, text: 'Ошибка не выбрана.' };
      }

      if (get().isSubmittingAppeal) {
        return { st: false, text: 'Подождите' };
      }

      set({ isSubmittingAppeal: true });

      try {
        const response = await submitGraphCameraAppealRequest(errorModal.item.id ?? '', appealText);

        if (response?.st === false) {
          log('graph_err_cam_answer_fail', 'Обжалование ошибки по камере: ошибка отправки');
          set({
            isAlertOpen: true,
            alertText: response.text ?? 'Не удалось отправить обжалование.',
          });
          return response;
        }

        log('graph_err_cam_answer_success', 'Обжалование ошибки по камере: отправлено');
        set(closeModalState());

        if (chooseDate) {
          await get().loadGraph(chooseDate);
        }

        return response;
      } finally {
        set({ isSubmittingAppeal: false });
      }
    },
  }),
  shallow
);
