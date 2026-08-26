import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { getApiErrorInfo } from '@/shared/api/client';
import { log } from '@/components/analytics';
import { connector } from '@/shared/api/connector';
import { apiRoutes } from '@/shared/api/routes';
import { fetchDriverSettings } from '@/entities/settings/api/settings.api';
import type { Point } from '@/entities/point';
import {
  DriverSettingsPayload,
  SaveSettingsPayload,
  SettingsResponse,
} from '@/entities/settings/model/types';
import {
  normalizeTypeDataMapForUi,
  normalizeTypeShowDelForUi,
  unwrapSettingsPayload,
  getFirstValidationError,
  normalizeIdString,
  buildSaveSettingsPayload,
} from './settings.utils';

function normalizePointId(value: unknown): number | null {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  const parsed = parseInt(String(value), 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function hasCityId(value: unknown): value is { city_id?: number | string } {
  return Boolean(value && typeof value === 'object' && 'city_id' in value);
}

function hasPoint(points: Point[], pointId: number | null): boolean {
  if (pointId === null) {
    return false;
  }

  return points.some((point) => normalizePointId(point.id) === pointId);
}

interface SettingsState {
  isClick: boolean;
  settings: SettingsResponse | null;
  pointId: number | null;
  points: Point[];
  cityId: string;
  point_id: number | null;
}

interface SettingsActions {
  saveMySetting: (
    token: string | undefined,
    groupTypeTime: string,
    type_show_del: string,
    update_interval: number,
    centered_map: boolean,
    color: string,
    fontSize: number,
    theme: string,
    mapScale: number,
    night_map: boolean,
    dark_theme: boolean,
    is_scaleMap: boolean
  ) => Promise<{ st: boolean; text?: string; data?: any; status?: number; errors?: any }>;
  getMySetting: (token: string) => Promise<SettingsResponse>;
  setPointId: (id: number | null) => void;
}

type SettingsStore = SettingsState & SettingsActions;

let settingsFetchPromise: Promise<SettingsResponse> | null = null;
const SETTINGS_POINT_ID_STORAGE_KEY = 'jaco_driver_selected_cafe_id';

function sortPointsByCityThenId(points: Point[]): Point[] {
  return [...points].sort((left, right) => {
    const cityDiff = Number(left.city_id) - Number(right.city_id);

    if (cityDiff !== 0) {
      return cityDiff;
    }

    return Number(left.id) - Number(right.id);
  });
}

function normalizeSettingsPayload(payload: DriverSettingsPayload): {
  settings: SettingsResponse;
  pointId: number | null;
  points: Point[];
  cityId: string;
} {
  const settings = unwrapSettingsPayload(payload);
  const points = sortPointsByCityThenId(
    (Array.isArray(payload?.all_points) ? payload.all_points : []).filter(
      (point) => Number(point.id) > 0
    )
  );
  const storedPointId = readStoredPointId();
  const isStoredPointAvailable =
    storedPointId !== null && (points.length === 0 || hasPoint(points, storedPointId));
  const pointId = isStoredPointAvailable ? storedPointId : normalizePointId(settings?.point_id);

  if (storedPointId !== null && !isStoredPointAvailable && points.length > 0) {
    writeStoredPointId(null);
  }

  const normalizedSettings = {
    ...settings,
    point_id: pointId,
    type_data_map: normalizeTypeDataMapForUi(settings?.type_data_map),
    type_show_del: normalizeTypeShowDelForUi(settings?.type_show_del),
  } as SettingsResponse;

  return {
    settings: normalizedSettings,
    pointId,
    points,
    cityId: normalizeIdString(settings?.city_id),
  };
}

function readStoredPointId(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return normalizePointId(window.localStorage.getItem(SETTINGS_POINT_ID_STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeStoredPointId(id: number | null): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (id === null) {
      window.localStorage.removeItem(SETTINGS_POINT_ID_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(SETTINGS_POINT_ID_STORAGE_KEY, String(id));
  } catch {}
}

function mergePointIdIntoSettings(
  settings: SettingsResponse | null,
  pointId: number | null
): SettingsResponse | null {
  return settings ? ({ ...settings, point_id: pointId } as SettingsResponse) : settings;
}

const initialPointId = readStoredPointId();

export const useSettingsStore = createWithEqualityFn<SettingsStore>(
  (set, get) => ({
    isClick: false,
    settings: null,
    pointId: initialPointId,
    cityId: '',
    points: [],
    point_id: initialPointId,

    saveMySetting: async (
      token: string | undefined,
      groupTypeTime: string,
      type_show_del: string,
      update_interval: number,
      centered_map: boolean,
      color: string,
      fontSize: number,
      theme: string,
      mapScale: number,
      night_map: boolean,
      dark_theme: boolean,
      is_scaleMap: boolean
    ) => {
      if (get().isClick === false) {
        set({ isClick: true });
      } else {
        return { st: false, text: 'Подождите, выполняется сохранение.' };
      }

      const data: SaveSettingsPayload = buildSaveSettingsPayload({
        groupTypeTime,
        type_show_del,
        update_interval,
        centered_map,
        color,
        fontSize,
        theme,
        mapScale,
        night_map,
        dark_theme,
        is_scaleMap,
      });

      try {
        const response = await connector.rest.post<
          { data?: SaveSettingsPayload; settings?: SettingsResponse; message?: string },
          SaveSettingsPayload
        >(apiRoutes.settings.save, data);
        log('settings_save_success', 'Успешное сохранение настроек');
        const savedSettings = response?.settings ?? response?.data;
        const currentPointId = get().pointId;
        const nextSettings = {
          ...(get().settings ?? {}),
          ...data,
          ...(savedSettings ?? {}),
          point_id: currentPointId,
        } as SettingsResponse;
        set({
          settings: nextSettings,
          pointId: currentPointId,
          point_id: currentPointId,
          cityId: normalizeIdString(
            hasCityId(savedSettings) ? savedSettings.city_id : get().cityId
          ),
        });
        return {
          st: true,
          text: response?.message || 'Сохранено',
          data: savedSettings ?? data,
        };
      } catch (e) {
        const errorInfo = getApiErrorInfo(e);
        const errorPayload = errorInfo.data;
        const errors =
          errorPayload && typeof errorPayload === 'object' && 'errors' in errorPayload
            ? (errorPayload as { errors?: Record<string, string | string[]> }).errors
            : undefined;
        const validationMessage = getFirstValidationError(errors);
        const errorText = validationMessage || errorInfo.message || 'Ошибка сохранения настроек';
        log('settings_save_fail', 'Ошибка сохранения настроек');
        return {
          st: false,
          text: errorText,
          status: errorInfo.status ?? undefined,
          errors,
          data: errorInfo?.data,
        };
      } finally {
        setTimeout(() => {
          set({ isClick: false });
        }, 300);
      }
    },

    setPointId: (id: number | null) => {
      const nextPointId = normalizePointId(id);

      writeStoredPointId(nextPointId);
      set((state) => ({
        pointId: nextPointId,
        point_id: nextPointId,
        settings: mergePointIdIntoSettings(state.settings, nextPointId),
      }));
    },

    getMySetting: async (_token: string) => {
      const current = get();

      if (current.settings) {
        return current.settings;
      }

      if (settingsFetchPromise) {
        return settingsFetchPromise;
      }

      settingsFetchPromise = (async () => {
        const payload = (await fetchDriverSettings()) as DriverSettingsPayload;
        const normalized = normalizeSettingsPayload(payload);

        set({
          settings: normalized.settings,
          pointId: normalized.pointId,
          points: normalized.points,
          cityId: normalized.cityId,
          point_id: normalized.pointId,
        });

        return normalized.settings;
      })();

      try {
        return await settingsFetchPromise;
      } finally {
        settingsFetchPromise = null;
      }
    },
  }),
  shallow
);
