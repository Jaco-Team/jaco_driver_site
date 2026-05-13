import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

import { roboto } from '@/shared/ui/Font';
import { usePriceScreen } from '../model/usePriceScreen';

import { DateLauncher } from './DateLauncher';
import { MetricRow } from './MetricRow';

export default function PricePage() {
  const {
    globalFontSize,
    isStatLoading,
    startDateLabel,
    endDateLabel,
    totalPriceLabel,
    totalPriceFontSize,
    summaryRows,
    settlementRows,
    activePicker,
    activePickerTitle,
    draftDate,
    setDraftDate,
    pickerMinDate,
    pickerMaxDate,
    pickerFullScreen,
    openStartPicker,
    openEndPicker,
    closePicker,
    applyDraftDate,
  } = usePriceScreen();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <Backdrop style={{ zIndex: 9999, color: '#fff' }} open={isStatLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>

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
                  value={startDateLabel}
                  globalFontSize={globalFontSize}
                  onClick={openStartPicker}
                />

                <DateLauncher
                  label="Дата до"
                  value={endDateLabel}
                  globalFontSize={globalFontSize}
                  onClick={openEndPicker}
                />
              </div>
            </section>
          </div>
        </Grid>

        <Grid size={12}>
          <div className="price__content">
            <section className="price__card price__card--plain">
              <div className="price__total" style={{ fontSize: totalPriceFontSize }}>
                {totalPriceLabel}
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
          {activePickerTitle}
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
  );
}
