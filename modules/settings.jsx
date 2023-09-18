import React, { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

import Button from '@mui/material/Button';

import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';

import { useSettingsStore } from '@/components/store.js';
import { useSession } from 'next-auth/react';

import { CirclePicker } from 'react-color';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import Meta from '@/components/meta.js';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function SettingsPage(){

  const session = useSession();
  const [ saveMySetting, getMySetting ] = useSettingsStore( state => [ state.saveMySetting, state.getMySetting ] )
  
  const [ is_load, setIsLoad ] = useState( false );
  const [ groupTypeTime, setGroupTypeTime ] = useState( 'norm' );
  const [ type_show_del, setType_show_del ] = useState( 'min' );
  const [ update_interval, setUpdate_interval ] = useState( 30 );
  const [ centered_map, setСentered_map ] = useState( false );
  const [ color, setColor ] = useState();

  const [state, setState] = useState({
    open: false,
    vertical: 'top',
    horizontal: 'center',
  });

  const { vertical, horizontal, open } = state;

  useEffect( () => {

    const fetchData = async () => {
      if( session.data?.user?.token ){
        const res = await getMySetting(session.data?.user?.token);
  
        setColor( res.color )
        setСentered_map( parseInt(res.action_centered_map) == 1 ? true : false )
        setUpdate_interval( res.update_interval )
        setType_show_del( res.type_show_del )
        setGroupTypeTime( res.type_data_map )

        setIsLoad(true);
      }
    }
  
    if( !is_load ){
      fetchData();    
    }
  }, [session] )

  function save(){
    saveMySetting(session.data?.user?.token, groupTypeTime, type_show_del, update_interval, centered_map, color);

    setState({ ...state, open: true });
  }

  function closeModal(){
    setState({ ...state, open: false });
  }

  return (
    <Meta title='Настройки'>
    <Grid container spacing={3} className="price">
      
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        onClose={ () => closeModal() }
        autoHideDuration={5000}
      >
        <Alert onClose={ () => closeModal() } severity="success" sx={{ width: '100%' }}>
          Сохранено
        </Alert>
      </Snackbar>

      <Grid item xs={12} style={{ marginTop: 10 }}>
        <Paper style={{ padding: 20 }} elevation={5}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Формат данных на карте</FormLabel>
            <RadioGroup
              aria-label="gender"
              name="radio-buttons-group"
              value={groupTypeTime}
              onChange={ (event, data) => { setGroupTypeTime(data) } }
            >
              <FormControlLabel value="norm" control={<Radio />} label="Обычный (об заказ - время оформления, пред - промежуток времени)" />
              <FormControlLabel value="full" control={<Radio />} label="Полный (промежуток времени)" />
              <FormControlLabel value="min" control={<Radio />} label="Сокращенный (только оставшееся время)" />
            </RadioGroup>
          </FormControl>
        </Paper>
      </Grid>

      <Grid item xs={12} style={{ marginTop: 10 }}>
        <Paper style={{ padding: 20 }} elevation={5}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Отмененные заказы</FormLabel>
            <RadioGroup
              aria-label="gender"
              name="radio-buttons-group"
              value={type_show_del}
              onChange={ (event, data) => { setType_show_del( data ) } }
            >
              <FormControlLabel value="full" control={<Radio />} label="Показывать весь день" />
              <FormControlLabel value="min" control={<Radio />} label="30 минут" />
              <FormControlLabel value="max" control={<Radio />} label="2 часа" />
            </RadioGroup>
          </FormControl>
        </Paper>
      </Grid>
      
      <Grid item xs={12} style={{ marginTop: 10 }}>
        <Paper style={{ padding: 20 }} elevation={5}>
          <FormGroup>
            <FormControlLabel control={<Checkbox checked={centered_map} onClick={ (event) => { setСentered_map( event.target.checked ) } } />} label="При взятии, отмене заказа, центрировать карту" />
          </FormGroup>
        </Paper>
      </Grid>
      
      <Grid item xs={12} style={{ marginTop: 10 }}>
        <Paper style={{ padding: 20 }} elevation={5}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Частота обновления заказов</FormLabel>
            <RadioGroup
              aria-label="gender"
              name="radio-buttons-group1"
              value={update_interval}
              onChange={ (event, data) => { setUpdate_interval( data ) } }
            >
              <FormControlLabel value={0} control={<Radio />} label={'Не обновлять'} />
              <FormControlLabel value={10} control={<Radio />} label={'Каждые 10 секунд'} />
              <FormControlLabel value={30} control={<Radio />} label={'Каждые 30 секунд'} />
              <FormControlLabel value={60} control={<Radio />} label={'Каждые 60 секунд'} />
              <FormControlLabel value={120} control={<Radio />} label={'Каждые 120 секунд'} />
            </RadioGroup>
          </FormControl>
        </Paper>
      </Grid>

      <Grid item xs={12} style={{ marginTop: 10 }}>
        <Paper style={{ padding: 20 }} elevation={5} >
          <CirclePicker 
            style={{ width: '100%' }}
            color={ color }
            onChangeComplete={ c => setColor(c.hex) }
          />
        </Paper>
      </Grid>

      <Grid item xs={12} style={{ marginTop: 10, marginBottom: 50 }}>
        <Paper style={{ padding: 20 }} elevation={5} >
          <Button onClick={ () => save() } color="primary" variant="contained" style={{ width: '100%' }}>Сохранить</Button>
        </Paper>
      </Grid>

    </Grid>
    </Meta>
  )
}
