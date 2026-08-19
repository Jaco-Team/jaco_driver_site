import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

import { roboto } from '@/shared/ui/Font';
import { usePriceScreen } from '../model/usePriceScreen';

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
    pickerValue,
    pickerMinDate,
    pickerMaxDate,
    openStartPicker,
    openEndPicker,
    closePicker,
    selectPickerDate,
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

              <div className="price__segmentedRangeControl">
                <button type="button" className="price__segmentButton" onClick={openStartPicker}>
                  <span className="price__segmentLabel">С</span>
                  <span className="price__segmentValue" style={{ fontSize: globalFontSize }}>
                    {startDateLabel}
                  </span>
                </button>

                <span className="price__segmentDivider">по</span>

                <button
                  type="button"
                  className="price__segmentButton price__segmentButton--end"
                  onClick={openEndPicker}
                >
                  <span className="price__segmentValue" style={{ fontSize: globalFontSize }}>
                    {endDateLabel}
                  </span>
                </button>
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

      <SwipeableDrawer
        anchor="bottom"
        open={Boolean(activePicker)}
        onClose={closePicker}
        onOpen={() => undefined}
        className="price__pickerDrawer"
        slotProps={{
          paper: { className: 'price__pickerPaper' },
        }}
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
  );
}
