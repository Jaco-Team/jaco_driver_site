import type { ReactNode } from 'react';

import type { Dayjs } from 'dayjs';
import type { PriceGiveHistoryRow, PriceStat } from '@/entities/price';

export type ActivePricePicker = 'start' | 'end' | null;

export interface PriceMetricRowData {
  label: string;
  value: string;
  description?: string;
  emphasize?: boolean;
  hideDivider?: boolean;
}

export interface UsePriceScreenResult {
  statPrice: PriceStat | null;
  giveHistory: PriceGiveHistoryRow[];
  isStatLoading: boolean;
  globalFontSize: number;
  startDateLabel: string;
  endDateLabel: string;
  totalPriceLabel: string;
  totalPriceFontSize: number;
  summaryRows: PriceMetricRowData[];
  settlementRows: PriceMetricRowData[];
  activePicker: ActivePricePicker;
  activePickerTitle: string;
  pickerValue: Dayjs;
  pickerMinDate: Dayjs;
  pickerMaxDate: Dayjs;
  openStartPicker: () => void;
  openEndPicker: () => void;
  closePicker: () => void;
  selectPickerDate: (value: Dayjs | null) => void;
}

export type MetricRowProps = {
  description?: string;
  emphasize?: boolean;
  hideDivider?: boolean;
  label: string;
  value: ReactNode;
  globalFontSize: number;
};

export type DateLauncherProps = {
  label: string;
  value: string;
  onClick: () => void;
  globalFontSize: number;
};
