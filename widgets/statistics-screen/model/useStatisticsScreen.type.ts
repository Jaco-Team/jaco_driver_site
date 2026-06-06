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
  activePickerTitle: string;
  pickerValue: Dayjs;
  pickerMinDate: Dayjs;
  pickerMaxDate: Dayjs;
  isSummaryRow: (row: StatisticsSummaryRow) => boolean;
  openPicker: (type: Exclude<ActiveStatisticsPicker, null>) => void;
  closePicker: () => void;
  selectPickerDate: (value: Dayjs | null) => void;
  getStat: () => void;
  closeSnackbar: () => void;
}
