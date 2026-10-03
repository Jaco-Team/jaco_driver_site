import dayjs from 'dayjs';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import StatisticsScreen from './StatisticsScreen';

const mocks = vi.hoisted(() => ({
  isOnline: false,
  getStat: vi.fn(),
  openPicker: vi.fn(),
}));

vi.mock('../model/useStatisticsScreen', () => ({
  useStatisticsScreen: () => ({
    isOnline: mocks.isOnline,
    isLoad: false,
    globalFontSize: 16,
    snackbar: {
      vertical: 'bottom',
      horizontal: 'center',
      open: false,
      message: '',
    },
    dateStartLabel: '01.09.2026',
    dateEndLabel: '24.09.2026',
    displayRows: [],
    activePicker: null,
    activePickerTitle: '',
    pickerValue: dayjs('2026-09-24'),
    pickerMinDate: dayjs('2026-01-01'),
    pickerMaxDate: dayjs('2026-09-24'),
    isSummaryRow: () => false,
    openPicker: mocks.openPicker,
    closePicker: vi.fn(),
    selectPickerDate: vi.fn(),
    getStat: mocks.getStat,
    closeSnackbar: vi.fn(),
  }),
}));

vi.mock('@/components/meta', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/shared/ui/Font', () => ({
  roboto: { variable: 'roboto-variable' },
}));

describe('StatisticsScreen connectivity controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isOnline = false;
  });

  it('disables date selection and loading statistics offline', () => {
    render(<StatisticsScreen />);

    expect(screen.getByRole('button', { name: /01\.09\.2026/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /24\.09\.2026/ })).toBeDisabled();
    const submit = screen.getByRole('button', { name: 'Показать статистику' });
    expect(submit).toBeDisabled();
    fireEvent.click(submit);
    expect(mocks.getStat).not.toHaveBeenCalled();
  });

  it('loads statistics when online', () => {
    mocks.isOnline = true;
    render(<StatisticsScreen />);

    fireEvent.click(screen.getByRole('button', { name: 'Показать статистику' }));
    expect(mocks.getStat).toHaveBeenCalledTimes(1);
  });
});
