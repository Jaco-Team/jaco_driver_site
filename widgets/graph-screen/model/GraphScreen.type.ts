import type { ReactNode } from 'react';

import type {
  GraphCameraError,
  GraphDateCell,
  GraphErrorModal,
  GraphMonthItem,
  GraphOrderError,
  GraphScheduleRow,
} from '@/entities/graph/model/types';

export interface GraphScreenViewProps {
  globalFontSize: number;
  fontClassName: string;
  month: string;
  monthList: GraphMonthItem[];
  dates: GraphDateCell[];
  users: GraphScheduleRow[];
  currentUserId: string;
  currentUserName: string;
  chooseDate: string;
  errOrders: GraphOrderError[];
  errCam: GraphCameraError[];
  isMonthDrawerOpen: boolean;
  errorModal: GraphErrorModal;
  alertText: string;
  isAlertOpen: boolean;
  appealText: string;
  isSubmittingAppeal: boolean;
  onOpenMonthDrawer: () => void;
  onCloseMonthDrawer: () => void;
  onSelectMonth: (item: GraphMonthItem) => void;
  onOpenOrderError: (item: GraphOrderError) => void;
  onOpenCameraError: (item: GraphCameraError) => void;
  onCloseErrorModal: () => void;
  onChangeAppealText: (value: string) => void;
  onSubmitOrderAppeal: () => void;
  onSubmitCameraAppeal: () => void;
  onCloseAlert: () => void;
}

export interface GraphScheduleCardProps {
  globalFontSize: number;
  dates: GraphDateCell[];
  users: GraphScheduleRow[];
  currentUserId: string;
  currentUserName: string;
  chooseDate: string;
  icon: ReactNode;
}

export interface GraphMonthPickerDrawerProps {
  open: boolean;
  monthList: GraphMonthItem[];
  globalFontSize: number;
  fontClassName: string;
  onOpen: () => void;
  onClose: () => void;
  onSelectMonth: (item: GraphMonthItem) => void;
}

export interface GraphErrorDrawerProps {
  open: boolean;
  errorModal: GraphErrorModal;
  globalFontSize: number;
  fontClassName: string;
  appealText: string;
  isSubmittingAppeal: boolean;
  onChangeAppealText: (value: string) => void;
  onClose: () => void;
  onSubmitOrderAppeal: () => void;
  onSubmitCameraAppeal: () => void;
}

export interface GraphErrorFieldProps {
  label: string;
  value: string | number | undefined;
  globalFontSize: number;
}

export interface GraphAppealBlockProps {
  title: string;
  text: string | undefined;
  canEdit: boolean;
  globalFontSize: number;
  appealText: string;
  isSubmittingAppeal: boolean;
  onChangeAppealText: (value: string) => void;
  onSubmit: () => void;
}

export interface GraphAlertDialogProps {
  open: boolean;
  text: string;
  globalFontSize: number;
  onClose: () => void;
}

export interface GraphSectionHeaderProps {
  icon: ReactNode;
  title: string;
}

export interface EmptyTableRowProps {
  colSpan: number;
  text: string;
}

export type GraphIssueItem = GraphOrderError | GraphCameraError;

export interface GraphIssuesCardProps<TItem extends GraphIssueItem> {
  title: string;
  icon: ReactNode;
  emptyText: string;
  dateColumnTitle: string;
  items: TItem[];
  globalFontSize: number;
  getDate: (item: TItem) => string | number | undefined;
  getError: (item: TItem) => string | number | undefined;
  onOpen: (item: TItem) => void;
}
