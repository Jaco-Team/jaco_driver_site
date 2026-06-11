import { useCallback, useEffect, useMemo, useState } from 'react';

import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/ru';

import { useStatisticsStore, type StatisticsSummaryRow } from '@/entities/statistics';
import { useSettingsStore } from '@/entities/settings';
import { useHeaderStore } from '@/features/header/model/header.store';
import { useSession } from '@/features/auth/model/auth.store';
import { log } from '@/components/analytics';
import type { ActiveStatisticsPicker, UseStatisticsScreenResult } from './useStatisticsScreen.type';

const MAX_SPAN_DAYS = 93;
const fmt = (date: Dayjs) => dayjs(date).format('YYYY-MM-DD');
const minDay = (a: Dayjs, b: Dayjs) => (dayjs(a).isBefore(b) ? dayjs(a) : dayjs(b));
const maxDay = (a: Dayjs, b: Dayjs) => (dayjs(a).isAfter(b) ? dayjs(a) : dayjs(b));

type RangeReason =
  | 'afterToday'
  | 'beforeMin'
  | 'spanTrimmedByToday'
  | 'spanTrimmedByMin'
  | 'endBeforeStart'
  | 'spanTooLong';

type NormalizedRange = {
  s: Dayjs;
  e: Dayjs;
  reasons: RangeReason[];
  minDate: Dayjs;
};

type StatisticsSnackbarState = {
  open: boolean;
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
  message: string;
};

function normalizeRangeWithReasons(start: Dayjs, end: Dayjs): NormalizedRange {
  const today = dayjs().startOf('day');
  const minDate = today.subtract(MAX_SPAN_DAYS, 'day');

  let s = dayjs(start).startOf('day');
  let e = dayjs(end).startOf('day');
  const reasons: RangeReason[] = [];

  if (s.isAfter(today)) {
    s = today;
    reasons.push('afterToday');
  }
  if (s.isBefore(minDate)) {
    s = minDate;
    reasons.push('beforeMin');
  }
  if (e.isAfter(today)) {
    e = today;
    reasons.push('spanTrimmedByToday');
  }
  if (e.isBefore(minDate)) {
    e = minDate;
    reasons.push('spanTrimmedByMin');
  }

  if (e.isBefore(s)) {
    e = s;
    reasons.push('endBeforeStart');
  }

  const span = e.diff(s, 'day');
  if (span > MAX_SPAN_DAYS) {
    e = s.add(MAX_SPAN_DAYS, 'day');
    reasons.push('spanTooLong');
    if (e.isAfter(today)) {
      e = today;
      s = e.subtract(MAX_SPAN_DAYS, 'day');
      if (e.isSame(today)) reasons.push('spanTrimmedByToday');
      if (s.isSame(minDate)) reasons.push('spanTrimmedByMin');
    }
  }

  return { s, e, reasons, minDate };
}

function reasonsToMessage(
  reasons: RangeReason[],
  start: Dayjs,
  end: Dayjs,
  minDate: Dayjs
): string | null {
  if (!reasons.length) return null;

  const lines: string[] = [];

  if (reasons.includes('afterToday')) lines.push('Дата "от" не может быть позже сегодняшней.');
  if (reasons.includes('beforeMin')) lines.push(`Дата "от" не может быть раньше ${fmt(minDate)}.`);
  if (reasons.includes('endBeforeStart')) lines.push('Дата "до" не может быть раньше "от".');
  if (reasons.includes('spanTooLong'))
    lines.push(`Диапазон не может превышать ${MAX_SPAN_DAYS} дней.`);
  if (reasons.includes('spanTrimmedByToday')) lines.push('Дата "до" ограничена сегодняшним днём.');
  if (reasons.includes('spanTrimmedByMin')) lines.push(`Дата "от" ограничена ${fmt(minDate)}.`);

  lines.push(`Выбран период: ${fmt(start)} — ${fmt(end)}`);

  return lines.join('\n');
}

