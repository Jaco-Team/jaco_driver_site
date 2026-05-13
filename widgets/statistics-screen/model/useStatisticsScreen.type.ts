import type { Dayjs } from 'dayjs';
import type { StatisticsSummaryRow } from '@/entities/statistics';

export type ActiveStatisticsPicker = 'start' | 'end' | null;

export interface UseStatisticsScreenResult {
  isLoad: boolean;
  globalFontSize: number;
  snackbar: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
    open: boolean;
    message: string;
  };
  dateStartLabel: string;
  dateEndLabel: string;
  displayRows: StatisticsSummaryRow[];
  activePicker: ActiveStatisticsPicker;
  draftDate: Dayjs;
  pickerMinDate: Dayjs;
  pickerMaxDate: Dayjs;
  pickerFullScreen: boolean;
  isSummaryRow: (row: StatisticsSummaryRow) => boolean;
  setDraftDate: (value: Dayjs) => void;
  openPicker: (type: Exclude<ActiveStatisticsPicker, null>) => void;
  closePicker: () => void;
  applyDraftDate: () => void;
  getStat: () => void;
  closeSnackbar: () => void;
}
