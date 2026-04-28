import React from 'react';
import Grid from '@mui/material/Grid';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { Location, PlacemarkIcon } from '@/shared/ui/Icons';

import { useSettingsForm } from '../model/useSettingsForm';
import { SnackbarNotification } from '@/shared/ui/SnackbarNotification/SnackbarNotification';
import {
  SettingsSection,
  SettingsSectionWithPreview,
} from '@/shared/ui/SettingsSection/SettingsSection';
import { AutocompleteField } from '@/shared/ui/AutocompleteField/AutocompleteField';
import { RadioGroupField } from '@/shared/ui/RadioGroupField/RadioGroupField';
import { CheckboxField } from '@/shared/ui/CheckboxField/CheckboxField';
import { FontSizeSlider } from '@/shared/ui/FontSizeSlider/FontSizeSlider';
import { MapScaleSlider } from '@/shared/ui/MapScaleSlider/MapScaleSlider';
import { ColorPicker } from '@/shared/ui/ColorPicker/ColorPicker';
import { SaveButton } from '@/shared/ui/SaveButton/SaveButton';
import type { Point } from '@/entities/point';
import { TypeShowDel } from '@/entities/settings';

export const SettingsForm: React.FC = () => {
  const {
    isSaving,
    pointId,
    points,
    globalFontSize,
    groupTypeTime,
    typeShowDel,
    updateInterval,
    centeredMap,
    nightMap,
    isScaleMap,
    color,
    groupTypeTheme,
    fontSize,
    mapScale,
    snackbarState,
    setPointId,
    setGroupTypeTime,
    setTypeShowDel,
    setUpdateInterval,
    setCenteredMap,
    setNightMap,
    setIsScaleMap,
    setColor,
    setGroupTypeTheme,
    setFontSize,
    setMapScale,
    handleSave,
    closeSnackbar,
  } = useSettingsForm();

  const cancelOrdersOptions = [
    { value: 'full', label: 'Показывать весь день' },
    { value: 'min', label: '30 минут' },
    { value: 'max', label: '2 часа' },
  ];

  const updateIntervalOptions = [
    { value: 0, label: 'Не обновлять' },
    { value: 10, label: 'Каждые 10 секунд' },
    { value: 30, label: 'Каждые 30 секунд' },
    { value: 60, label: 'Каждые 60 секунд' },
    { value: 120, label: 'Каждые 120 секунд' },
  ];

  const mapOptions = [
    { label: 'Темная тема', value: nightMap, onChange: setNightMap },
    { label: 'Ползунок масштабирования карты', value: isScaleMap, onChange: setIsScaleMap },
  ];

  const pointOptions: Point[] = [
    { id: -1, city_id: -1, base: '', name: 'Все точки' },
    ...points.filter((p) => p.id !== -1),
  ];
  const allPointsOption = pointOptions[0] ?? null;
  const currentPoint =
    pointOptions.find((p) => String(p.id) === String(pointId ?? -1)) || allPointsOption;

  return (
    <>
      <Backdrop style={{ zIndex: 9999, color: '#fff' }} open={isSaving as boolean}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Grid container spacing={3} className="price">
        <SnackbarNotification
          state={snackbarState}
          onClose={closeSnackbar}
          fontSize={globalFontSize}
        />

        <SettingsSection marginTop={10} padding={20}>
          <div style={{ paddingBottom: 10 }}>
            <span style={{ fontSize: globalFontSize }}>Точка</span>
          </div>
          <AutocompleteField<Point>
            options={pointOptions}
            value={currentPoint}
            onChange={(newValue: Point | null) => {
              setPointId(newValue?.id ?? -1);
            }}
            placeholder="Выберите точку"
            fontSize={globalFontSize}
          />
        </SettingsSection>

        <SettingsSectionWithPreview title="Формат данных на карте" fontSize={globalFontSize}>
          <div className="location" onClick={() => setGroupTypeTime('norm')}>
            <Location fill={groupTypeTime === 'norm' ? 'red' : 'blue'} />
            <span className="span_text_white_border">21:46 (53 мин.)</span>
          </div>
          <div className="location" style={{ top: '40%' }} onClick={() => setGroupTypeTime('full')}>
            <Location fill={groupTypeTime === 'full' ? 'red' : 'blue'} />
            <span className="span_text_white_border">21:46 - 22:16 (53 мин.)</span>
          </div>
          <div className="location" style={{ top: '60%' }} onClick={() => setGroupTypeTime('min')}>
            <Location fill={groupTypeTime === 'min' ? 'red' : 'blue'} />
            <span className="span_text_white_border">53 мин.</span>
          </div>
        </SettingsSectionWithPreview>

        <SettingsSectionWithPreview title="Оформление" fontSize={globalFontSize}>
          <div
            className="location_ya"
            style={{ top: 80 }}
            onClick={() => setGroupTypeTheme('classic')}
          >
            <PlacemarkIcon fill={groupTypeTheme === 'classic' ? 'red' : 'blue'} />
            <span>Классический яндекс</span>
          </div>
          <div
            className="location"
            style={{ top: 140 }}
            onClick={() => setGroupTypeTheme('transparent')}
          >
            <Location fill={groupTypeTheme === 'transparent' ? 'red' : 'blue'} />
            <span className="span_text_transparent">21:46 (53 мин.)</span>
          </div>
          <div
            className="location"
            style={{ top: 200 }}
            onClick={() => setGroupTypeTheme('transparent_white')}
          >
            <Location fill={groupTypeTheme === 'transparent_white' ? 'red' : 'blue'} />
            <span className="span_text_transparent_white">21:46 (53 мин.)</span>
          </div>
          <div className="location" style={{ top: 260 }} onClick={() => setGroupTypeTheme('white')}>
            <Location fill={groupTypeTheme === 'white' ? 'red' : 'blue'} />
            <span className="span_text_white">21:46 (53 мин.)</span>
          </div>
          <div
            className="location"
            style={{ top: 325 }}
            onClick={() => setGroupTypeTheme('white_border')}
          >
            <Location fill={groupTypeTheme === 'white_border' ? 'red' : 'blue'} />
            <span className="span_text_white_border">21:46 (53 мин.)</span>
          </div>
          <div className="location" style={{ top: 385 }} onClick={() => setGroupTypeTheme('black')}>
            <Location fill={groupTypeTheme === 'black' ? 'red' : 'blue'} />
            <span className="span_text_black">21:46 (53 мин.)</span>
          </div>
        </SettingsSectionWithPreview>

        <SettingsSection>
          <RadioGroupField
            label="Отмененные заказы"
            value={typeShowDel}
            onChange={(val) => setTypeShowDel(val as TypeShowDel)}
            options={cancelOrdersOptions}
            fontSize={globalFontSize}
          />
        </SettingsSection>

        <SettingsSection>
          <CheckboxField
            options={[
              {
                label: 'При взятии, отмене заказа, центрировать карту',
                value: centeredMap,
                onChange: setCenteredMap,
              },
            ]}
            fontSize={globalFontSize}
          />
        </SettingsSection>

        <SettingsSection>
          <div style={{ paddingBottom: '10px' }}>
            <span style={{ fontSize: globalFontSize }}>Карта</span>
          </div>
          <CheckboxField options={mapOptions} fontSize={globalFontSize} />
        </SettingsSection>

        <FontSizeSlider value={fontSize} onChange={setFontSize} fontSize={globalFontSize} />

        <MapScaleSlider value={mapScale} onChange={setMapScale} fontSize={globalFontSize} />

        <SettingsSection>
          <RadioGroupField
            label="Частота обновления заказов"
            value={updateInterval}
            onChange={(val) => setUpdateInterval(Number(val))}
            options={updateIntervalOptions}
            fontSize={globalFontSize}
          />
        </SettingsSection>

        <ColorPicker color={color} onChange={setColor} fontSize={globalFontSize} />

        <SaveButton onClick={handleSave} isSaving={isSaving} fontSize={globalFontSize} />
      </Grid>
    </>
  );
};
