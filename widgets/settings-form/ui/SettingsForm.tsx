
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
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';
import { CirclePicker, ColorResult } from 'react-color';
import Wheel from '@uiw/react-color-wheel';
import Alpha from '@uiw/react-color-alpha';
import { hsvaToHex, hexToHsva, HsvaColor } from '@uiw/color-convert';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { useSettingsStore, SettingsResponse } from '@/entities/settings/model/settings.store';
import { useHeaderStore } from '@/features/header/model/header.store';
import useSession from '@/components/sessionHook';
import { TypeDataMap, TypeShowDel, ThemeType } from '@/shared/types/settings';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface SnackbarState {
  open: boolean;
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
  severity: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export const SettingsForm: React.FC = () => {
  const session = useSession();
  const [saveMySetting, getMySetting, isSaving] = useSettingsStore(state => [
    state.saveMySetting,
    state.getMySetting,
    state.isClick,
  ]);
  const [globalFontSize, setGlobalFontSize, setTheme, setGlobalMapScale] = useHeaderStore(state => [
    state.globalFontSize,
    state.setGlobalFontSize,
    state.setTheme,
    state.setGlobalMapScale,
  ]);

  const [is_load, setIsLoad] = useState<boolean>(false);
  const [groupTypeTime, setGroupTypeTime] = useState<TypeDataMap>('norm');
  const [type_show_del, setType_show_del] = useState<TypeShowDel>('min');
  const [update_interval, setUpdate_interval] = useState<number>(30);
  const [centered_map, setСentered_map] = useState<boolean>(false);
  const [night_map, setNight_map] = useState<boolean>(false);
  const [is_scaleMap, setIs_scaleMap] = useState<boolean>(false);
  const [color, setColor] = useState<string>('#000000');
  const [hsva, setHsva] = useState<HsvaColor>({ h: 214, s: 43, v: 90, a: 1 });
  const [groupTypeTheme, setGroupTypeTheme] = useState<ThemeType>('white');
  const [fontSize, setFontSize] = useState<number>(10);
  const [mapScale, setMapScale] = useState<number>(1);
  const [state, setState] = useState<SnackbarState>({
    open: false,
    vertical: 'top',
    horizontal: 'center',
    severity: 'success',
    message: '',
  });

  const { vertical, horizontal, open, severity, message } = state;

  useEffect(() => {
    const fetchData = async () => {
      if (session?.isAuth !== true) return;

      const res = (await getMySetting(session?.token ?? '')) as SettingsResponse;
      if (res?.color && res?.color?.length > 0) {
        const colorValue = res.color === '#000000' ? { h: 214, s: 43, v: 90, a: 1 } : res.color;
        const color_2 = hexToHsva(colorValue as string);
        setColor(colorValue as string);
        setHsva(color_2);
      }

      setСentered_map(parseInt(String(res.action_centered_map)) === 1);
      setNight_map(parseInt(String(res.night_map)) === 1);
      setIs_scaleMap(parseInt(String(res.is_scaleMap)) === 1);
      setUpdate_interval(parseInt(String(res.update_interval ?? 30)));
      setType_show_del((res.type_show_del as TypeShowDel) ?? 'min');
      setGroupTypeTime((res.type_data_map as TypeDataMap) ?? 'norm');
      setGroupTypeTheme((res.theme as ThemeType) ?? 'white');
      setFontSize(parseInt(String(res.fontSize ?? 16)));
      setMapScale(parseFloat(String(res.mapScale ?? 1)));
      setIsLoad(true);
    };

    if (!is_load) {
      void fetchData();
    }
  }, [getMySetting, is_load, session?.isAuth, session?.token]);

  const save = async (): Promise<void> => {
    const result = await saveMySetting(
      session?.token,
      groupTypeTime,
      type_show_del,
      update_interval,
      centered_map,
      color,
      fontSize,
      groupTypeTheme,
      mapScale,
      night_map,
      is_scaleMap
    );

    if (result?.st) {
      setGlobalFontSize(fontSize);
      setTheme(groupTypeTheme);
      setGlobalMapScale(String(mapScale));
      setState(prev => ({
        ...prev,
        open: true,
        severity: 'success',
        message: 'Сохранено',
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      open: true,
      severity: 'error',
      message: result?.text || 'Не удалось сохранить настройки',
    }));
  };

  const closeModal = (): void => {
    setState({ ...state, open: false });
  };

  return (
    <>
      <Backdrop style={{ zIndex: 9999, color: '#fff' }} open={isSaving}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Grid container spacing={3} className="price">
        <Snackbar
          anchorOrigin={{ vertical, horizontal }}
          open={open}
          onClose={closeModal}
          autoHideDuration={5000}
        >
          <Alert onClose={closeModal} severity={severity} sx={{ width: '100%', fontSize: globalFontSize }}>
            {message}
          </Alert>
        </Snackbar>

        {/* Формат данных на карте */}
        <Grid size={12} style={{ marginTop: 10 }}>
          <Paper className="container_paper" elevation={5}>
            <div style={{ paddingBottom: 10 }}>
              <span style={{ fontSize: globalFontSize }}>Формат данных на карте</span>
            </div>
            <img style={{ width: '100%', height: 'auto' }} src="/map.png" alt="Пример карты" />
            <div className="location" onClick={() => setGroupTypeTime('norm')}>
              <div style={{ color: groupTypeTime === 'norm' ? 'red' : 'blue' }}>📍</div>
              <span className="span_text_white_border">21:46 (53 мин.)</span>
            </div>
            <div className="location" style={{ top: '40%' }} onClick={() => setGroupTypeTime('full')}>
              <div style={{ color: groupTypeTime === 'full' ? 'red' : 'blue' }}>📍</div>
              <span className="span_text_white_border">21:46 - 22:16 (53 мин.)</span>
            </div>
            <div className="location" style={{ top: '60%' }} onClick={() => setGroupTypeTime('min')}>
              <div style={{ color: groupTypeTime === 'min' ? 'red' : 'blue' }}>📍</div>
              <span className="span_text_white_border">53 мин.</span>
            </div>
          </Paper>
        </Grid>

        {/* Оформление */}
        <Grid size={12} style={{ marginTop: 10 }}>
          <Paper className="container_paper" elevation={5}>
            <div style={{ paddingBottom: 10 }}>
              <span style={{ fontSize: globalFontSize }}>Оформление</span>
            </div>
            <img style={{ width: '100%', height: 'auto' }} src="/map_2.png" alt="Пример оформления" />
            <div className="location_ya" style={{ top: 80 }} onClick={() => setGroupTypeTheme('classic')}>
              <div style={{ color: groupTypeTheme === 'classic' ? 'red' : 'blue' }}>📍</div>
              <span>Классический яндекс</span>
            </div>
            <div className="location" style={{ top: 140 }} onClick={() => setGroupTypeTheme('transparent')}>
              <div style={{ color: groupTypeTheme === 'transparent' ? 'red' : 'blue' }}>📍</div>
              <span className="span_text_transparent">21:46 (53 мин.)</span>
            </div>
            <div className="location" style={{ top: 200 }} onClick={() => setGroupTypeTheme('transparent_white')}>
              <div style={{ color: groupTypeTheme === 'transparent_white' ? 'red' : 'blue' }}>📍</div>
              <span className="span_text_transparent_white">21:46 (53 мин.)</span>
            </div>
            <div className="location" style={{ top: 260 }} onClick={() => setGroupTypeTheme('white')}>
              <div style={{ color: groupTypeTheme === 'white' ? 'red' : 'blue' }}>📍</div>
              <span className="span_text_white">21:46 (53 мин.)</span>
            </div>
            <div className="location" style={{ top: 325 }} onClick={() => setGroupTypeTheme('white_border')}>
              <div style={{ color: groupTypeTheme === 'white_border' ? 'red' : 'blue' }}>📍</div>
              <span className="span_text_white_border">21:46 (53 мин.)</span>
            </div>
            <div className="location" style={{ top: 385 }} onClick={() => setGroupTypeTheme('black')}>
              <div style={{ color: groupTypeTheme === 'black' ? 'red' : 'blue' }}>📍</div>
              <span className="span_text_black">21:46 (53 мин.)</span>
            </div>
          </Paper>
        </Grid>

        {/* Отмененные заказы */}
        <Grid size={12} style={{ marginTop: 10 }}>
          <Paper style={{ padding: 20 }} elevation={5}>
            <FormControl component="fieldset">
              <FormLabel component="legend" style={{ fontSize: globalFontSize, color: 'rgba(0, 0, 0, 0.8)' }}>
                Отмененные заказы
              </FormLabel>
              <RadioGroup value={type_show_del} onChange={(_, data) => setType_show_del(data as TypeShowDel)}>
                <FormControlLabel
                  value="full"
                  control={<Radio />}
                  label="Показывать весь день"
                  sx={{
                    '& .MuiFormControlLabel-label': { fontSize: globalFontSize },
                    '& .MuiButtonBase-root.MuiRadio-root.Mui-checked .MuiSvgIcon-root': { color: '#CC0033' },
                  }}
                />
                <FormControlLabel
                  value="min"
                  control={<Radio />}
                  label="30 минут"
                  sx={{
                    '& .MuiFormControlLabel-label': { fontSize: globalFontSize },
                    '& .MuiButtonBase-root.MuiRadio-root.Mui-checked .MuiSvgIcon-root': { color: '#CC0033' },
                  }}
                />
                <FormControlLabel
                  value="max"
                  control={<Radio />}
                  label="2 часа"
                  sx={{
                    '& .MuiFormControlLabel-label': { fontSize: globalFontSize },
                    '& .MuiButtonBase-root.MuiRadio-root.Mui-checked .MuiSvgIcon-root': { color: '#CC0033' },
                  }}
                />
              </RadioGroup>
            </FormControl>
          </Paper>
        </Grid>

        {/* Центрирование карты */}
        <Grid size={12} style={{ marginTop: 10 }}>
          <Paper style={{ padding: 20 }} elevation={5}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox checked={centered_map} onClick={e => setСentered_map((e.target as HTMLInputElement).checked)} />
                }
                label="При взятии, отмене заказа, центрировать карту"
                sx={{
                  '& .MuiFormControlLabel-label': { fontSize: globalFontSize },
                  '& .MuiButtonBase-root.MuiRadio-root.Mui-checked .MuiSvgIcon-root': { color: '#CC0033' },
                }}
              />
            </FormGroup>
          </Paper>
        </Grid>

        {/* Настройки карты */}
        <Grid size={12} style={{ marginTop: 10 }}>
          <Paper style={{ padding: 20 }} elevation={5}>
            <div style={{ paddingBottom: '10px' }}>
              <span style={{ fontSize: globalFontSize }}>Карта</span>
            </div>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={night_map} onClick={e => setNight_map((e.target as HTMLInputElement).checked)} />}
                label="Темная тема"
                sx={{
                  '& .MuiFormControlLabel-label': { fontSize: globalFontSize },
                  '& .MuiButtonBase-root.MuiRadio-root.Mui-checked .MuiSvgIcon-root': { color: '#CC0033' },
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox checked={is_scaleMap} onClick={e => setIs_scaleMap((e.target as HTMLInputElement).checked)} />
                }
                label="Ползунок масштабирования карты"
                sx={{
                  '& .MuiFormControlLabel-label': { fontSize: globalFontSize },
                  '& .MuiButtonBase-root.MuiRadio-root.Mui-checked .MuiSvgIcon-root': { color: '#CC0033' },
                }}
              />
            </FormGroup>
          </Paper>
        </Grid>

        {/* Размер шрифта */}
        <Grid size={12} style={{ marginTop: 10 }}>
          <Paper className="container_paper" elevation={5}>
            <div style={{ paddingBottom: '10px' }}>
              <span style={{ fontSize: globalFontSize }}>Размер шрифта ({fontSize})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#000', fontSize: '10px' }}>Ая</span>
              <span style={{ color: '#000', fontSize }}>Ая</span>
              <span style={{ color: '#000', fontSize: '40px' }}>Ая</span>
            </div>
            <Slider
              size="medium"
              value={fontSize}
              valueLabelDisplay="off"
              step={1}
              max={40}
              min={10}
              color="info"
              onChange={(_, value) => setFontSize(value as number)}
            />
          </Paper>
        </Grid>

        {/* Масштабирование иконок */}
        <Grid size={12} style={{ marginTop: 10 }}>
          <Paper className="container_paper" elevation={5}>
            <div style={{ paddingBottom: '10px' }}>
              <span style={{ fontSize: globalFontSize }}>Масштабирование иконок на карте ({mapScale})</span>
            </div>
            <Slider
              size="medium"
              value={mapScale}
              valueLabelDisplay="off"
              step={0.1}
              max={1.3}
              min={0.5}
              color="info"
              onChange={(_, value) => setMapScale(value as number)}
            />
          </Paper>
        </Grid>

        {/* Частота обновления */}
        <Grid size={12} style={{ marginTop: 10 }}>
          <Paper style={{ padding: 20 }} elevation={5}>
            <FormControl component="fieldset">
              <FormLabel component="legend" style={{ fontSize: globalFontSize, color: 'rgba(0, 0, 0, 0.8)' }}>
                Частота обновления заказов
              </FormLabel>
              <RadioGroup value={update_interval} onChange={(_, data) => setUpdate_interval(Number(data))}>
                <FormControlLabel
                  value={0}
                  control={<Radio />}
                  label="Не обновлять"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: globalFontSize } }}
                />
                <FormControlLabel
                  value={10}
                  control={<Radio />}
                  label="Каждые 10 секунд"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: globalFontSize } }}
                />
                <FormControlLabel
                  value={30}
                  control={<Radio />}
                  label="Каждые 30 секунд"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: globalFontSize } }}
                />
                <FormControlLabel
                  value={60}
                  control={<Radio />}
                  label="Каждые 60 секунд"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: globalFontSize } }}
                />
                <FormControlLabel
                  value={120}
                  control={<Radio />}
                  label="Каждые 120 секунд"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: globalFontSize } }}
                />
              </RadioGroup>
            </FormControl>
          </Paper>
        </Grid>

        {/* Цвет на карте */}
        <Grid size={12} style={{ marginTop: 10 }}>
          <Paper className="container_paper_picker" elevation={5}>
            <div style={{ paddingBottom: 30, alignSelf: 'flex-start' }}>
              <span style={{ fontSize: globalFontSize }}>Цвет на карте</span>
            </div>
            <Wheel
              color={color}
              onChange={c => {
                setHsva(c.hsva);
                setColor(c.hex);
              }}
              style={{ marginBottom: 40 }}
            />
            <Alpha
              hsva={hsva}
              width="90%"
              onChange={newAlpha => {
                setHsva(newAlpha);
                setColor(hsvaToHex(newAlpha));
              }}
              style={{ marginBottom: 40 }}
            />
            <div className="container_picker">
              <CirclePicker
                width="100%"
                color={color}
                onChangeComplete={(c: ColorResult) => {
                  setHsva(hexToHsva(c.hex));
                  setColor(c.hex);
                }}
              />
            </div>
          </Paper>
        </Grid>

        {/* Кнопка сохранения */}
        <Grid size={12} style={{ marginTop: 10, marginBottom: 50 }}>
          <Paper style={{ padding: 20 }} elevation={5}>
            <Button
              disabled={isSaving}
              onClick={save}
              color="primary"
              variant="contained"
              style={{ width: '100%', fontSize: globalFontSize }}
            >
              {isSaving ? 'Сохраняем...' : 'Сохранить'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};
