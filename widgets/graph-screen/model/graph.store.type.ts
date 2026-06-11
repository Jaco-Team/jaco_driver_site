import type {
  GraphCameraError,
  GraphErrorModal,
  GraphOrderError,
  GraphStateSnapshot,
} from '@/entities/graph/model/types';
import type { ApiResponse } from '@/shared/api/types';

export interface GraphStoreState extends GraphStateSnapshot {
  isGraphLoading: boolean;
  isMonthDrawerOpen: boolean;
  errorModal: GraphErrorModal;
  alertText: string;
  isAlertOpen: boolean;
  appealText: string;
  isSubmittingAppeal: boolean;
  selectedPointId: string;
}

export interface GraphStoreActions {
  setMonthDrawerOpen: (open: boolean) => void;
  setSelectedPointId: (value: string) => void;
  setAppealText: (value: string) => void;
  closeAlert: () => void;
  closeErrorModal: () => void;
  openOrderErrorModal: (item: GraphOrderError) => void;
  openCameraErrorModal: (item: GraphCameraError) => void;
  loadGraph: (date: string, pointId?: string | number | null) => Promise<void>;
  submitOrderAppeal: () => Promise<ApiResponse>;
  submitCameraAppeal: () => Promise<ApiResponse>;
}

export type GraphStore = GraphStoreState & GraphStoreActions;
