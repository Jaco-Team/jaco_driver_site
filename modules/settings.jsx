import React, { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

import Slider from '@mui/material/Slider';

import Button from '@mui/material/Button';

import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';

import { useSettingsStore, useHeaderStore } from '@/components/store.js';
import useSession from '@/components/sessionHook';

import { CirclePicker } from 'react-color';

import Wheel from '@uiw/react-color-wheel';
import Alpha from '@uiw/react-color-alpha';
import { hsvaToHex, hexToHsva } from '@uiw/color-convert'

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import Meta from '@/components/meta.js';

import { roboto } from '@/ui/Font';
import { Location, PlacemarkIcon } from '@/ui/Icons';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function SettingsPage(){

  const session = useSession();
  const [ saveMySetting, getMySetting ] = useSettingsStore( state => [ state.saveMySetting, state.getMySetting ] )

  const [ globalFontSize, setGlobalFontSize, setTheme, setGlobalMapScale] = useHeaderStore(state => [state.globalFontSize, state.setGlobalFontSize, state.setTheme, state.setGlobalMapScale]);
  
  const [ is_load, setIsLoad ] = useState( false );
  const [ groupTypeTime, setGroupTypeTime ] = useState( 'norm' );
  const [ type_show_del, setType_show_del ] = useState( 'min' );
  const [ update_interval, setUpdate_interval ] = useState( 30 );
  const [ centered_map, setСentered_map ] = useState( false );

  const [ color, setColor ] = useState("#000000");
  const [hsva, setHsva] = useState({ h: 214, s: 43, v: 90, a: 1 });

  const [groupTypeTheme, setGroupTypeTheme] = useState('white');
  const [fontSize, setFontSize] = React.useState(10);
  const [mapScale, setMapScale] = React.useState(1);

  const [state, setState] = useState({
    open: false,
    vertical: 'top',
    horizontal: 'center',
  });

  const { vertical, horizontal, open } = state;

  useEffect( () => {
    const fetchData = async () => {
      if( session?.token ){
        const res = await getMySetting(session?.token);
        if( res?.color && res?.color?.length > 0 ){
          const color = res.color === "#000000" ? { h: 214, s: 43, v: 90, a: 1 } : res.color;
          const color_2 = hexToHsva(color);
          setColor(color);
          setHsva(color_2);
        }

        setСentered_map( parseInt(res.action_centered_map) == 1 ? true : false )
        setUpdate_interval( res.update_interval )
        setType_show_del( res.type_show_del )
        setGroupTypeTime( res.type_data_map )

        setGroupTypeTheme(res.theme)
        setFontSize(parseInt(res.fontSize));
        setMapScale(parseInt(res.mapScale));

        setIsLoad(true);
      }
    }
  
    if( !is_load ){
      fetchData();    
    }
  }, [] )

  function save(){
    saveMySetting(
      session?.token, 
      groupTypeTime, 
      type_show_del, 
      update_interval, 
      centered_map, 
      color,
      fontSize,
      groupTypeTheme,
      mapScale
    );

    setGlobalFontSize(fontSize);
    setTheme(groupTypeTheme);
    setGlobalMapScale(mapScale);

    setState({ ...state, open: true });
  }

  function closeModal(){
    setState({ ...state, open: false });
  }

  return (
    <Meta title='Настройки'>
      <Grid container spacing={3} className={"price " + roboto.variable}>
        
        <Snackbar
          anchorOrigin={{ vertical, horizontal }}
          open={open}
          onClose={ () => closeModal() }
          autoHideDuration={5000}
        >
          <Alert onClose={ () => closeModal() } severity="success" sx={{ width: '100%', fontSize: globalFontSize }}>
            Сохранено
          </Alert>
        </Snackbar>

        <Grid item xs={12} style={{ marginTop: 10 }}>
          <Paper className='container_paper' elevation={5}>
            <div style={{ paddingBottom: 10 }}>
              <span style={{fontSize: globalFontSize }}>Формат данных на карте</span>
            </div>
            <img
              style={{ width: '100%', height: 'auto' }}
              src={'/map.png'}
            />
            <div className='location' onClick={() => setGroupTypeTime('norm')}>
              <Location fill={groupTypeTime === 'norm' ? 'red' : 'blue'}/>
              <span className='span_text_white_border'>21:46 (53 мин.)</span>
            </div>
            <div className='location' style={{ top: '40%'}} onClick={() => setGroupTypeTime('full')}>
              <Location fill={groupTypeTime === 'full' ? 'red' : 'blue'} />
              <span className='span_text_white_border'>21:46 - 22:16 (53 мин.)</span>
            </div>
            <div className='location' style={{ top: '60%'}} onClick={() => setGroupTypeTime('min')}>
              <Location fill={groupTypeTime === 'min' ? 'red' : 'blue'} />
              <span className='span_text_white_border'>53 мин.</span>
            </div>
          </Paper>
        </Grid>

        <Grid item xs={12} style={{ marginTop: 10 }}>
          <Paper className='container_paper' elevation={5}>
            <div style={{ paddingBottom: 10 }}>
              <span style={{fontSize: globalFontSize }}>Оформление</span>
            </div>
            <img
              style={{ width: '100%', height: 'auto' }}
              src={'/map_2.png'}
            />
            <div className='location_ya' style={{ top: 80}} onClick={() => setGroupTypeTheme('classic')}>
              <PlacemarkIcon fill={groupTypeTheme === 'classic' ? 'red' : 'blue'}/>
              <span>Классический яндекс</span>
            </div>
            <div className='location' style={{ top: 140}} onClick={() => setGroupTypeTheme('transparent')}>
              <Location fill={groupTypeTheme === 'transparent' ? 'red' : 'blue'}/>
              <span className='span_text_transparent'>21:46 (53 мин.)</span>
            </div>
            <div className='location' style={{ top: 200}} onClick={() => setGroupTypeTheme('white')}>
              <Location fill={groupTypeTheme === 'white' ? 'red' : 'blue'} />
              <span className='span_text_white'>21:46 (53 мин.)</span>
            </div>
            <div className='location' style={{ top: 260}} onClick={() => setGroupTypeTheme('white_border')}>
              <Location fill={groupTypeTheme === 'white_border' ? 'red' : 'blue'} />
              <span className='span_text_white_border'>21:46 (53 мин.)</span>
            </div>
            <div className='location' style={{ top: 325}} onClick={() => setGroupTypeTheme('black')}>
              <Location fill={groupTypeTheme === 'black' ? 'red' : 'blue'} />
              <span className='span_text_black'>21:46 (53 мин.)</span>
            </div>
          </Paper>
        </Grid>

        <Grid item xs={12} style={{ marginTop: 10 }}>
          <Paper style={{ padding: 20 }} elevation={5}>
            <FormControl component="fieldset">
              <FormLabel component="legend" style={{fontSize: globalFontSize, color: 'rgba(0, 0, 0, 0.8)' }}>Отмененные заказы</FormLabel>
              <RadioGroup
                aria-label="gender"
                name="radio-buttons-group"
                value={type_show_del}
                onChange={ (event, data) => { setType_show_del( data ) } }
              >
                <FormControlLabel value="full" control={<Radio />} label="Показывать весь день" 
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontSize: globalFontSize
                    },
                    "& .MuiButtonBase-root.MuiRadio-root.Mui-checked": {
                      "& .MuiSvgIcon-root.MuiSvgIcon-fontSizeMedium": {
                        color: '#CC0033'
                      }
                    }
                  }}
                />
                <FormControlLabel value="min" control={<Radio />} label="30 минут" 
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontSize: globalFontSize
                    },
                    "& .MuiButtonBase-root.MuiRadio-root.Mui-checked": {
                      "& .MuiSvgIcon-root.MuiSvgIcon-fontSizeMedium": {
                        color: '#CC0033'
                      }
                    }
                  }}
                />
                <FormControlLabel value="max" control={<Radio />} label="2 часа" 
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontSize: globalFontSize
                    },
                    "& .MuiButtonBase-root.MuiRadio-root.Mui-checked": {
                      "& .MuiSvgIcon-root.MuiSvgIcon-fontSizeMedium": {
                        color: '#CC0033'
                      }
                    }
                  }}
                />
              </RadioGroup>
            </FormControl>
          </Paper>
        </Grid>
        
        <Grid item xs={12} style={{ marginTop: 10 }}>
          <Paper style={{ padding: 20 }} elevation={5}>
            <FormGroup>
              <FormControlLabel 
                control={<Checkbox checked={centered_map} 
                onClick={ (event) => { setСentered_map( event.target.checked ) } } />} 
                label="При взятии, отмене заказа, центрировать карту" 
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: globalFontSize
                  },
                  "& .MuiButtonBase-root.MuiRadio-root.Mui-checked": {
                    "& .MuiSvgIcon-root.MuiSvgIcon-fontSizeMedium": {
                      color: '#CC0033'
                    }
                  }
                }}
              />
            </FormGroup>
          </Paper>
        </Grid>

        <Grid item xs={12} style={{ marginTop: 10 }}>
          <Paper className='container_paper' elevation={5}>
            <div style={{ paddingBottom: '10px' }}>
              <span style={{ fontSize: globalFontSize }}>Размер шрифта ({fontSize})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{color: '#000', fontSize: '10px'}}>Ая</span>
              <span style={{color: '#000', fontSize: fontSize}}>Ая</span>
              <span style={{color: '#000', fontSize: '40px'}}>Ая</span>
            </div>
            <Slider
              size='medium'
              value={fontSize}
              valueLabelDisplay="off"
              step={1}
              max={40}
              min={10}
              color='info'
              onChange={event => { event && setFontSize(Math.floor(event.target.value)); }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} style={{ marginTop: 10 }}>
          <Paper className='container_paper' elevation={5}>
            <div style={{ paddingBottom: '10px' }}>
              <span style={{ fontSize: globalFontSize }}>Масштабирование иконок на карте ({mapScale})</span>
            </div>
            <Slider
              size='medium'
              value={mapScale}
              valueLabelDisplay="off"
              step={0.1}
              max={1.3}
              min={0.5}
              color='info'
              onChange={event => { event && setMapScale(event.target.value); }}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} style={{ marginTop: 10 }}>
          <Paper style={{ padding: 20 }} elevation={5}>
            <FormControl component="fieldset">
              <FormLabel component="legend" style={{fontSize: globalFontSize, color: 'rgba(0, 0, 0, 0.8)' }}>Частота обновления заказов</FormLabel>
              <RadioGroup
                aria-label="gender"
                name="radio-buttons-group1"
                value={update_interval}
                onChange={ (event, data) => { setUpdate_interval( data ) } }
              >
                <FormControlLabel value={0} control={<Radio />} label={'Не обновлять'} 
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontSize: globalFontSize
                    },
                    "& .MuiButtonBase-root.MuiRadio-root.Mui-checked": {
                      "& .MuiSvgIcon-root.MuiSvgIcon-fontSizeMedium": {
                        color: '#CC0033'
                      }
                    }
                  }}
                />
                <FormControlLabel value={10} control={<Radio />} label={'Каждые 10 секунд'} 
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontSize: globalFontSize
                    },
                    "& .MuiButtonBase-root.MuiRadio-root.Mui-checked": {
                      "& .MuiSvgIcon-root.MuiSvgIcon-fontSizeMedium": {
                        color: '#CC0033'
                      }
                    }
                  }}
                />
                <FormControlLabel value={30} control={<Radio />} label={'Каждые 30 секунд'} 
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontSize: globalFontSize
                    },
                    "& .MuiButtonBase-root.MuiRadio-root.Mui-checked": {
                      "& .MuiSvgIcon-root.MuiSvgIcon-fontSizeMedium": {
                        color: '#CC0033'
                      }
                    }
                  }}
                />
                <FormControlLabel value={60} control={<Radio />} label={'Каждые 60 секунд'} 
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontSize: globalFontSize
                    },
                    "& .MuiButtonBase-root.MuiRadio-root.Mui-checked": {
                      "& .MuiSvgIcon-root.MuiSvgIcon-fontSizeMedium": {
                        color: '#CC0033'
                      }
                    }
                  }}
                />
                <FormControlLabel value={120} control={<Radio />} label={'Каждые 120 секунд'} 
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontSize: globalFontSize
                    },
                    "& .MuiButtonBase-root.MuiRadio-root.Mui-checked": {
                      "& .MuiSvgIcon-root.MuiSvgIcon-fontSizeMedium": {
                        color: '#CC0033'
                      }
                    }
                  }}
                />
              </RadioGroup>
            </FormControl>
          </Paper>
        </Grid>

        <Grid item xs={12} style={{ marginTop: 10 }}>
          <Paper className='container_paper_picker' elevation={5} >
            <div style={{ paddingBottom: 30, alignSelf: 'flex-start' }}>
              <span style={{fontSize: globalFontSize }}>Цвет на карте</span>
            </div>
            <Wheel 
              color={color} 
              onChange={c => {setHsva(c.hsva); setColor(c.hex);}} 
              style={{ marginBottom: 40 }}
            />
            <Alpha
              hsva={hsva}
              width='90%'
              onChange={(newAlpha) => {setHsva(newAlpha); setColor(hsvaToHex(newAlpha));}}
              style={{ marginBottom: 40 }}
            />
            <div className='container_picker'>
              <CirclePicker 
                width='100%'
                color={ color }
                onChangeComplete={ c => {setHsva(hexToHsva(c.hex)); setColor(c.hex);}}
              />
            </div>
          </Paper>
        </Grid>

        <Grid item xs={12} style={{ marginTop: 10, marginBottom: 50 }}>
          <Paper style={{ padding: 20 }} elevation={5} >
            <Button onClick={ () => save() } color="primary" variant="contained" style={{ width: '100%', fontSize: globalFontSize }}>Сохранить</Button>
          </Paper>
        </Grid>

      </Grid>
    </Meta>
  )
}
