import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';

import {
  fetchGraph,
  submitGraphCameraAppeal as submitGraphCameraAppealRequest,
  submitGraphOrderAppeal as submitGraphOrderAppealRequest,
} from '@/entities/graph/api/graph.api';
import { ApiResponse } from '@/shared/api/client';
import {
  normalizeGraphCameraError,
  normalizeGraphOrderError,
  normalizeGraphResponse,
} from '@/entities/graph/model/graph.utils';
import { useSettingsStore } from '@/entities/settings';
import { GraphCameraError, GraphErrorModal, GraphOrderError } from '@/entities/graph/model/types';
import { log } from '@/components/analytics';

interface GraphStoreState {
  isMonthDrawerOpen: boolean;
  errorModal: GraphErrorModal;
  alertText: string;
  isAlertOpen: boolean;
  appealText: string;
  isSubmittingAppeal: boolean;
  selectedPointId: string;
  monthList: ReturnType<typeof normalizeGraphResponse>['monthList'];
  dates: ReturnType<typeof normalizeGraphResponse>['dates'];
  users: ReturnType<typeof normalizeGraphResponse>['users'];
  currentUserId: string;
  currentUserName: string;
  errOrders: GraphOrderError[];
  errCam: GraphCameraError[];
  chooseDate: string;
}

interface GraphStoreActions {
  setMonthDrawerOpen: (open: boolean) => void;
  setSelectedPointId: (value: string) => void;
  setAppealText: (value: string) => void;
  closeAlert: () => void;
  closeErrorModal: () => void;
  openOrderErrorModal: (item: GraphOrderError) => void;
  openCameraErrorModal: (item: GraphCameraError) => void;
  loadGraph: (date: string, pointId?: string) => Promise<void>;
  submitOrderAppeal: () => Promise<ApiResponse>;
  submitCameraAppeal: () => Promise<ApiResponse>;
}

type GraphStore = GraphStoreState & GraphStoreActions;

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

export const useGraphStore = createWithEqualityFn<GraphStore>(
  (set, get) => ({
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
      const nextPointId = resolveGraphPointId(pointId, get().selectedPointId);
      const response = await fetchGraph(date, nextPointId || undefined);

      set({
        ...normalizeGraphResponse(response, date),
        selectedPointId: nextPointId,
      });
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
