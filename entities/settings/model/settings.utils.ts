import {
  SettingsData,
  TypeDataMap,
  TypeShowDel,
  SaveSettingsPayload,
} from '@/entities/settings/model/types';
import { SettingsResponse } from './settings.store';

export const TYPE_SHOW_DEL_TO_INT: Record<TypeShowDel, number> = {
  min: 30,
  max: 120,
  full: 1440,
};

export const TYPE_SHOW_DEL_FROM_INT: Record<number, TypeShowDel> = {
  30: 'min',
  120: 'max',
  1440: 'full',
};

export function normalizeModeString(value: unknown): string {
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

export function normalizeTypeDataMapForApi(value: unknown): string {
  if (Array.isArray(value)) {
    const firstValue = normalizeModeString(value[0]);
    return firstValue || 'norm';
  }
  const normalized = normalizeModeString(value);
  return normalized || 'norm';
}

export function normalizeTypeDataMapForUi(value: unknown): TypeDataMap {
  if (Array.isArray(value)) {
    return (normalizeModeString(value[0]) as TypeDataMap) || 'norm';
  }
  const normalized = normalizeModeString(value);
  return (normalized as TypeDataMap) || 'norm';
}

export function normalizeTypeShowDelForApi(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  const normalized = `${value ?? ''}`.trim().toLowerCase();
  if (/^-?\d+$/.test(normalized)) {
    return parseInt(normalized, 10);
  }
  return TYPE_SHOW_DEL_TO_INT[normalized as TypeShowDel] ?? TYPE_SHOW_DEL_TO_INT.min;
}

export function normalizeTypeShowDelForUi(value: unknown): TypeShowDel {
  const normalized = `${value ?? ''}`.trim().toLowerCase();

  if (normalized in TYPE_SHOW_DEL_TO_INT) {
    return normalized as TypeShowDel;
  }

  if (/^-?\d+$/.test(normalized)) {
    return TYPE_SHOW_DEL_FROM_INT[parseInt(normalized, 10)] ?? 'min';
  }

  return 'min';
}

export function unwrapSettingsPayload(payload: unknown): SettingsData {
  if (
    payload &&
    typeof payload === 'object' &&
    'settings' in payload &&
    payload.settings &&
    typeof payload.settings === 'object'
  ) {
    return payload.settings as SettingsData;
  }
  if (payload && typeof payload === 'object') {
    return payload as SettingsData;
  }
  return {};
}

export function getFirstValidationError(errors?: Record<string, string | string[]>): string {
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

export function normalizeIdString(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return `${value}`.trim();
}

export function buildSaveSettingsPayload(params: {
  groupTypeTime: string;
  type_show_del: string;
  update_interval: number;
  centered_map: boolean;
  color: string;
  fontSize: number;
  theme: string;
  mapScale: number;
  night_map: boolean;
  is_scaleMap: boolean;
  point_id: number | string | null;
}): SaveSettingsPayload {
  return {
    type_data_map: normalizeTypeDataMapForApi(params.groupTypeTime),
    type_show_del: normalizeTypeShowDelForApi(params.type_show_del),
    update_interval: parseInt(String(params.update_interval)),
    action_centered_map: params.centered_map ? 1 : 0,
    night_map: params.night_map ? 1 : 0,
    is_scaleMap: params.is_scaleMap ? 1 : 0,
    color: params.color,
    fontSize: parseInt(String(params.fontSize)),
    theme: params.theme,
    point_id:
      params.point_id === null ||
      params.point_id === undefined ||
      `${params.point_id}`.trim() === ''
        ? null
        : parseInt(`${params.point_id}`, 10),
    mapScale: parseFloat(String(params.mapScale)),
  };
}
