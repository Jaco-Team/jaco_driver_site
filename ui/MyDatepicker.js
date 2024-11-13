import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import 'dayjs/locale/ru';

export default function MyDatepicker({label, onChange, value, fontSize}) {

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <DatePicker 
        format="YYYY-MM-DD"
        label={label}
        defaultValue={value}
        onChange={onChange}
        closeOnSelect={true}
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
