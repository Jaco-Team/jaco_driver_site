import TextField from '@mui/material/TextField';

export default function MyTextInput({ label, value, onChange, onBlur, type, onKeyPress }){
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      variant="outlined" 
      size={'small'} 
      type={type}
      color='primary'
      style={{ width: '100%' }}
      onKeyPress={ event => {
        if( onKeyPress && event.charCode == 13 ){
          onKeyPress();
        }
      }}
    />
  )
}