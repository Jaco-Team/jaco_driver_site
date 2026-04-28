import { useEffect, useState } from 'react';

import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

import { usePriceStore, useHeaderStore } from '@/components/store.js';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

import useSession from '@/components/sessionHook';

import Meta from '@/components/meta.js';

import { roboto } from '@/shared/ui/Font';
import { useFullscreen } from '@/shared/lib/useFullscreen';

import { log } from '@/components/analytics';

function MetricRow({
  label,
  value,
  description,
  emphasize = false,
  hideDivider = false,
  globalFontSize,
}) {
  return (
    <div className={`price__metricRow${hideDivider ? ' price__metricRow--last' : ''}`}>
      <div className={`price__metricLabel${emphasize ? ' price__metricLabel--emphasis' : ''}`}>
        <span style={{ fontSize: globalFontSize }}>{label}</span>

        {description ? (
          <Tooltip title={description} arrow placement="top">
            <IconButton
              size="small"
              className="price__metricInfo"
              aria-label={`Подсказка: ${label}`}
            >
              <InfoOutlinedIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        ) : null}
      </div>

      <span
        className={`price__metricValue${emphasize ? ' price__metricValue--emphasis' : ''}`}
        style={{ fontSize: globalFontSize }}
      >
        {value}
      </span>
    </div>
  );
}

function DateLauncher({ label, value, onClick, globalFontSize }) {
  return (
    <button type="button" className="price__dateLauncher" onClick={onClick}>
      <span className="price__dateLauncherLabel" style={{ fontSize: globalFontSize }}>
        {label}
      </span>
      <span className="price__dateLauncherValue" style={{ fontSize: globalFontSize }}>
        {value}
      </span>
    </button>
  );
}

export default function PricePage() {
  const session = useSession();

  const [startDate, setStartDate] = useState(dayjs().startOf('day').subtract(7, 'day'));
  const [endDate, setEndDate] = useState(dayjs().startOf('day'));
  const [activePicker, setActivePicker] = useState(null);
  const [draftDate, setDraftDate] = useState(dayjs().startOf('day'));

  const [statPrice, give_hist, getStatBetween] = usePriceStore((state) => [
    state.statPrice,
    state.give_hist,
    state.getStatBetween,
  ]);
  const [globalFontSize] = useHeaderStore((state) => [state.globalFontSize]);
  const pickerFullScreen = useFullscreen('xs');

  const formatPrice = (price) => new Intl.NumberFormat('ru-RU').format(price ?? 0);
  const formatDate = (date) => dayjs(date).locale('ru').format('D MMMM YYYY');

  const maxSelectableDate = dayjs().startOf('day');
  const minSelectableDate = maxSelectableDate.subtract(93, 'day');
  const pickerMinDate = activePicker === 'end' ? startDate : minSelectableDate;
  const pickerMaxDate = activePicker === 'start' ? endDate : maxSelectableDate;

  useEffect(() => {
    if (session?.isAuth === true) {
      getStatBetween(dayjs(startDate).format('YYYY-MM-DD'), dayjs(endDate).format('YYYY-MM-DD'));
    }
  }, [endDate, getStatBetween, session?.isAuth, startDate]);

  const openPicker = (type) => {
    setDraftDate(type === 'start' ? startDate : endDate);
    setActivePicker(type);

    if (type === 'start') {
      log('price_start_calendar_open', 'Открытие календаря (Расчет): Дата от');
    } else {
      log('price_end_calendar_open', 'Открытие календаря (Расчет): Дата до');
    }
  };

  const closePicker = () => {
    if (activePicker === 'start') {
      log('price_start_calendar_close', 'Закрытие календаря (Расчет): Дата от');
    }

    if (activePicker === 'end') {
      log('price_end_calendar_close', 'Закрытие календаря (Расчет): Дата до');
    }

    setActivePicker(null);
  };

  const applyDraftDate = () => {
    if (!draftDate || !activePicker) {
      closePicker();
      return;
    }

    const normalizedDate = dayjs(draftDate).startOf('day');

    if (activePicker === 'start') {
      setStartDate(normalizedDate);
    } else {
      setEndDate(normalizedDate);
    }

    closePicker();
  };

  const summaryRows = [
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
  ];

  const settlementRows = [
    ...give_hist.map((row) => ({
      label: row.time,
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
  ];

  return (
    <Meta title="Расчет">
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
        <Grid container spacing={2} className={`price priceScreen ${roboto.variable}`}>
          <Grid size={12}>
            <div className="price__content">
              <section className="price__hero price__hero--minimal">
                <div className="price__heroTop">
                  <div className="price__heroMain">
                    <h1 className="price__heroTitle">Расчет</h1>
                  </div>
                </div>

                <div className="price__heroActions">
                  <DateLauncher
                    label="Дата от"
                    value={formatDate(startDate)}
                    globalFontSize={globalFontSize}
                    onClick={() => openPicker('start')}
                  />

                  <DateLauncher
                    label="Дата до"
                    value={formatDate(endDate)}
                    globalFontSize={globalFontSize}
                    onClick={() => openPicker('end')}
                  />
                </div>
              </section>
            </div>
          </Grid>

          <Grid size={12}>
            <div className="price__content">
              <section className="price__card price__card--plain">
                <div
                  className="price__total"
                  style={{ fontSize: Math.max(globalFontSize * 2.6, 48) }}
                >
                  {formatPrice(statPrice?.my_price)} ₽
                </div>

                <div className="price__metrics">
                  {summaryRows.map((row) => (
                    <MetricRow
                      key={row.label}
                      label={row.label}
                      value={row.value}
                      description={row.description}
                      emphasize={row.emphasize}
                      hideDivider={row.hideDivider}
                      globalFontSize={globalFontSize}
                    />
                  ))}
                </div>
              </section>
            </div>
          </Grid>

          <Grid size={12}>
            <div className="price__content">
              <section className="price__card price__card--compact price__card--plain">
                <div className="price__metrics">
                  {settlementRows.map((row, index) => (
                    <MetricRow
                      key={`${row.label}-${index}`}
                      label={row.label}
                      value={row.value}
                      emphasize={row.emphasize}
                      hideDivider={row.hideDivider || index === settlementRows.length - 1}
                      globalFontSize={globalFontSize}
                    />
                  ))}
                </div>
              </section>
            </div>
          </Grid>
        </Grid>

        <Dialog
          open={Boolean(activePicker)}
          onClose={closePicker}
          fullWidth
          maxWidth="xs"
          fullScreen={pickerFullScreen}
          className="price__pickerDialog"
        >
          <DialogTitle>
            {activePicker === 'start' ? 'Дата от' : 'Дата до'}
            {pickerFullScreen ? (
              <IconButton
                aria-label="Закрыть"
                className="price__pickerClose"
                onClick={closePicker}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            ) : null}
          </DialogTitle>

          <DialogContent>
            <DateCalendar
              value={draftDate}
              onChange={(value) => value && setDraftDate(value)}
              minDate={pickerMinDate}
              maxDate={pickerMaxDate}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={closePicker}>Отмена</Button>
            <Button variant="contained" onClick={applyDraftDate}>
              Готово
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </Meta>
  );
}
