import React from 'react';
import Grid from '@mui/material/Grid';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Location, PlacemarkIcon } from '@/shared/ui/Icons';

import { useSettingsForm } from '../model/useSettingsForm';
import { SnackbarNotification } from '@/shared/ui/SnackbarNotification/SnackbarNotification';
import {
  SettingsSection,
  SettingsSectionWithPreview,
} from '@/shared/ui/SettingsSection/SettingsSection';
import { SectionTitle } from '@/shared/ui/SectionTitle/SectionTitle';
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
    {
      label: 'При взятии, отмене заказа, центрировать карту',
      value: centeredMap,
      onChange: setCenteredMap,
    },
  ];

  const pointOptions: Point[] = [
    { id: -1, city_id: -1, base: '', name: 'Все кафе' },
    ...points.filter((p) => p.id !== -1),
  ];
  const fallbackPointOption = null;
  const currentPoint =
    pointOptions.find((p) => String(p.id) === String(pointId ?? '')) || fallbackPointOption;
  const normalizedGlobalFontSize =
    Number.isFinite(globalFontSize) && globalFontSize > 0 ? globalFontSize : 16;
  const introTitleFontSize = Math.min(Math.max(normalizedGlobalFontSize + 4, 18), 32);
  const introTextFontSize = Math.min(Math.max(normalizedGlobalFontSize, 14), 24);

  const getMarkerClassName = (): string => 'settingsPreviewMarker';

  const getMarkerYaClassName = (): string => 'settingsPreviewMarkerYa';

  const getTokenClassName = (variant: string): string => `settingsToken settingsToken--${variant}`;

  return (
    <>
      <Backdrop sx={{ zIndex: 9999, color: '#fff' }} open={isSaving as boolean}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Grid container spacing={2.2} className="settingsPage">
        <SnackbarNotification
          state={snackbarState}
          onClose={closeSnackbar}
          fontSize={globalFontSize}
        />

        <Grid size={{ xs: 12 }}>
          <Box className="settingsPage__intro">
            <Typography className="settingsPage__introTitle" sx={{ fontSize: introTitleFontSize }}>
              Настройки приложения
            </Typography>
            <Typography className="settingsPage__introText" sx={{ fontSize: introTextFontSize }}>
              Настройте отображение карты и интерфейса под свой рабочий ритм.
            </Typography>
          </Box>
        </Grid>

        {pointOptions.length > 0 ? (
          <SettingsSection marginTop={0} padding={20}>
            <SectionTitle title="Кафе" fontSize={globalFontSize} />
            <AutocompleteField<Point>
              options={pointOptions}
              value={currentPoint}
              onChange={(newValue: Point | null) => {
                setPointId(newValue?.id ?? null);
              }}
              placeholder="Выберите кафе"
              fontSize={globalFontSize}
            />
          </SettingsSection>
        ) : null}

        <SettingsSectionWithPreview
          title="Формат данных на карте"
          fontSize={globalFontSize}
          previewClassName="settings_preview settings_preview--map"
          previewHeight={170}
        >
          <div
            className={getMarkerClassName()}
            onClick={() => setGroupTypeTime('norm')}
            style={{ top: '15%' }}
          >
            <Location fill={groupTypeTime === 'norm' ? 'red' : 'blue'} />
            <span className={getTokenClassName('whiteBorder')}>21:46 (53 мин.)</span>
          </div>
          <div
            className={getMarkerClassName()}
            style={{ top: '45%' }}
            onClick={() => setGroupTypeTime('full')}
          >
            <Location fill={groupTypeTime === 'full' ? 'red' : 'blue'} />
            <span className={getTokenClassName('whiteBorder')}>21:46 - 22:16 (53 мин.)</span>
          </div>
          <div
            className={getMarkerClassName()}
            style={{ top: '75%' }}
            onClick={() => setGroupTypeTime('min')}
          >
            <Location fill={groupTypeTime === 'min' ? 'red' : 'blue'} />
            <span className={getTokenClassName('whiteBorder')}>53 мин.</span>
          </div>
        </SettingsSectionWithPreview>

        <SettingsSectionWithPreview
          title="Оформление"
          fontSize={globalFontSize}
          previewClassName="settings_preview settings_preview--map-2"
        >
          <div
            className={getMarkerYaClassName()}
            style={{ top: '7%' }}
            onClick={() => setGroupTypeTheme('classic')}
          >
            <PlacemarkIcon fill={groupTypeTheme === 'classic' ? 'red' : 'blue'} />
            <span className={getTokenClassName('ya')}>Классический яндекс</span>
          </div>
          <div
            className={getMarkerClassName()}
            style={{ top: '22%' }}
            onClick={() => setGroupTypeTheme('transparent')}
          >
            <Location fill={groupTypeTheme === 'transparent' ? 'red' : 'blue'} />
            <span className={getTokenClassName('transparent')}>21:46 (53 мин.)</span>
          </div>
          <div
            className={getMarkerClassName()}
            style={{ top: '37%' }}
            onClick={() => setGroupTypeTheme('transparent_white')}
          >
            <Location fill={groupTypeTheme === 'transparent_white' ? 'red' : 'blue'} />
            <span className={getTokenClassName('transparentWhite')}>21:46 (53 мин.)</span>
          </div>
          <div
            className={getMarkerClassName()}
            style={{ top: '52%' }}
            onClick={() => setGroupTypeTheme('white')}
          >
            <Location fill={groupTypeTheme === 'white' ? 'red' : 'blue'} />
            <span className={getTokenClassName('white')}>21:46 (53 мин.)</span>
          </div>
          <div
            className={getMarkerClassName()}
            style={{ top: '67%' }}
            onClick={() => setGroupTypeTheme('white_border')}
          >
            <Location fill={groupTypeTheme === 'white_border' ? 'red' : 'blue'} />
            <span className={getTokenClassName('whiteBorder')}>21:46 (53 мин.)</span>
          </div>
          <div
            className={getMarkerClassName()}
            style={{ top: '82%' }}
            onClick={() => setGroupTypeTheme('black')}
          >
            <Location fill={groupTypeTheme === 'black' ? 'red' : 'blue'} />
            <span className={getTokenClassName('black')}>21:46 (53 мин.)</span>
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
          <SectionTitle title="Карта" fontSize={globalFontSize} />
          <CheckboxField options={mapOptions} fontSize={globalFontSize} />
        </SettingsSection>

        <SettingsSection>
          <FontSizeSlider value={fontSize} onChange={setFontSize} fontSize={globalFontSize} />
        </SettingsSection>

        <SettingsSection>
          <MapScaleSlider value={mapScale} onChange={setMapScale} fontSize={globalFontSize} />
        </SettingsSection>

        <SettingsSection>
          <RadioGroupField
            label="Частота обновления заказов"
            value={updateInterval}
            onChange={(val) => setUpdateInterval(Number(val))}
            options={updateIntervalOptions}
            fontSize={globalFontSize}
          />
        </SettingsSection>

        <SettingsSection>
          <ColorPicker color={color} onChange={setColor} fontSize={globalFontSize} />
        </SettingsSection>

        <SaveButton onClick={handleSave} isSaving={isSaving} fontSize={globalFontSize} />
      </Grid>
    </>
  );
};
