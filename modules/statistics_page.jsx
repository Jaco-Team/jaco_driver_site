import React, { useEffect, useState } from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded';
import CloseIcon from '@mui/icons-material/Close';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

import { useStatisticsStore, useHeaderStore } from '@/components/store.js';
import useSession from '@/components/sessionHook';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

import Meta from '@/components/meta.js';
import { roboto } from '@/shared/ui/Font';
import { useFullscreen } from '@/shared/lib/useFullscreen';

import { log } from '@/components/analytics';
import { IconButton } from '@mui/material';

const MAX_SPAN_DAYS = 93;
const fmt = (date) => dayjs(date).format('YYYY-MM-DD');
const minDay = (a, b) => (dayjs(a).isBefore(b) ? dayjs(a) : dayjs(b));
const maxDay = (a, b) => (dayjs(a).isAfter(b) ? dayjs(a) : dayjs(b));

function normalizeRangeWithReasons(start, end) {
  const today = dayjs().startOf('day');
  const minDate = today.subtract(MAX_SPAN_DAYS, 'day');

  let s = dayjs(start).startOf('day');
  let e = dayjs(end).startOf('day');
  const reasons = [];

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

function reasonsToMessage(reasons, start, end, minDate) {
  if (!reasons.length) return null;

  const lines = [];

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

function MetricRow({ label, value, emphasize = false, hideDivider = false, globalFontSize }) {
  return (
    <div className={`price__metricRow${hideDivider ? ' price__metricRow--last' : ''}`}>
      <div className={`price__metricLabel${emphasize ? ' price__metricLabel--emphasis' : ''}`}>
        <span style={{ fontSize: globalFontSize }}>{label}</span>
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

function SectionCardHeader({ icon, title, description }) {
  return (
    <div className="price__cardHeader">
      <div className="price__cardHeaderMain">
        <span className="price__cardIcon">{icon}</span>

        <div className="price__cardHeading">
          <h2 className="price__cardTitle">{title}</h2>
          {!description ? null : <p className="price__cardDescription">{description}</p>}
        </div>
      </div>
    </div>
  );
}

function CourierCard({ row, globalFontSize, title, icon, description }) {
  const stats = row?.other_stat ?? {};
  const rows = [
    {
      label: 'Среднее время (в радиусе)',
      value: row?.time2 || '0',
      emphasize: true,
    },
    {
      label: 'Количество',
      value: `${stats?.all_count ?? 0}`,
    },
    {
      label: 'Вовремя',
      value: `${stats?.norm ?? 0} (${stats?.norm_percent ?? 0}%)`,
    },
    {
      label: 'С опозданием',
      value: `${stats?.fake ?? 0} (${stats?.fake_percent ?? 0}%)`,
    },
    {
      label: 'Вовремя и в радиусе',
      value: `${stats?.time_dist_true ?? 0} (${stats?.time_dist_true_percent ?? 0}%)`,
    },
    {
      label: 'В радиусе',
      value: `${stats?.true_dist ?? 0} (${stats?.true_dist_percent ?? 0}%)`,
    },
    {
      label: 'Не вовремя и не в радиусе',
      value: `${stats?.time_dist_false ?? 0} (${stats?.time_dist_false_percent ?? 0}%)`,
      hideDivider: true,
    },
  ];

  return (
    <section className="price__card statistics__card">
      <SectionCardHeader icon={icon} title={title} description={description} />

      <div className="price__metrics">
        {rows.map((item) => (
          <MetricRow
            key={`${row?.name}-${item.label}`}
            label={item.label}
            value={item.value}
            emphasize={item.emphasize}
            hideDivider={item.hideDivider}
            globalFontSize={globalFontSize}
          />
        ))}
      </div>
    </section>
  );
}

export default function StatisticsPage() {
  const session = useSession();

  const [initialStartDate] = useState(() => dayjs().startOf('day').subtract(6, 'day'));
  const [initialEndDate] = useState(() => dayjs().startOf('day'));

  const [dateStart, setDateStart] = useState(initialStartDate);
  const [dateEnd, setDateEnd] = useState(initialEndDate);
  const [activePicker, setActivePicker] = useState(null);
  const [draftDate, setDraftDate] = useState(initialEndDate);
  const [snackbar, setSnackbar] = useState({
    open: false,
    vertical: 'top',
    horizontal: 'center',
    message: '',
  });

  const { vertical, horizontal, open, message } = snackbar;

  const [getStatistics, svod, currentUserId, isLoad] = useStatisticsStore((state) => [
    state.getStatistics,
    state.svod,
    state.current_user_id,
    state.is_load,
  ]);
  const [globalFontSize] = useHeaderStore((state) => [state.globalFontSize]);
  const pickerFullScreen = useFullscreen('xs');

  const isSummaryRow = (row) => !row?.driver_id && !row?.user_id && !row?.name;
  const getRowUserId = (row) => `${row?.driver_id ?? row?.user_id ?? ''}`;

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

  const formatDate = (date) => dayjs(date).locale('ru').format('D MMMM YYYY');

  const showSnackbar = (text) => setSnackbar((prev) => ({ ...prev, open: true, message: text }));
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  useEffect(() => {
    if (session?.isAuth !== true) {
      return;
    }

    getStatistics(session?.token ?? '', fmt(initialStartDate), fmt(initialEndDate));
  }, [getStatistics, initialEndDate, initialStartDate, session?.isAuth, session?.token]);

  const openPicker = (type) => {
    setDraftDate(type === 'start' ? dateStart : dateEnd);
    setActivePicker(type);

    if (type === 'start') {
      log('statistics_calendar_start_open', 'Открытие календаря (Статистика времени): Дата от');
    } else {
      log('statistics_calendar_end_open', 'Открытие календаря (Статистика времени): Дата до');
    }
  };

  const closePicker = () => {
    if (activePicker === 'start') {
      log('statistics_calendar_start_close', 'Закрытие календаря (Статистика времени): Дата от');
    }

    if (activePicker === 'end') {
      log('statistics_calendar_end_close', 'Закрытие календаря (Статистика времени): Дата до');
    }

    setActivePicker(null);
  };

  const applyDraftDate = () => {
    if (!draftDate || !activePicker) {
      closePicker();
      return;
    }

    const picked = dayjs(draftDate).startOf('day');
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
      getStatistics(session?.token ?? '', fmt(normalizedRange.s), fmt(normalizedRange.e));
    }

    closePicker();
  };

  const getStat = () => {
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
      getStatistics(session?.token ?? '', fmt(normalizedRange.s), fmt(normalizedRange.e));
    }
  };

  const pickerMinDate = activePicker === 'start' ? startMinAllowed : endMinAllowed;
  const pickerMaxDate = activePicker === 'start' ? startMaxAllowed : endMaxAllowed;

  return (
    <Meta title="Статистика">
      <Backdrop style={{ zIndex: 9999, color: '#fff' }} open={isLoad}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        onClose={closeSnackbar}
        autoHideDuration={5000}
        key={message}
      >
        <Box
          role="alert"
          sx={{
            bgcolor: 'success.main',
            color: '#fff',
            px: 2,
            py: 1.5,
            borderRadius: 1,
            boxShadow: 3,
            fontSize: globalFontSize,
            maxWidth: 720,
          }}
        >
          <span style={{ whiteSpace: 'pre-line' }}>{message}</span>
        </Box>
      </Snackbar>

      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
        <Grid
          container
          spacing={2}
          className={`price priceScreen statisticsScreen ${roboto.variable}`}
        >
          <Grid size={12}>
            <div className="price__content">
              <section className="price__hero">
                <div className="price__heroTop">
                  <div className="price__heroMain">
                    <h1 className="price__heroTitle">Статистика времени</h1>
                  </div>
                </div>

                <div className="price__heroActions">
                  <DateLauncher
                    label="Дата от"
                    value={formatDate(dateStart)}
                    globalFontSize={globalFontSize}
                    onClick={() => openPicker('start')}
                  />

                  <DateLauncher
                    label="Дата до"
                    value={formatDate(dateEnd)}
                    globalFontSize={globalFontSize}
                    onClick={() => openPicker('end')}
                  />
                </div>

                <Button
                  variant="contained"
                  onClick={getStat}
                  className="statistics__submit price__heroSubmit"
                  style={{ fontSize: globalFontSize }}
                >
                  Показать статистику
                </Button>
              </section>
            </div>
          </Grid>

          {displayRows.length > 0 ? (
            displayRows.map((row, index) => (
              <Grid size={12} key={`${row?.name || 'courier'}-${index}`}>
                <div className="price__content">
                  <CourierCard
                    row={row}
                    globalFontSize={globalFontSize}
                    title={isSummaryRow(row) ? 'Итого' : row?.name || 'Курьер'}
                    icon={
                      isSummaryRow(row) ? (
                        <SummarizeRoundedIcon fontSize="inherit" />
                      ) : (
                        <PersonRoundedIcon fontSize="inherit" />
                      )
                    }
                    description={null}
                  />
                </div>
              </Grid>
            ))
          ) : (
            <Grid size={12}>
              <div className="price__content">
                <section className="price__card statistics__emptyCard">
                  <SectionCardHeader
                    icon={<QueryStatsRoundedIcon fontSize="inherit" />}
                    title="Статистика времени"
                    description={null}
                  />
                  <p className="statistics__emptyText" style={{ fontSize: globalFontSize }}>
                    За выбранный период данных пока нет.
                  </p>
                </section>
              </div>
            </Grid>
          )}
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
              onChange={(value) => value && setDraftDate(value.startOf('day'))}
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
