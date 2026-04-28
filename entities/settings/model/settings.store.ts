import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { getApiErrorInfo, log } from '@/shared/api/client';
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
  if (value === null || value === undefined || `${value}`.trim() === '') {
    return null;
  }

  const parsed = parseInt(`${value}`, 10);

  return Number.isNaN(parsed) ? null : parsed;
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
    is_scaleMap: boolean,
    point_id: number | null
  ) => Promise<{ st: boolean; text?: string; data?: any; status?: number; errors?: any }>;
  getMySetting: (token: string) => Promise<SettingsResponse>;
  setPointId: (id: number | null) => void;
}

type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = createWithEqualityFn<SettingsStore>(
  (set, get) => ({
    isClick: false,
    settings: null,
    pointId: null,
    cityId: '',
    points: [],
    point_id: null,

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
      is_scaleMap: boolean,
      point_id: number | null
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
        is_scaleMap,
        point_id,
      });

      try {
        const response = await connector.rest.post<
          { data?: SaveSettingsPayload; settings?: SettingsResponse; message?: string },
          SaveSettingsPayload
        >(apiRoutes.settings.save, data);
        log('settings_save_success', 'Успешное сохранение настроек');
        const savedSettings = response?.settings ?? response?.data;
        const savedPointId = normalizePointId(savedSettings?.point_id ?? data.point_id);
        set({
          settings: savedSettings ? (savedSettings as SettingsResponse) : get().settings,
          pointId: savedPointId,
          point_id: savedPointId,
          cityId: normalizeIdString(savedSettings?.city_id ?? get().cityId),
        });
        return {
          st: true,
          text: response?.message || 'Сохранено',
          data: savedSettings,
        };
      } catch (e) {
        const errorInfo = getApiErrorInfo(e);
        const validationMessage = getFirstValidationError(errorInfo?.data?.errors);
        const errorText = validationMessage || errorInfo.message || 'Ошибка сохранения настроек';
        log('settings_save_fail', 'Ошибка сохранения настроек');
        return {
          st: false,
          text: errorText,
          status: errorInfo.status ?? undefined,
          errors: errorInfo?.data?.errors,
          data: errorInfo?.data,
        };
      } finally {
        setTimeout(() => {
          set({ isClick: false });
        }, 300);
      }
    },

    setPointId: (id: number | null) => {
      set({ pointId: id, point_id: id });
    },

    getMySetting: async (token: string) => {
      const payload = (await fetchDriverSettings()) as DriverSettingsPayload;
      const settings = unwrapSettingsPayload(payload);
      const normalizedSettings = {
        ...settings,
        type_data_map: normalizeTypeDataMapForUi(settings?.type_data_map),
        type_show_del: normalizeTypeShowDelForUi(settings?.type_show_del),
      };
      const normalizedPointId = normalizePointId(settings?.point_id);

      set({
        settings: normalizedSettings as SettingsResponse,
        pointId: normalizedPointId,
        points: Array.isArray(payload?.all_points) ? payload.all_points : [],
        cityId: normalizeIdString(settings?.city_id),
        point_id: normalizedPointId,
      });

      return normalizedSettings as SettingsResponse;
    },
  }),
  shallow
);
