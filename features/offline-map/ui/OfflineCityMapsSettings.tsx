import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  IconButton,
  LinearProgress,
  SvgIcon,
  Tooltip,
  Typography,
  SwipeableDrawer,
} from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

import { useOfflineMapStore } from '@/entities/offline-map/model/offlineMap.store';
import { useSettingsStore } from '@/entities/settings';
import { useOrdersStore } from '@/entities/order/model/order.store';
import { useConnectivityStore } from '@/features/offline/model/connectivity.store';
import { OFFLINE_MAP_CITIES, findOfflineMapCity } from '@/shared/config/offlineMapCities';
import { getOfflineCityPlan } from '@/shared/lib/offline/yandexOfflineMap';
import { SectionTitle } from '@/shared/ui/SectionTitle/SectionTitle';
import { SettingsSection } from '@/shared/ui/SettingsSection/SettingsSection';
import { log } from '@/components/analytics';

function formatBytes(value: number): string {
  return `${(value / 1024 / 1024).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} МБ`;
}

function RefreshCwIcon() {
  return (
    <SvgIcon
      data-testid="offline-city-refresh-icon"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      sx={{ fill: 'none' }}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </SvgIcon>
  );
}

function TrashIcon() {
  return (
    <SvgIcon
      data-testid="offline-city-trash-icon"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      sx={{ fill: 'none' }}
    >
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </SvgIcon>
  );
}

