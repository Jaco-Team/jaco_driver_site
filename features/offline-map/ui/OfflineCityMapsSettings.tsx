import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  IconButton,
  LinearProgress,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

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
        <TextField
          select
          fullWidth
          label="Город"
          value={state.selectedCityId}
          disabled={!state.hydrated || deleting}
          onChange={(event) => {
            state.selectCity(event.target.value);
            log('offline_city_select', undefined, { city: event.target.value });
          }}
          slotProps={{ input: { sx: { fontSize } }, inputLabel: { sx: { fontSize: metaSize } } }}
        >
          {OFFLINE_MAP_CITIES.map((item) => (
            <MenuItem key={item.id} value={item.id} sx={{ fontSize }}>
              {item.name}
            </MenuItem>
          ))}
        </TextField>
        {plan ? (
          <Box className="offlineCitySettings__details">
            <Typography component="div" sx={{ fontSize: metaSize, color: 'text.secondary' }}>
              Улицы · примерно {formatBytes(plan.estimatedBytes)}
            </Typography>
            {ready && !job ? (
              <Box className="offlineCitySettings__ready">
                <CheckCircleOutlineRoundedIcon />
                <Typography component="span" sx={{ fontSize }}>
                  Доступна офлайн
                </Typography>
              </Box>
            ) : null}
            {metadata ? (
              <Typography component="div" sx={{ fontSize: metaSize, color: 'text.secondary' }}>
                {ready ? 'Сохранена' : 'Нужно обновить'} ·{' '}
                {new Date(metadata.savedAt).toLocaleDateString('ru-RU')} ·{' '}
                {formatBytes(metadata.byteSize)}
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
            />
            <Typography component="div" sx={{ fontSize: metaSize, color: 'text.secondary' }}>
              {job.completed} / {job.total} тайлов · {formatBytes(job.byteSize)}
            </Typography>
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
                job ? (
                  <PlayArrowRoundedIcon />
                ) : ready ? (
                  <RefreshRoundedIcon />
                ) : (
                  <DownloadRoundedIcon />
                )
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
                  <DeleteOutlineRoundedIcon />
                </IconButton>
              </span>
            </Tooltip>
          ) : null}
        </Box>
      </Box>
      <Dialog
        open={confirmDelete}
        onClose={() => {
          if (!deleting) setConfirmDelete(false);
        }}
      >
        <DialogTitle sx={{ fontSize: fontSize + 2 }}>Удалить карту?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize }}>
            Карта «{city?.name}» будет удалена с этого устройства. Её можно скачать снова.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={deleting} onClick={() => setConfirmDelete(false)} sx={{ fontSize }}>
            Отмена
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
        </DialogActions>
      </Dialog>
    </SettingsSection>
  );
}