export function useStatisticsScreen(): UseStatisticsScreenResult {
  const session = useSession();

  const [initialStartDate] = useState(() => dayjs().startOf('day').subtract(6, 'day'));
  const [initialEndDate] = useState(() => dayjs().startOf('day'));

  const [dateStart, setDateStart] = useState(initialStartDate);
  const [dateEnd, setDateEnd] = useState(initialEndDate);
  const [activePicker, setActivePicker] = useState<ActiveStatisticsPicker>(null);
  const [snackbar, setSnackbar] = useState<StatisticsSnackbarState>({
    open: false,
    vertical: 'top',
    horizontal: 'center',
    message: '',
  });

  const [getStatistics, svod, currentUserId, isLoad] = useStatisticsStore((state) => [
    state.getStatistics,
    state.svod,
    state.currentUserId,
    state.isLoad,
  ]);
  const [globalFontSize] = useHeaderStore((state) => [state.globalFontSize]);
  const pointId = useSettingsStore((state) => state.pointId);

  const isSummaryRow = (row: StatisticsSummaryRow) =>
    !row?.driver_id && !row?.user_id && !row?.name;
  const getRowUserId = (row: StatisticsSummaryRow) => `${row?.driver_id ?? row?.user_id ?? ''}`;

  const summaryRows = svod.filter((row) => isSummaryRow(row));
  const statisticRows = svod.filter((row) => !isSummaryRow(row));
  const prioritizedRows = currentUserId
    ? [
        ...statisticRows.filter((row) => getRowUserId(row) === `${currentUserId}`),
        ...statisticRows.filter((row) => getRowUserId(row) !== `${currentUserId}`),
      ]
    : statisticRows;
  const displayRows = [...prioritizedRows, ...summaryRows];

  const today = dayjs().startOf('day');
  const globalMin = today.subtract(MAX_SPAN_DAYS, 'day');

  const startMaxAllowed = minDay(today, dateEnd || today);
  const startMinAllowed = maxDay(globalMin, (dateEnd || today).subtract(MAX_SPAN_DAYS, 'day'));
  const endMinAllowed = maxDay(globalMin, dateStart || globalMin);
  const endMaxAllowed = minDay(today, (dateStart || today).add(MAX_SPAN_DAYS, 'day'));

  const formatDate = (date: Dayjs) => dayjs(date).locale('ru').format('D MMMM YYYY');

  const showSnackbar = useCallback(
    (text: string) => setSnackbar((prev) => ({ ...prev, open: true, message: text })),
    []
  );
  const closeSnackbar = useCallback(() => setSnackbar((prev) => ({ ...prev, open: false })), []);

  useEffect(() => {
    if (session?.isAuth !== true) {
      return;
    }

    void getStatistics(fmt(initialStartDate), fmt(initialEndDate), pointId);
  }, [getStatistics, initialEndDate, initialStartDate, pointId, session?.isAuth]);

  const openPicker = useCallback((type: Exclude<ActiveStatisticsPicker, null>) => {
    setActivePicker(type);

    if (type === 'start') {
      log('statistics_calendar_start_open', 'Открытие календаря (Статистика времени): Дата от');
    } else {
      log('statistics_calendar_end_open', 'Открытие календаря (Статистика времени): Дата до');
    }
  }, []);

  const closePicker = useCallback(() => {
    if (activePicker === 'start') {
      log('statistics_calendar_start_close', 'Закрытие календаря (Статистика времени): Дата от');
    }

    if (activePicker === 'end') {
      log('statistics_calendar_end_close', 'Закрытие календаря (Статистика времени): Дата до');
    }

    setActivePicker(null);
  }, [activePicker]);

  const selectPickerDate = useCallback(
    (value: Dayjs | null) => {
      if (!value || !activePicker) {
        return;
      }

      const picked = dayjs(value).startOf('day');
      const normalizedRange =
        activePicker === 'start'
          ? normalizeRangeWithReasons(picked, dateEnd || picked)
          : normalizeRangeWithReasons(dateStart || picked, picked);

      log('statistics_date_selected', 'Выбор даты (Статистика времени)');

      setDateStart(normalizedRange.s);
      setDateEnd(normalizedRange.e);

      const normalizedMessage = reasonsToMessage(
        normalizedRange.reasons,
        normalizedRange.s,
        normalizedRange.e,
        normalizedRange.minDate
      );

      if (normalizedMessage) {
        showSnackbar(normalizedMessage);
      }

      if (session?.isAuth === true) {
        void getStatistics(fmt(normalizedRange.s), fmt(normalizedRange.e), pointId);
      }

      closePicker();
    },
    [
      activePicker,
      closePicker,
      dateEnd,
      dateStart,
      getStatistics,
      pointId,
      session?.isAuth,
      showSnackbar,
    ]
  );

  const getStat = useCallback(() => {
    if (!dateStart || !dateEnd) {
      showSnackbar('Необходимо указать обе даты');
      return;
    }

    log('statistics_show_click', 'Показать статистику времени');

    const normalizedRange = normalizeRangeWithReasons(dateStart, dateEnd);
    const normalizedMessage = reasonsToMessage(
      normalizedRange.reasons,
      normalizedRange.s,
      normalizedRange.e,
      normalizedRange.minDate
    );

    setDateStart(normalizedRange.s);
    setDateEnd(normalizedRange.e);

    if (normalizedMessage) {
      showSnackbar(normalizedMessage);
    }

    if (session?.isAuth === true) {
      void getStatistics(fmt(normalizedRange.s), fmt(normalizedRange.e), pointId);
    }
  }, [dateEnd, dateStart, getStatistics, pointId, session?.isAuth, showSnackbar]);

  const pickerMinDate = activePicker === 'start' ? startMinAllowed : endMinAllowed;
  const pickerMaxDate = activePicker === 'start' ? startMaxAllowed : endMaxAllowed;
  const pickerValue = useMemo(
    () => (activePicker === 'start' ? dateStart : dateEnd),
    [activePicker, dateEnd, dateStart]
  );
  const activePickerTitle = useMemo(() => {
    if (activePicker === 'start') {
      return 'Дата от';
    }

    if (activePicker === 'end') {
      return 'Дата до';
    }

    return '';
  }, [activePicker]);

  return {
    isLoad,
    globalFontSize,
    snackbar: {
      vertical: snackbar.vertical,
      horizontal: snackbar.horizontal,
      open: snackbar.open,
      message: snackbar.message,
    },
    dateStartLabel: formatDate(dateStart),
    dateEndLabel: formatDate(dateEnd),
    displayRows,
    activePicker,
    activePickerTitle,
    pickerValue,
    pickerMinDate,
    pickerMaxDate,
    isSummaryRow,
    openPicker,
    closePicker,
    selectPickerDate,
    getStat,
    closeSnackbar,
  };
}
