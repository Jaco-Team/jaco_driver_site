import React, { type ReactNode } from 'react';

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

import type { StatisticsSummaryRow } from '@/entities/statistics';

import Meta from '@/components/meta';
import { roboto } from '@/shared/ui/Font';
import { IconButton } from '@mui/material';
import { useStatisticsScreen } from '../model/useStatisticsScreen';

type DateLauncherProps = {
  label: string;
  value: string;
  onClick: () => void;
  globalFontSize: number;
};

type MetricRowProps = {
  label: string;
  value: ReactNode;
  emphasize?: boolean;
  hideDivider?: boolean;
  globalFontSize: number;
};

type SectionCardHeaderProps = {
  icon: ReactNode;
  title: string;
  description?: string | null;
};

type CourierCardProps = {
  row: StatisticsSummaryRow;
  globalFontSize: number;
  title: string;
  icon: ReactNode;
  description?: string | null;
};

function DateLauncher({ label, value, onClick, globalFontSize }: DateLauncherProps) {
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

function MetricRow({
  label,
  value,
  emphasize = false,
  hideDivider = false,
  globalFontSize,
}: MetricRowProps) {
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

function SectionCardHeader({ icon, title, description }: SectionCardHeaderProps) {
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

function CourierCard({ row, globalFontSize, title, icon, description }: CourierCardProps) {
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
  const {
    isLoad,
    globalFontSize,
    snackbar,
    dateStartLabel,
    dateEndLabel,
    displayRows,
    activePicker,
    draftDate,
    pickerMinDate,
    pickerMaxDate,
    pickerFullScreen,
    isSummaryRow,
    setDraftDate,
    openPicker,
    closePicker,
    applyDraftDate,
    getStat,
    closeSnackbar,
  } = useStatisticsScreen();
  const { vertical, horizontal, open, message } = snackbar;

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
                    value={dateStartLabel}
                    globalFontSize={globalFontSize}
                    onClick={() => openPicker('start')}
                  />

                  <DateLauncher
                    label="Дата до"
                    value={dateEndLabel}
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
