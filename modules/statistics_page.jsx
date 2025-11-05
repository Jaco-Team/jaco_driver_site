import React, { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Snackbar from '@mui/material/Snackbar';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import { useStatisticsStore, useHeaderStore } from '@/components/store.js';
import MyDatepicker from '@/ui/MyDatepicker';
import dayjs from 'dayjs';

import Meta from '@/components/meta.js';
import { roboto } from '@/ui/Font';

import { log } from '@/components/analytics';

const MAX_SPAN_DAYS = 93;
const fmt = (d) => dayjs(d).format('YYYY-MM-DD');
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

  // порядок
  if (e.isBefore(s)) {
    e = s;
    reasons.push('endBeforeStart');
  }

  // длина
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

function reasonsToMessage(reasons, s, e, minDate) {
  if (!reasons.length) return null;
  const lines = [];
  if (reasons.includes('afterToday')) lines.push('Дата “от” не может быть позже сегодняшней.');
  if (reasons.includes('beforeMin')) lines.push(`Дата “от” не может быть раньше ${fmt(minDate)}.`);
  if (reasons.includes('endBeforeStart')) lines.push('Дата “до” не может быть раньше “от”.');
  if (reasons.includes('spanTooLong')) lines.push(`Диапазон не может превышать ${MAX_SPAN_DAYS} дней.`);
  if (reasons.includes('spanTrimmedByToday')) lines.push('Дата “до” ограничена сегодняшним днём.');
  if (reasons.includes('spanTrimmedByMin')) lines.push(`Дата “от” ограничена ${fmt(minDate)}.`);
  lines.push(`Выбран период: ${fmt(s)} — ${fmt(e)}`);
  return lines.join('\n');
}

export default function StatisticsPage() {
  //const [date_start, setDateStart] = useState(dayjs().startOf('day'));
  const [date_start, setDateStart] = useState(dayjs().startOf('day').subtract(6, 'day'));
  const [date_end, setDateEnd] = useState(dayjs().startOf('day'));

  const [snackbar, setSnackbar] = useState({
    open: false,
    vertical: 'top',
    horizontal: 'center',
    message: '',
  });
  const { vertical, horizontal, open, message } = snackbar;

  const [getStatistics, svod, is_load] = useStatisticsStore((state) => [
    state.getStatistics,
    state.svod,
    state.is_load,
  ]);
  const [globalFontSize, token] = useHeaderStore((state) => [state.globalFontSize, state.token]);

  const showSnackbar = (text) => setSnackbar((s) => ({ ...s, open: true, message: text }));
  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  const today = dayjs().startOf('day');
  const globalMin = today.subtract(MAX_SPAN_DAYS, 'day');

  const startMaxAllowed = minDay(today, date_end || today);
  const startMinAllowed = maxDay(globalMin, (date_end || today).subtract(MAX_SPAN_DAYS, 'day'));

  const endMinAllowed = maxDay(globalMin, date_start || globalMin);
  const endMaxAllowed = minDay(today, (date_start || today).add(MAX_SPAN_DAYS, 'day'));

  const shouldDisableStart = (d) => {
    const dd = dayjs(d).startOf('day');
    return dd.isBefore(startMinAllowed, 'day') || dd.isAfter(startMaxAllowed, 'day');
  };
  const shouldDisableEnd = (d) => {
    const dd = dayjs(d).startOf('day');
    return dd.isBefore(endMinAllowed, 'day') || dd.isAfter(endMaxAllowed, 'day');
  };

  // ===== Первичная загрузка =====
  useEffect(() => {
    if (!token) return;
    const { s, e, reasons, minDate } = normalizeRangeWithReasons(date_start, date_end);
    const msg = reasonsToMessage(reasons, s, e, minDate);
    if (msg) showSnackbar(msg);
    setDateStart(s);
    setDateEnd(e);
    getStatistics(token, fmt(s), fmt(e));
  }, [token]);

  // ===== Обработчики выбора дат =====
  const handleStartChange = (val) => {
    const picked = dayjs(val).startOf('day');
    const { s, e, reasons, minDate } = normalizeRangeWithReasons(picked, date_end || picked);

    log('statistics_calendar_start_close', 'Закрытие календаря (Статистика времени): Дата от');
    log('statistics_date_selected', 'Выбор даты (Статистика времени)');

    setDateStart(s);
    setDateEnd(e);
    const msg = reasonsToMessage(reasons, s, e, minDate);
    if (msg) showSnackbar(msg);
  };

  const handleEndChange = (val) => {
    const picked = dayjs(val).startOf('day');
    const { s, e, reasons, minDate } = normalizeRangeWithReasons(date_start || picked, picked);

    log('statistics_calendar_end_close', 'Закрытие календаря (Статистика времени): Дата до');
    log('statistics_date_selected', 'Выбор даты (Статистика времени)');

    setDateStart(s);
    setDateEnd(e);
    const msg = reasonsToMessage(reasons, s, e, minDate);
    if (msg) showSnackbar(msg);
  };

  const getStat = () => {
    if (!date_start || !date_end) {
      showSnackbar('Необходимо указать обе даты');
      return;
    }

    log('statistics_show_click', 'Показать статистику времени');

    const { s, e, reasons, minDate } = normalizeRangeWithReasons(date_start, date_end);
    const msg = reasonsToMessage(reasons, s, e, minDate);
    if (msg) showSnackbar(msg);
    setDateStart(s);
    setDateEnd(e);
    if (token) getStatistics(token, fmt(s), fmt(e));
  };

  const onStartOpen = () => log('statistics_calendar_start_open', 'Открытие календаря (Статистика времени): Дата от');
  const onEndOpen = () => log('statistics_calendar_end_open', 'Открытие календаря (Статистика времени): Дата до');

  return (
    <Meta title="Статистика">
      <Backdrop style={{ zIndex: 9999, color: '#fff' }} open={is_load}>
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

      <Grid container spacing={3} className={'price ' + roboto.variable}>
        <Grid item xs={12}>
          <MyDatepicker
            label="Дата от"
            value={date_start}
            onChange={handleStartChange}
            fontSize={globalFontSize}
            minDate={startMinAllowed}
            maxDate={startMaxAllowed}
            shouldDisableDate={shouldDisableStart}
            disableFuture
            slotProps={{ textField: { inputProps: { readOnly: true } } }}
            onOpen={onStartOpen}
          />
        </Grid>

        <Grid item xs={12}>
          <MyDatepicker
            label="Дата до"
            value={date_end}
            onChange={handleEndChange}
            fontSize={globalFontSize}
            minDate={endMinAllowed}
            maxDate={endMaxAllowed}
            shouldDisableDate={shouldDisableEnd}
            disableFuture
            slotProps={{ textField: { inputProps: { readOnly: true } } }}
            onOpen={onEndOpen}
          />
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" onClick={getStat} style={{ fontSize: globalFontSize }}>
            Показать
          </Button>
        </Grid>

        <Grid item xs={12} mb={10}>
          <TableContainer
            id="tableGraph"
            component={Paper}
            sx={{
              maxHeight: 600,
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow
                  sx={{
                    '& .MuiTableCell-root': {
                      fontSize: globalFontSize,
                      fontWeight: 'bold',
                      minWidth: '200px',
                    },
                  }}
                >
                  <TableCell>Курьер</TableCell>
                  <TableCell>Среднее время ( в радиусе )</TableCell>
                  <TableCell>Количество</TableCell>
                  <TableCell>Во время</TableCell>
                  <TableCell>С опозданием</TableCell>
                  <TableCell>Вовремя и в радиусе</TableCell>
                  <TableCell>В радиусе</TableCell>
                  <TableCell>Не вовремя и не в радиусе</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {svod.map((row, key) => (
                  <TableRow
                    key={key}
                    sx={{
                      '& .MuiTableCell-root': {
                        fontSize: globalFontSize,
                        minWidth: '200px',
                      },
                    }}
                  >
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.time2}</TableCell>
                    <TableCell>{row.other_stat.all_count}</TableCell>
                    <TableCell>
                      {row.other_stat.norm} ({row.other_stat.norm_percent}%)
                    </TableCell>
                    <TableCell>
                      {row.other_stat.fake} ({row.other_stat.fake_percent}%)
                    </TableCell>
                    <TableCell>
                      {row.other_stat.time_dist_true} ({row.other_stat.time_dist_true_percent}%)
                    </TableCell>
                    <TableCell>
                      {row.other_stat.true_dist} ({row.other_stat.true_dist_percent}%)
                    </TableCell>
                    <TableCell>
                      {row.other_stat.time_dist_false} ({row.other_stat.time_dist_false_percent}%)
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Meta>
  );
}
