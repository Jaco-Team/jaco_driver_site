import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { Dayjs } from 'dayjs';

import 'dayjs/locale/ru';

interface MyDatepickerProps {
  label?: string;
  onChange?: (value: Dayjs | null) => void;
  value?: Dayjs | null;
  fontSize?: number;
  maxDate?: Dayjs | null;
  minDate?: Dayjs | null;
  onOpen?: () => void;
  onClose?: () => void;
  [key: string]: unknown;
}

export default function MyDatepicker({
  label,
  onChange,
  value,
  fontSize,
  maxDate,
  minDate,
  onOpen,
  onClose,
  ...props
}: MyDatepickerProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <DatePicker
        format="YYYY-MM-DD"
        label={label}
        value={value}
        onChange={onChange}
        closeOnSelect
        maxDate={maxDate ?? undefined}
        minDate={minDate ?? undefined}
        onOpen={onOpen}
        onClose={onClose}
        {...props}
        sx={{
          '& .MuiInputLabel-root': {
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
