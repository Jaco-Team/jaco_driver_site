import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { Location, PlacemarkIcon } from '@/shared/ui/Icons';

import { useSettingsForm } from '../model/useSettingsForm';
import { SnackbarNotification } from '@/shared/ui/SnackbarNotification/SnackbarNotification';
import {
  SettingsSection,
  SettingsSectionWithPreview,
} from '@/shared/ui/SettingsSection/SettingsSection';
import { SectionTitle } from '@/shared/ui/SectionTitle/SectionTitle';
import { RadioGroupField } from '@/shared/ui/RadioGroupField/RadioGroupField';
import { CheckboxField } from '@/shared/ui/CheckboxField/CheckboxField';
import { FontSizeSlider } from '@/shared/ui/FontSizeSlider/FontSizeSlider';
import { MapScaleSlider } from '@/shared/ui/MapScaleSlider/MapScaleSlider';
import { ColorPicker } from '@/shared/ui/ColorPicker/ColorPicker';
import { SaveButton } from '@/shared/ui/SaveButton/SaveButton';
import type { Point } from '@/entities/point';
import { TypeShowDel } from '@/entities/settings';
import { useOrdersStore } from '@/entities/order/model/order.store';
import { useConnectivityStore } from '@/features/offline/model/connectivity.store';
import { OfflineCityMapsSettings } from '@/features/offline-map/ui/OfflineCityMapsSettings';
import { scaleGlobalFontSize } from '@/shared/lib/fontSize';
import { resolveMarkerTheme } from '@/shared/lib/markerTheme';
import { useHeaderStore } from '@/features/header/model/header.store';
import { SETTINGS_RESET_CONFIRMATION } from '@/entities/settings/model/settingsDefaults';

