import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { http, getApiErrorInfo, log } from '@/shared/api/client';
import {
  SettingsData,
  TypeDataMap,
  TypeShowDel,
  ThemeType,
  SaveSettingsPayload,
} from '@/shared/types/settings';

interface PointsState {
  base: string;
  name: string;
  id: number;
  city_id: number;
}

interface SettingsState {
  isClick: boolean;
  settings: SettingsResponse | null;
  pointId: string | number;
  points: PointsState[];
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
  setPointId: (id: number) => void;
}

type SettingsStore = SettingsState & SettingsActions;

export interface SettingsResponse extends SettingsData {
  type_data_map?: TypeDataMap;
  type_show_del?: TypeShowDel;
  points?: PointsState[];
}

const TYPE_SHOW_DEL_TO_INT: Record<TypeShowDel, number> = {
  min: 30,
  max: 120,
  full: 1440,
};

const TYPE_SHOW_DEL_FROM_INT: Record<number, TypeShowDel> = {
  30: 'min',
  120: 'max',
  1440: 'full',
};

function normalizeModeString(value: unknown): string {
  if (value === null || value === undefined) return '';
  let normalized = `${value}`.trim();
  if (!normalized) return '';

  try {
    const parsed = JSON.parse(normalized);
    if (Array.isArray(parsed)) {
      normalized = `${parsed[0] ?? ''}`.trim();
    } else if (typeof parsed === 'string' || typeof parsed === 'number') {
      normalized = `${parsed}`.trim();
    }
  } catch {}

  while (
    normalized.length >= 2 &&
    ((normalized.startsWith('"') && normalized.endsWith('"')) ||
      (normalized.startsWith("'") && normalized.endsWith("'")))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }

  return normalized;
}

function normalizeTypeDataMapForApi(value: unknown): string {
  if (Array.isArray(value)) {
    const firstValue = normalizeModeString(value[0]);
    return firstValue || 'norm';
  }
  const normalized = normalizeModeString(value);
  return normalized || 'norm';
}

function normalizeTypeDataMapForUi(value: unknown): TypeDataMap {
  if (Array.isArray(value)) {
    return (normalizeModeString(value[0]) as TypeDataMap) || 'norm';
  }
  const normalized = normalizeModeString(value);
  return (normalized as TypeDataMap) || 'norm';
}

function normalizeTypeShowDelForApi(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  const normalized = `${value ?? ''}`.trim().toLowerCase();
  if (/^-?\d+$/.test(normalized)) {
    return parseInt(normalized, 10);
  }
  return TYPE_SHOW_DEL_TO_INT[normalized as TypeShowDel] ?? TYPE_SHOW_DEL_TO_INT.min;
}

function normalizeTypeShowDelForUi(value: unknown): TypeShowDel {
  const normalized = `${value ?? ''}`.trim().toLowerCase();

  if (normalized in TYPE_SHOW_DEL_TO_INT) {
    return normalized as TypeShowDel;
  }

  if (/^-?\d+$/.test(normalized)) {
    return TYPE_SHOW_DEL_FROM_INT[parseInt(normalized, 10)] ?? 'min';
  }

  return 'min';
}

function unwrapSettingsPayload(payload: any): SettingsData {
  if (
    payload &&
    typeof payload === 'object' &&
    payload.settings &&
    typeof payload.settings === 'object'
  ) {
    return payload.settings;
  }
  if (payload && typeof payload === 'object') {
    return payload;
  }
  return {};
}

function getFirstValidationError(errors?: Record<string, string | string[]>): string {
  if (!errors || typeof errors !== 'object') return '';
  for (const value of Object.values(errors)) {
    if (Array.isArray(value) && value.length > 0 && value[0]) {
      return `${value[0]}`;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return '';
}

function normalizeIdString(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  return `${value}`.trim();
}

export const useSettingsStore = createWithEqualityFn<SettingsStore>(
  (set, get) => ({
    isClick: false,
    settings: null,
    pointId: '',
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

      const data: SaveSettingsPayload = {
        type_data_map: normalizeTypeDataMapForApi(groupTypeTime),
        type_show_del: normalizeTypeShowDelForApi(type_show_del),
        update_interval: parseInt(String(update_interval)),
        action_centered_map: centered_map ? 1 : 0,
        night_map: night_map ? 1 : 0,
        is_scaleMap: is_scaleMap ? 1 : 0,
        color: color,
        fontSize: parseInt(String(fontSize)),
        theme,
        point_id,
        mapScale: parseFloat(String(mapScale)),
      };

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

    setPointId: (id: number) => {
      set({ pointId: parseInt(String(id)) });
    },

    getMySetting: async (token: string) => {
      const { data } = await http.get<{ data: SettingsData }>('/api/v1/settings/get');
      const settings = unwrapSettingsPayload(data);
      const normalizedSettings = {
        ...settings,
        type_data_map: normalizeTypeDataMapForUi(settings?.type_data_map),
        type_show_del: normalizeTypeShowDelForUi(settings?.type_show_del),
      };

      set({
        settings: normalizedSettings,
        pointId: data.pointId,
        points: data.points,
        cityId: normalizeIdString(settings?.city_id),
      });

      return normalizedSettings;
    },
  }),
  shallow
);
