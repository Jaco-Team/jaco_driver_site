import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import 'dayjs/locale/ru';

export default function MyDatepicker({label, onChange, value, fontSize, maxDate, minDate, onOpen, onClose}) {

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <DatePicker
        format="YYYY-MM-DD"
        label={label}
        defaultValue={value}
        onChange={onChange}
        closeOnSelect={true}
        maxDate={maxDate ? maxDate : undefined}
        minDate={minDate ? minDate : undefined}
        onOpen={onOpen} 
        onClose={onClose}
        sx={{
          "& .MuiInputLabel-root": {
            fontSize,
          },
          input: {
            fontSize,
          },
        }}
      />
    </LocalizationProvider>
  );
}
