import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

 export default function MyAutocomplite({ id, data, func, label, value, multiple, placeholder }) {
   return (
     <Stack spacing={3}>
       <Autocomplete
         size="small"
         disableCloseOnSelect={true}
         id={id ?? null}
         options={data}
         getOptionLabel={(option) => option.name || ''}
         value={value}
         onChange={func}
         filterSelectedOptions
         multiple={multiple && multiple === true ? true : false }
         isOptionEqualToValue={(option, value) => parseInt(option.id) === parseInt(value.id) }
         renderInput={(params) => (
           <TextField
             {...params}
             label={label}
             placeholder={placeholder}
           />
         )}
       />
     </Stack>
   )
}

