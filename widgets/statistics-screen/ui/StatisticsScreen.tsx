import React, { type ReactNode } from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

import type { StatisticsSummaryRow } from '@/entities/statistics';

import Meta from '@/components/meta';
import { roboto } from '@/shared/ui/Font';
import { useStatisticsScreen } from '../model/useStatisticsScreen';

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
              <section className="price__hero price__hero--minimal">
                <div className="price__heroTop">
                  <div className="price__heroMain">
                    <h1 className="price__heroTitle">Статистика времени</h1>
                  </div>
                </div>

                <div className="price__segmentedRangeControl">
                  <button
                    type="button"
                    className="price__segmentButton"
                    onClick={() => openPicker('start')}
                  >
                    <span className="price__segmentLabel">С</span>
                    <span className="price__segmentValue" style={{ fontSize: globalFontSize }}>
                      {dateStartLabel}
                    </span>
                  </button>

                  <span className="price__segmentDivider">по</span>

                  <button
                    type="button"
                    className="price__segmentButton price__segmentButton--end"
                    onClick={() => openPicker('end')}
                  >
                    <span className="price__segmentValue" style={{ fontSize: globalFontSize }}>
                      {dateEndLabel}
                    </span>
                  </button>
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

        <SwipeableDrawer
          anchor="bottom"
          open={Boolean(activePicker)}
          onClose={closePicker}
          onOpen={() => undefined}
          className="price__pickerDrawer"
          PaperProps={{ className: 'price__pickerPaper' }}
        >
          <div className="price__pickerSheet">
            <div className="price__pickerHandle" />

            <div className="price__pickerHeader">
              <h3 className="price__pickerTitle">{activePickerTitle}</h3>
            </div>

            <div className="price__pickerCalendar">
              <DateCalendar
                value={pickerValue}
                onChange={selectPickerDate}
                minDate={pickerMinDate}
                maxDate={pickerMaxDate}
              />
            </div>
          </div>
        </SwipeableDrawer>
      </LocalizationProvider>
    </Meta>
  );
}
