import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';

import {
  ApiResponse,
  fetchGraph,
  fetchGraphPoints,
  submitGraphCameraAppeal as submitGraphCameraAppealRequest,
  submitGraphOrderAppeal as submitGraphOrderAppealRequest,
} from '@/shared/api/client';
import {
  normalizeGraphCameraError,
  normalizeGraphOrderError,
  normalizeGraphResponse,
} from '@/entities/graph/model/graph.utils';
import {
  GraphCameraError,
  GraphErrorModal,
  GraphOrderError,
  GraphPointItem,
} from '@/entities/graph/model/types';
import { log } from '@/components/analytics';

interface GraphStoreState {
  isPointDrawerOpen: boolean;
  isMonthDrawerOpen: boolean;
  errorModal: GraphErrorModal;
  alertText: string;
  isAlertOpen: boolean;
  appealText: string;
  isSubmittingAppeal: boolean;
  pointList: GraphPointItem[];
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
  setPointDrawerOpen: (open: boolean) => void;
  setMonthDrawerOpen: (open: boolean) => void;
  loadPoints: () => Promise<GraphPointItem[]>;
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
  pointList: [],
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

export const useGraphStore = createWithEqualityFn<GraphStore>(
  (set, get) => ({
    isPointDrawerOpen: false,
    isMonthDrawerOpen: false,
    errorModal: null,
    alertText: '',
    isAlertOpen: false,
    appealText: '',
    isSubmittingAppeal: false,
    ...initialGraphState,

    setPointDrawerOpen: (open) => {
      set({ isPointDrawerOpen: open });
    },

    setMonthDrawerOpen: (open) => {
      set({ isMonthDrawerOpen: open });
    },

    loadPoints: async () => {
      const points = await fetchGraphPoints();
      const normalizedPoints = points
        .map((item) => ({
          id: item.id ?? '',
          city_id: item.city_id ?? '',
          base: item.base ?? '',
          name: `${item.name ?? ''}`.trim(),
        }))
        .filter((item) => item.id !== '' && item.name.length > 0);

      set({ pointList: normalizedPoints });

      return normalizedPoints;
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
      const nextPointId = pointId ?? get().selectedPointId;
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