export const SettingsForm: React.FC = () => {
  const isOnline = useConnectivityStore((state) => state.isOnline);
  const isDarkMap = useHeaderStore((state) => state.darkTheme);
  const [isCafeSheetOpen, setIsCafeSheetOpen] = useState(false);
  const {
    isDemoAccount,
    isDeleteSheetOpen,
    isDeletingAccount,
    isSaving,
    isResetting,
    isResetSheetOpen,
    isLoad,
    pointId,
    points,
    globalFontSize,
    groupTypeTime,
    typeShowDel,
    updateInterval,
    centeredMap,
    appTheme,
    isScaleMap,
    mapHints,
    aiRecommend,
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
    setAppTheme,
    setIsScaleMap,
    setMapHints,
    setAiRecommend,
    setColor,
    setGroupTypeTheme,
    setFontSize,
    setMapScale,
    handleSave,
    openResetSheet,
    closeResetSheet,
    confirmSettingsReset,
    closeSnackbar,
    setIsDeleteSheetOpen,
    confirmDemoAccountDeletion,
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
    { label: 'Ползунок масштабирования карты', value: isScaleMap, onChange: setIsScaleMap },
    {
      label: 'При взятии, отмене заказа, центрировать карту',
      value: centeredMap,
      onChange: setCenteredMap,
    },
    {
      label: 'Подсказки о заказах за пределами карты',
      value: mapHints,
      onChange: setMapHints,
    },
  ];

  const pointOptions = [...points]
    .filter((point) => Number(point.id) > 0)
    .sort((left, right) => {
      const cityDiff = Number(left.city_id) - Number(right.city_id);

      if (cityDiff !== 0) {
        return cityDiff;
      }

      return Number(left.id) - Number(right.id);
    });
  const currentPoint = pointOptions.find((p) => String(p.id) === String(pointId ?? '')) ?? null;
  const normalizedGlobalFontSize =
    Number.isFinite(globalFontSize) && globalFontSize > 0 ? globalFontSize : 16;
  const introTitleFontSize = scaleGlobalFontSize(20, normalizedGlobalFontSize, 18, 26);
  const introTextFontSize = scaleGlobalFontSize(16, normalizedGlobalFontSize, 14, 24);
  const dialogActionFontSize = scaleGlobalFontSize(17, normalizedGlobalFontSize, 14, 18);

  const getTokenClassName = (variant: string): string => `settingsToken settingsToken--${variant}`;
  const visibleMarkerTheme = resolveMarkerTheme(groupTypeTheme, isDarkMap);
  const selectPoint = (point: Point | null) => {
    const nextPointId = point?.id ?? null;
    if (String(nextPointId ?? '') === String(pointId ?? '')) {
      setIsCafeSheetOpen(false);
      return;
    }
    setPointId(nextPointId);
    useOrdersStore.getState().switchPoint(nextPointId);
    setIsCafeSheetOpen(false);
  };

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
            <Button
              className="settingsPage__cafeTrigger"
              onClick={() => setIsCafeSheetOpen(true)}
              aria-label="Выберите кафе"
              sx={{ fontSize: Math.min(Math.max(normalizedGlobalFontSize, 14), 22) }}
            >
              <span className="settingsPage__cafeTriggerLabel">
                {currentPoint?.name ?? 'Выберите кафе'}
              </span>
              <span className="settingsPage__cafeTriggerArrow" aria-hidden="true" />
            </Button>
          </SettingsSection>
        ) : null}

        <SettingsSection>
          <RadioGroupField
            label="Тема приложения"
            value={appTheme}
            onChange={(value) => setAppTheme(value as 'system' | 'light' | 'dark')}
            options={[
              { value: 'system', label: 'Системная' },
              { value: 'light', label: 'Светлая' },
              { value: 'dark', label: 'Тёмная' },
            ]}
            fontSize={globalFontSize}
          />
          <Typography
            className="settingsPage__themeHint"
            sx={{ fontSize: Math.min(Math.max(normalizedGlobalFontSize - 1, 12), 20) }}
          >
            Тема карты меняется вместе с темой приложения.
          </Typography>
        </SettingsSection>

        <OfflineCityMapsSettings globalFontSize={globalFontSize} />

        <SettingsSectionWithPreview
          title="Формат данных на карте"
          fontSize={globalFontSize}
          previewClassName="settingsPreviewSurface--map"
          previewHeight={170}
        >
          <button
            type="button"
            role="radio"
            aria-checked={groupTypeTime === 'norm'}
            className="settingsPreviewChoice"
            onClick={() => setGroupTypeTime('norm')}
          >
            <Location fill={groupTypeTime === 'norm' ? 'red' : 'blue'} />
            <span className={getTokenClassName('whiteBorder')}>21:46 (53 мин.)</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={groupTypeTime === 'full'}
            className="settingsPreviewChoice"
            onClick={() => setGroupTypeTime('full')}
          >
            <Location fill={groupTypeTime === 'full' ? 'red' : 'blue'} />
            <span className={getTokenClassName('whiteBorder')}>21:46 - 22:16 (53 мин.)</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={groupTypeTime === 'min'}
            className="settingsPreviewChoice"
            onClick={() => setGroupTypeTime('min')}
          >
            <Location fill={groupTypeTime === 'min' ? 'red' : 'blue'} />
            <span className={getTokenClassName('whiteBorder')}>53 мин.</span>
          </button>
        </SettingsSectionWithPreview>

        <SettingsSectionWithPreview
          title="Оформление"
          fontSize={globalFontSize}
          previewClassName="settingsPreviewSurface--markers"
        >
          <button
            type="button"
            role="radio"
            aria-checked={groupTypeTheme === 'classic'}
            className="settingsPreviewChoice settingsPreviewChoice--marker settingsPreviewChoice--classic"
            onClick={() => setGroupTypeTheme('classic')}
          >
            <PlacemarkIcon fill={groupTypeTheme === 'classic' ? 'red' : 'blue'} />
            <span className={getTokenClassName('ya')}>Классический яндекс</span>
          </button>
          {isDarkMap ? (
            <button
              type="button"
              role="radio"
              aria-checked={visibleMarkerTheme === 'transparent_white'}
              className="settingsPreviewChoice settingsPreviewChoice--marker"
              onClick={() => setGroupTypeTheme('transparent_white')}
            >
              <Location fill={visibleMarkerTheme === 'transparent_white' ? 'red' : 'blue'} />
              <span className={getTokenClassName('transparentWhite')}>21:46 (53 мин.)</span>
            </button>
          ) : (
            <button
              type="button"
              role="radio"
              aria-checked={visibleMarkerTheme === 'transparent'}
              className="settingsPreviewChoice settingsPreviewChoice--marker"
              onClick={() => setGroupTypeTheme('transparent')}
            >
              <Location fill={visibleMarkerTheme === 'transparent' ? 'red' : 'blue'} />
              <span className={getTokenClassName('transparent')}>21:46 (53 мин.)</span>
            </button>
          )}
          <button
            type="button"
            role="radio"
            aria-checked={groupTypeTheme === 'white'}
            className="settingsPreviewChoice settingsPreviewChoice--marker"
            onClick={() => setGroupTypeTheme('white')}
          >
            <Location fill={groupTypeTheme === 'white' ? 'red' : 'blue'} />
            <span className={getTokenClassName('white')}>21:46 (53 мин.)</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={groupTypeTheme === 'white_border'}
            className="settingsPreviewChoice settingsPreviewChoice--marker"
            onClick={() => setGroupTypeTheme('white_border')}
          >
            <Location fill={groupTypeTheme === 'white_border' ? 'red' : 'blue'} />
            <span className={getTokenClassName('whiteBorder')}>21:46 (53 мин.)</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={groupTypeTheme === 'black'}
            className="settingsPreviewChoice settingsPreviewChoice--marker"
            onClick={() => setGroupTypeTheme('black')}
          >
            <Location fill={groupTypeTheme === 'black' ? 'red' : 'blue'} />
            <span className={getTokenClassName('black')}>21:46 (53 мин.)</span>
          </button>
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
          <Typography
            className="settingsPage__themeHint"
            sx={{ fontSize: Math.min(Math.max(normalizedGlobalFontSize - 1, 12), 20) }}
          >
            Круги у края показывают направление и количество заказов за границами карты.
          </Typography>
        </SettingsSection>

        <SettingsSection>
          <SectionTitle title="Помощь с выбором" fontSize={globalFontSize} />
          <CheckboxField
            options={[{ label: 'ИИ-подбор заказов', value: aiRecommend, onChange: setAiRecommend }]}
            fontSize={globalFontSize}
          />
          <Typography
            className="settingsPage__themeHint"
            sx={{ fontSize: Math.min(Math.max(normalizedGlobalFontSize - 1, 12), 20) }}
          >
            Показывать кнопку «Помочь с выбором» в списке заказов и на карте.
          </Typography>
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

        <SaveButton
          onClick={handleSave}
          isSaving={isSaving}
          disabled={!isOnline || isResetting}
          fontSize={globalFontSize}
        />

        <Grid size={12}>
          <Button
            className="settingsResetButton"
            fullWidth
            variant="outlined"
            disabled={!isOnline || !isLoad || isSaving || isResetting}
            onClick={openResetSheet}
            sx={{ fontSize: scaleGlobalFontSize(17, normalizedGlobalFontSize, 15, 24) }}
            data-testid="settings-reset"
          >
            Сбросить настройки
          </Button>
        </Grid>

        {isDemoAccount ? (
          <SettingsSection
            className="settingsCard settingsCard--danger"
            sx={{
              borderRadius: '20px',
              borderColor: 'var(--app-danger-border)',
              background: 'var(--app-danger-surface)',
              boxShadow: 'none',
            }}
          >
            <SectionTitle title="Удаление аккаунта" fontSize={globalFontSize} />
            <Typography
              className="settingsPage__dangerText"
              sx={{ fontSize: normalizedGlobalFontSize }}
            >
              После удаления вы выйдете из аккаунта. Это действие нельзя отменить.
            </Typography>
            <Button
              className="settingsPage__dangerButton"
              variant="text"
              disabled={!isOnline}
              onClick={() => setIsDeleteSheetOpen(true)}
              sx={{ fontSize: Math.min(Math.max(normalizedGlobalFontSize, 14), 22) }}
            >
              Удалить аккаунт
            </Button>
          </SettingsSection>
        ) : null}
      </Grid>

      <SwipeableDrawer
        anchor="bottom"
        open={isResetSheetOpen}
        onOpen={openResetSheet}
        onClose={closeResetSheet}
        disableSwipeToOpen
        slotProps={{ paper: { className: 'settingsResetSheet' } }}
      >
        <Box
          className="settingsResetSheet__content"
          data-testid="settings-reset-sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-reset-title"
          aria-describedby="settings-reset-description"
        >
          <Box className="settingsDeleteSheet__handle" />
          <Box className="settingsResetSheet__scroll">
            <Typography
              component="h2"
              id="settings-reset-title"
              className="settingsDeleteSheet__title"
              sx={{ fontSize: scaleGlobalFontSize(22, normalizedGlobalFontSize, 20, 26) }}
            >
              Сбросить настройки?
            </Typography>
            <Typography
              id="settings-reset-description"
              className="settingsDeleteSheet__text"
              sx={{ fontSize: scaleGlobalFontSize(16, normalizedGlobalFontSize, 14, 21) }}
            >
              {SETTINGS_RESET_CONFIRMATION}
            </Typography>
          </Box>
          <Box className="settingsResetSheet__actions">
            <Button
              disabled={isResetting}
              onClick={closeResetSheet}
              sx={{ fontSize: scaleGlobalFontSize(17, normalizedGlobalFontSize, 15, 24) }}
              data-testid="settings-reset-cancel"
            >
              Отмена
            </Button>
            <Button
              disabled={!isOnline || !isLoad || isSaving || isResetting}
              onClick={() => void confirmSettingsReset()}
              aria-busy={isResetting}
              sx={{ fontSize: scaleGlobalFontSize(17, normalizedGlobalFontSize, 15, 24) }}
              data-testid="settings-reset-confirm"
            >
              {isResetting ? 'Сбрасываем...' : 'Сбросить и сохранить'}
            </Button>
          </Box>
        </Box>
      </SwipeableDrawer>

      <SwipeableDrawer
        anchor="bottom"
        open={isCafeSheetOpen}
        onOpen={() => setIsCafeSheetOpen(true)}
        onClose={() => setIsCafeSheetOpen(false)}
        slotProps={{ paper: { className: 'settingsCafeSheet' } }}
      >
        <Box className="settingsCafeSheet__content">
          <Box className="settingsCafeSheet__handle" />
          <Typography
            className="settingsCafeSheet__title"
            sx={{ fontSize: scaleGlobalFontSize(24, normalizedGlobalFontSize, 22, 26) }}
          >
            Выберите кафе
          </Typography>
          <List className="settingsCafeSheet__list" role="radiogroup" aria-label="Кафе">
            {pointOptions.map((point) => (
              <ListItemButton
                key={point.id}
                className="settingsCafeSheet__option"
                role="radio"
                aria-checked={String(point.id) === String(pointId)}
                selected={String(point.id) === String(pointId)}
                onClick={() => selectPoint(point)}
                sx={{ fontSize: scaleGlobalFontSize(18, normalizedGlobalFontSize, 16, 22) }}
              >
                {point.name}
              </ListItemButton>
            ))}
          </List>
        </Box>
      </SwipeableDrawer>

      <SwipeableDrawer
        anchor="bottom"
        open={isDeleteSheetOpen}
        onOpen={() => setIsDeleteSheetOpen(true)}
        onClose={() => {
          if (!isDeletingAccount) setIsDeleteSheetOpen(false);
        }}
        slotProps={{ paper: { className: 'settingsDeleteSheet' } }}
      >
        <Box className="settingsDeleteSheet__content">
          <Box className="settingsDeleteSheet__handle" />
          <Typography
            className="settingsDeleteSheet__title"
            sx={{ fontSize: scaleGlobalFontSize(22, normalizedGlobalFontSize, 20, 26) }}
          >
            Удалить аккаунт?
          </Typography>
          <Typography
            className="settingsDeleteSheet__text"
            sx={{ fontSize: Math.min(Math.max(normalizedGlobalFontSize, 14), 21) }}
          >
            Вы уверены? После удаления вы выйдете из аккаунта, а локальная сессия будет очищена.
          </Typography>
          <Box className="settingsDeleteSheet__actions">
            <Button
              disabled={isDeletingAccount}
              onClick={() => setIsDeleteSheetOpen(false)}
              sx={{ fontSize: dialogActionFontSize }}
            >
              Отмена
            </Button>
            <Button
              disabled={isDeletingAccount || !isOnline}
              onClick={() => void confirmDemoAccountDeletion()}
              aria-label="Удалить аккаунт"
              aria-busy={isDeletingAccount}
              sx={{ fontSize: dialogActionFontSize }}
            >
              {isDeletingAccount ? 'Удаляем...' : 'Удалить'}
            </Button>
          </Box>
        </Box>
      </SwipeableDrawer>
    </>
  );
};
