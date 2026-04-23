import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { http, getApiErrorInfo, log } from '@/shared/api/client';
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
        const response = await http.post<{ data?: SaveSettingsPayload; message?: string }>(
          '/api/v1/settings/save',
          data
        );
        log('settings_save_success', 'Успешное сохранение настроек');
        return {
          st: true,
          text: response?.data?.message || 'Сохранено',
          data: response?.data,
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
      set({ pointId: id });
    },

    getMySetting: async (token: string) => {
      const payload = (await fetchDriverSettings()) as DriverSettingsPayload;
      const settings = unwrapSettingsPayload(payload);
      const normalizedSettings = {
        ...settings,
        type_data_map: normalizeTypeDataMapForUi(settings?.type_data_map),
        type_show_del: normalizeTypeShowDelForUi(settings?.type_show_del),
      };
      set({
        settings: normalizedSettings as SettingsResponse,
        pointId: payload.pointId ?? null,
        points: Array.isArray(payload?.all_points) ? payload.all_points : [],
        cityId: normalizeIdString(settings?.city_id),
        point_id:
          settings?.point_id === null ||
          settings?.point_id === undefined ||
          normalizeIdString(settings?.point_id) === ''
            ? null
            : parseInt(normalizeIdString(settings?.point_id), 10),
      });

      return normalizedSettings as SettingsResponse;
    },
  }),
  shallow
);
