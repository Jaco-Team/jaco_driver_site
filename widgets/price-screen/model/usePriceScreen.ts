import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/ru';

import { useSession } from '@/features/auth/model/auth.store';
import { usePriceStore } from '@/entities/price';
import { useSettingsStore } from '@/entities/settings';
import { useHeaderStore } from '@/features/header/model/header.store';
import { devLog } from '@/shared/lib/devLog';
import { log } from '@/components/analytics';
import type {
  ActivePricePicker,
  PriceMetricRowData,
  UsePriceScreenResult,
} from './usePriceScreen.type';

const PRICE_NUMBER_FORMATTER = new Intl.NumberFormat('ru-RU');
const API_DATE_FORMAT = 'YYYY-MM-DD';
const UI_DATE_FORMAT = 'D MMMM YYYY';

export function usePriceScreen(): UsePriceScreenResult {
  const session = useSession();

  const [startDate, setStartDate] = useState(dayjs().startOf('day'));
  const [endDate, setEndDate] = useState(dayjs().startOf('day'));
  const [activePicker, setActivePicker] = useState<ActivePricePicker>(null);

  const [statPrice, giveHistory, isStatLoading, getStatBetween] = usePriceStore((state) => [
    state.statPrice,
    state.give_hist,
    state.isStatLoading,
    state.getStatBetween,
  ]);
  const globalFontSize = useHeaderStore((state) => state.globalFontSize);
  const pointId = useSettingsStore((state) => state.pointId);

  const formatPrice = useCallback(
    (price?: number | string | null) => PRICE_NUMBER_FORMATTER.format(Number(price ?? 0)),
    []
  );
  const formatDate = useCallback(
    (date: Dayjs) => dayjs(date).locale('ru').format(UI_DATE_FORMAT),
    []
  );

  const maxSelectableDate = dayjs().startOf('day');
  const minSelectableDate = maxSelectableDate.subtract(93, 'day');
  const pickerMinDate = activePicker === 'end' ? startDate : minSelectableDate;
  const pickerMaxDate = activePicker === 'start' ? endDate : maxSelectableDate;
  const startDateApi = useMemo(() => startDate.format(API_DATE_FORMAT), [startDate]);
  const endDateApi = useMemo(() => endDate.format(API_DATE_FORMAT), [endDate]);

  useEffect(() => {
    if (session?.isAuth !== true) {
      return;
    }

    void getStatBetween(startDateApi, endDateApi, pointId).catch((error) => {
      devLog('price_stats_load_failed', 'Price stats load failed', error);
    });
  }, [endDateApi, getStatBetween, pointId, session?.isAuth, startDateApi]);

  const openPicker = useCallback((type: Exclude<ActivePricePicker, null>) => {
    setActivePicker(type);

    if (type === 'start') {
      log('price_start_calendar_open', 'Открытие календаря (Расчет): Дата от');
    } else {
      log('price_end_calendar_open', 'Открытие календаря (Расчет): Дата до');
    }
  }, []);

  const openStartPicker = useCallback(() => {
    openPicker('start');
  }, [openPicker]);

  const openEndPicker = useCallback(() => {
    openPicker('end');
  }, [openPicker]);

  const closePicker = useCallback(() => {
    if (activePicker === 'start') {
      log('price_start_calendar_close', 'Закрытие календаря (Расчет): Дата от');
    }

    if (activePicker === 'end') {
      log('price_end_calendar_close', 'Закрытие календаря (Расчет): Дата до');
    }

    setActivePicker(null);
  }, [activePicker]);

  const selectPickerDate = useCallback(
    (value: Dayjs | null) => {
      if (!value || !activePicker) {
        return;
      }

      const normalizedDate = dayjs(value).startOf('day');

      if (activePicker === 'start') {
        if (!normalizedDate.isSame(startDate, 'day')) {
          setStartDate(normalizedDate);
        }
      } else if (!normalizedDate.isSame(endDate, 'day')) {
        setEndDate(normalizedDate);
      }

      closePicker();
    },
    [activePicker, closePicker, endDate, startDate]
  );

  const summaryRows = useMemo<PriceMetricRowData[]>(
    () => [
      {
        label: 'Сумма налички',
        value: `${formatPrice(statPrice?.sum_cash)} ₽`,
        description: 'Сумма заказов за наличку за выбранную дату, включая стоимость доставки',
      },
      {
        label: 'Сумма безнала',
        value: `${formatPrice(statPrice?.sum_bank)} ₽`,
        description:
          'Сумма заказов по безналичному расчету за выбранную дату, включая стоимость доставки',
      },
      {
        label: 'Заработал',
        value: `${formatPrice(statPrice?.my_price)} ₽`,
        description:
          'Сумма стоимости доставки для курьера за выбранную дату плюс доплаты за этот же день',
        emphasize: true,
      },
      {
        label: 'Сдача',
        value: `${formatPrice(statPrice?.sdacha)} ₽`,
        description: 'Из графы Сумма налички вычитается графа Заработал',
        emphasize: true,
      },
      {
        label: 'Налички',
        value: `${formatPrice(statPrice?.my_cash)} ₽`,
        description: 'Разница между графой К сдаче и графой Сдал за все время на точке',
        emphasize: true,
      },
      {
        label: 'Количество по наличке',
        value: `${statPrice?.count_cash ?? 0}`,
        emphasize: true,
      },
      {
        label: 'Количество по безналу',
        value: `${statPrice?.count_bank ?? 0}`,
        emphasize: true,
      },
      {
        label: 'Завершенных заказов',
        value: `${statPrice?.count ?? 0}`,
        emphasize: true,
        hideDivider: true,
      },
    ],
    [formatPrice, statPrice]
  );

  const settlementRows = useMemo<PriceMetricRowData[]>(
    () => [
      ...giveHistory.map((row) => ({
        label: row.time ?? '',
        value: `${formatPrice(row.give)} ₽`,
      })),
      {
        label: 'Всего сдал',
        value: `${formatPrice(statPrice?.full_give)} ₽`,
        emphasize: true,
      },
      {
        label: 'Осталось сдать',
        value: `${formatPrice(statPrice?.my_cash)} ₽`,
        emphasize: true,
        hideDivider: true,
      },
    ],
    [formatPrice, giveHistory, statPrice]
  );
  const totalPriceLabel = useMemo(
    () => `${formatPrice(statPrice?.my_price)} ₽`,
    [formatPrice, statPrice]
  );
  const totalPriceFontSize = useMemo(() => Math.max(globalFontSize * 2.6, 48), [globalFontSize]);
  const startDateLabel = useMemo(() => formatDate(startDate), [formatDate, startDate]);
  const endDateLabel = useMemo(() => formatDate(endDate), [endDate, formatDate]);
  const pickerValue = useMemo(
    () => (activePicker === 'start' ? startDate : endDate),
    [activePicker, endDate, startDate]
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
    statPrice,
    giveHistory,
    isStatLoading,
    globalFontSize,
    startDateLabel,
    endDateLabel,
    totalPriceLabel,
    totalPriceFontSize,
    summaryRows,
    settlementRows,
    activePicker,
    activePickerTitle,
    pickerValue,
    pickerMinDate,
    pickerMaxDate,
    openStartPicker,
    openEndPicker,
    closePicker,
    selectPickerDate,
  };
}