export function OfflineCityMapsSettings({ globalFontSize }: { globalFontSize: number }) {
  const state = useOfflineMapStore();
  const isOnline = useConnectivityStore((store) => store.isOnline);
  const cityId = useSettingsStore((store) => store.cityId);
  const points = useSettingsStore((store) => store.points);
  const home = useOrdersStore((store) => store.home);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [checkedAt, setCheckedAt] = useState(() => Date.now());
  const { hydrated, selectedCityId, selectCity } = state;
  const fontSize = Math.min(22, Math.max(14, globalFontSize || 16));
  const metaSize = Math.min(18, Math.max(12, fontSize - 1));
  const preferred = useMemo(() => {
    const point = points.find((item) => String(item.city_id) === cityId);
    const cityName = String(point?.name ?? '')
      .split(',')[0]
      .trim();
    return (
      OFFLINE_MAP_CITIES.find((city) => city.name === cityName) ||
      (home ? findOfflineMapCity(home.center[0], home.center[1]) : undefined)
    );
  }, [cityId, home, points]);

  useEffect(() => {
    if (hydrated && !selectedCityId && preferred) selectCity(preferred.id);
  }, [preferred, hydrated, selectedCityId, selectCity]);

  const city = OFFLINE_MAP_CITIES.find((item) => item.id === state.selectedCityId);
  const plan = useMemo(() => (city ? getOfflineCityPlan(city.id) : null), [city]);
  const job = city ? state.jobs[city.id] : undefined;
  const metadata = city ? state.maps[`city:${city.id}`] : undefined;
  const expiresAt = metadata?.expiresAt;
  useEffect(() => {
    if (!expiresAt || expiresAt <= checkedAt) return;
    // A city package lasts 29 days, beyond the browser's maximum timeout delay.
    const delay = Math.min(2_147_483_647, Math.max(0, expiresAt - Date.now()));
    const timer = window.setTimeout(() => setCheckedAt(Date.now()), delay);
    return () => window.clearTimeout(timer);
  }, [expiresAt, checkedAt]);
  const ready = Boolean(expiresAt && expiresAt > checkedAt);
  const needsUpgrade = Boolean(ready && plan && metadata && metadata.maxZoom < plan.maxZoom);
  const downloading = job?.status === 'downloading';
  const progress = job?.total ? Math.min(100, Math.floor((job.completed / job.total) * 100)) : 0;
  const deleting = Boolean(state.deletingCityId);
  const blocked = !isOnline || !state.hydrated || !city || deleting || Boolean(state.busyCityId);
  const message = job?.error || state.error;

  const startDownload = (refresh = false) => {
    if (!city) return;
    log('offline_city_download', city.name, { city: city.id, refresh });
    void state.download(city.id, refresh);
  };

  return (
    <SettingsSection>
      <Box className="offlineCitySettings" sx={{ fontSize }}>
        <SectionTitle title="Офлайн-карты" fontSize={globalFontSize} />
        <Typography component="div" sx={{ fontSize: metaSize, color: 'text.secondary' }}>
          Город
        </Typography>
        <Box
          className="offlineCitySettings__cities"
          role="radiogroup"
          aria-label="Город для офлайн-карты"
        >
          {OFFLINE_MAP_CITIES.map((item) => (
            <Button
              key={item.id}
              className="offlineCitySettings__city"
              role="radio"
              aria-checked={state.selectedCityId === item.id}
              disabled={!state.hydrated || deleting}
              onClick={() => {
                state.selectCity(item.id);
                log('offline_city_select', undefined, { city: item.id });
              }}
              data-selected={state.selectedCityId === item.id ? 'true' : 'false'}
              sx={{ fontSize }}
            >
              {item.name}
            </Button>
          ))}
        </Box>
        {plan ? (
          <Box className="offlineCitySettings__details">
            <Typography component="div" sx={{ fontSize: metaSize, color: 'text.secondary' }}>
              Карта города · примерно {formatBytes(plan.estimatedBytes)}
            </Typography>
            {ready && !job ? (
              <Box className="offlineCitySettings__ready">
                <CheckRoundedIcon />
                <Typography component="span" sx={{ fontSize }}>
                  Доступна офлайн
                </Typography>
              </Box>
            ) : null}
            {metadata ? (
              <Typography component="div" sx={{ fontSize: metaSize, color: 'text.secondary' }}>
                {ready ? 'Сохранена' : 'Нужно обновить'} ·{' '}
                {new Date(metadata.savedAt).toLocaleDateString('ru-RU')}
              </Typography>
            ) : null}
          </Box>
        ) : null}
        {job ? (
          <Box className="offlineCitySettings__progress" role="status" aria-live="polite">
            <Box className="offlineCitySettings__progressLabel">
              <Typography component="span" sx={{ fontSize: metaSize }}>
                {downloading
                  ? job.completed
                    ? 'Скачивание'
                    : 'Подготовка карты'
                  : job.status === 'error'
                    ? 'Загрузка прервана'
                    : 'На паузе'}
              </Typography>
              <Typography component="span" sx={{ fontSize: metaSize }}>
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              aria-label="Скачивание карты города"
              sx={{
                height: 5,
                borderRadius: '3px',
                backgroundColor: 'var(--app-border)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: '3px',
                  backgroundColor: 'var(--app-primary)',
                },
              }}
            />
          </Box>
        ) : null}
        {message ? (
          <Alert severity="error" sx={{ fontSize: metaSize }}>
            {message}
          </Alert>
        ) : null}
        {!isOnline ? (
          <Typography sx={{ fontSize: metaSize, color: 'text.secondary' }}>
            Для скачивания нужен интернет.
          </Typography>
        ) : null}
        {!city ? (
          <Typography sx={{ fontSize: metaSize, color: 'text.secondary' }}>
            Выберите город.
          </Typography>
        ) : null}
        {state.busyCityId && state.busyCityId !== city?.id ? (
          <Typography sx={{ fontSize: metaSize, color: 'text.secondary' }}>
            Скачивается {OFFLINE_MAP_CITIES.find((item) => item.id === state.busyCityId)?.name}.
          </Typography>
        ) : null}
        <Box className="offlineCitySettings__actions">
          {downloading ? (
            <Button
              variant="outlined"
              startIcon={<PauseRoundedIcon />}
              disabled={deleting}
              onClick={() => {
                if (city) {
                  log('offline_city_pause', city.name, { city: city.id });
                  void state.pause(city.id);
                }
              }}
              sx={{ fontSize }}
            >
              Пауза
            </Button>
          ) : (
            <Button
              variant="contained"
              disabled={blocked}
              startIcon={
                job ? <PlayArrowRoundedIcon /> : ready ? <RefreshCwIcon /> : <DownloadRoundedIcon />
              }
              onClick={() => startDownload(ready && !needsUpgrade && !job)}
              sx={{ fontSize }}
            >
              {job ? 'Продолжить' : needsUpgrade ? 'Докачать' : ready ? 'Обновить' : 'Скачать'}
            </Button>
          )}
          {(metadata || job) && !downloading ? (
            <Tooltip title="Удалить карту">
              <span>
                <IconButton
                  aria-label={`Удалить карту: ${city?.name}`}
                  disabled={deleting || Boolean(state.busyCityId)}
                  onClick={() => setConfirmDelete(true)}
                >
                  <TrashIcon />
                </IconButton>
              </span>
            </Tooltip>
          ) : null}
        </Box>
      </Box>
      <SwipeableDrawer
        anchor="bottom"
        open={confirmDelete}
        onOpen={() => setConfirmDelete(true)}
        onClose={() => {
          if (!deleting) setConfirmDelete(false);
        }}
        slotProps={{ paper: { className: 'offlineMapDeleteSheet' } }}
      >
        <Box className="offlineMapDeleteSheet__content">
          <Box className="offlineMapDeleteSheet__handleArea">
            <Box className="offlineMapDeleteSheet__handle" />
          </Box>
          <Box className="offlineMapDeleteSheet__heading">
            <Box className="offlineMapDeleteSheet__icon">
              <CancelRoundedIcon />
            </Box>
            <Typography
              className="offlineMapDeleteSheet__title"
              sx={{ fontSize: Math.min(Math.max(globalFontSize + 4, 18), 24) }}
            >
              Удалить карту?
            </Typography>
          </Box>
          <Typography
            className="offlineMapDeleteSheet__text"
            sx={{ fontSize: Math.min(Math.max(globalFontSize, 14), 18) }}
          >
            Карта «{city?.name}» будет удалена с этого устройства. Её можно скачать снова.
          </Typography>
          <Box className="offlineMapDeleteSheet__actions">
            <Button disabled={deleting} onClick={() => setConfirmDelete(false)} sx={{ fontSize }}>
              Нет
            </Button>
            <Button
              disabled={deleting}
              onClick={() => {
                if (city) {
                  log('offline_city_delete', city.name, { city: city.id });
                  void state.remove(city.id).then(() => setConfirmDelete(false));
                }
              }}
              sx={{ fontSize }}
            >
              {deleting ? 'Удаляем...' : 'Удалить'}
            </Button>
          </Box>
        </Box>
      </SwipeableDrawer>
    </SettingsSection>
  );
}
