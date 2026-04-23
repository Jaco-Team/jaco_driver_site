import Autocomplete from '@mui/material/Autocomplete';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

interface AutocompleteOption {
  id?: string | number;
  name?: string;
}

interface MyAutocompleteProps {
  id?: string | null;
  data: AutocompleteOption[];
  func?: (...args: unknown[]) => void;
  label?: string;
  value?: AutocompleteOption | AutocompleteOption[] | null;
  multiple?: boolean;
  placeholder?: string;
}

export default function MyAutocomplete({
  id,
  data,
  func,
  label,
  value,
  multiple,
  placeholder,
}: MyAutocompleteProps) {
  return (
    <Stack spacing={3}>
      <Autocomplete
        size="small"
        disableCloseOnSelect
        id={id ?? undefined}
        options={data}
        getOptionLabel={(option) => option.name || ''}
        value={value ?? (multiple ? [] : null)}
        onChange={(...args) => func?.(...args)}
        filterSelectedOptions
        multiple={Boolean(multiple)}
        isOptionEqualToValue={(option, selected) =>
          parseInt(String(option.id), 10) === parseInt(String(selected.id), 10)
        }
        renderInput={(params) => <TextField {...params} label={label} placeholder={placeholder} />}
      />
    </Stack>
  );
}
