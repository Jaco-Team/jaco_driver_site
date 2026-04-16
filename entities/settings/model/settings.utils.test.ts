import { describe, expect, it } from 'vitest';
import {
  TYPE_SHOW_DEL_TO_INT,
  TYPE_SHOW_DEL_FROM_INT,
  normalizeModeString,
  normalizeTypeDataMapForApi,
  normalizeTypeDataMapForUi,
  normalizeTypeShowDelForApi,
  normalizeTypeShowDelForUi,
  unwrapSettingsPayload,
  getFirstValidationError,
  normalizeIdString,
  buildSaveSettingsPayload,
} from './settings.utils';

describe('settings.utils', () => {
  describe('normalizeModeString', () => {
    it('returns empty string for null/undefined', () => {
      expect(normalizeModeString(null)).toBe('');
      expect(normalizeModeString(undefined)).toBe('');
    });

    it('handles JSON array strings', () => {
      expect(normalizeModeString('["fast","norm"]')).toBe('fast');
      expect(normalizeModeString('["slow"]')).toBe('slow');
    });

    it('handles quoted strings', () => {
      expect(normalizeModeString('"norm"')).toBe('norm');
      expect(normalizeModeString("'max'")).toBe('max');
    });

    it('handles plain strings', () => {
      expect(normalizeModeString('fast')).toBe('fast');
      expect(normalizeModeString('  norm  ')).toBe('norm');
    });
  });

  describe('normalizeTypeDataMapForApi', () => {
    it('returns "norm" for empty/undefined', () => {
      expect(normalizeTypeDataMapForApi(null)).toBe('norm');
      expect(normalizeTypeDataMapForApi(undefined)).toBe('norm');
      expect(normalizeTypeDataMapForApi('')).toBe('norm');
    });

    it('extracts first element from array', () => {
      expect(normalizeTypeDataMapForApi(['fast', 'norm'])).toBe('fast');
      expect(normalizeTypeDataMapForApi(['"slow"'])).toBe('slow');
    });

    it('passes through normal strings', () => {
      expect(normalizeTypeDataMapForApi('fast')).toBe('fast');
      expect(normalizeTypeDataMapForApi('norm')).toBe('norm');
    });
  });

  describe('normalizeTypeDataMapForUi', () => {
    it('returns "norm" as default', () => {
      expect(normalizeTypeDataMapForUi(null)).toBe('norm');
      expect(normalizeTypeDataMapForUi(undefined)).toBe('norm');
    });

    it('extracts from array', () => {
      expect(normalizeTypeDataMapForUi(['fast', 'norm'])).toBe('fast');
    });

    it('passes through valid values', () => {
      expect(normalizeTypeDataMapForUi('slow')).toBe('slow');
      expect(normalizeTypeDataMapForUi('norm')).toBe('norm');
    });
  });

  describe('normalizeTypeShowDelForApi', () => {
    it('converts string keys to numbers', () => {
      expect(normalizeTypeShowDelForApi('min')).toBe(30);
      expect(normalizeTypeShowDelForApi('max')).toBe(120);
      expect(normalizeTypeShowDelForApi('full')).toBe(1440);
    });

    it('handles numeric strings', () => {
      expect(normalizeTypeShowDelForApi('60')).toBe(60);
      expect(normalizeTypeShowDelForApi('90')).toBe(90);
    });

    it('handles actual numbers', () => {
      expect(normalizeTypeShowDelForApi(30)).toBe(30);
      expect(normalizeTypeShowDelForApi(120)).toBe(120);
    });

    it('returns default (30) for invalid input', () => {
      expect(normalizeTypeShowDelForApi(null)).toBe(30);
      expect(normalizeTypeShowDelForApi('invalid')).toBe(30);
      expect(normalizeTypeShowDelForApi(undefined)).toBe(30);
    });
  });

  describe('normalizeTypeShowDelForUi', () => {
    it('converts numbers to string keys', () => {
      expect(normalizeTypeShowDelForUi(30)).toBe('min');
      expect(normalizeTypeShowDelForUi(120)).toBe('max');
      expect(normalizeTypeShowDelForUi(1440)).toBe('full');
    });

    it('handles numeric strings', () => {
      expect(normalizeTypeShowDelForUi('30')).toBe('min');
      expect(normalizeTypeShowDelForUi('120')).toBe('max');
      expect(normalizeTypeShowDelForUi('1440')).toBe('full');
    });

    it('passes through valid string keys', () => {
      expect(normalizeTypeShowDelForUi('min')).toBe('min');
      expect(normalizeTypeShowDelForUi('max')).toBe('max');
      expect(normalizeTypeShowDelForUi('full')).toBe('full');
    });

    it('returns default "min" for invalid input', () => {
      expect(normalizeTypeShowDelForUi(null)).toBe('min');
      expect(normalizeTypeShowDelForUi('invalid')).toBe('min');
      expect(normalizeTypeShowDelForUi(999)).toBe('min');
    });
  });

  describe('unwrapSettingsPayload', () => {
    it('extracts settings from nested object', () => {
      const payload = { settings: { theme: 'dark', fontSize: 14 } };
      expect(unwrapSettingsPayload(payload)).toEqual({ theme: 'dark', fontSize: 14 });
    });

    it('returns object as-is when no settings field', () => {
      const payload = { theme: 'light', fontSize: 12 };
      expect(unwrapSettingsPayload(payload)).toEqual(payload);
    });

    it('returns empty object for invalid payload', () => {
      expect(unwrapSettingsPayload(null)).toEqual({});
      expect(unwrapSettingsPayload(undefined)).toEqual({});
      expect(unwrapSettingsPayload('string')).toEqual({});
    });
  });

  describe('getFirstValidationError', () => {
    it('returns first string error', () => {
      const errors = { email: 'Email is required', password: 'Too short' };
      expect(getFirstValidationError(errors)).toBe('Email is required');
    });

    it('returns first element from array error', () => {
      const errors = { email: ['Invalid format', 'Already taken'] };
      expect(getFirstValidationError(errors)).toBe('Invalid format');
    });

    it('returns empty string for no errors', () => {
      expect(getFirstValidationError(null)).toBe('');
      expect(getFirstValidationError(undefined)).toBe('');
      expect(getFirstValidationError({})).toBe('');
    });
  });

  describe('normalizeIdString', () => {
    it('converts numbers to strings', () => {
      expect(normalizeIdString(42)).toBe('42');
      expect(normalizeIdString(0)).toBe('0');
    });

    it('passes through strings', () => {
      expect(normalizeIdString('123')).toBe('123');
      expect(normalizeIdString('  abc  ')).toBe('abc');
    });

    it('returns empty string for null/undefined', () => {
      expect(normalizeIdString(null)).toBe('');
      expect(normalizeIdString(undefined)).toBe('');
    });
  });

  describe('buildSaveSettingsPayload', () => {
    it('builds correct payload with boolean flags', () => {
      const params = {
        groupTypeTime: 'fast',
        type_show_del: 'max',
        update_interval: 60,
        centered_map: true,
        color: '#FF0000',
        fontSize: 14,
        theme: 'dark',
        mapScale: 1.5,
        night_map: false,
        is_scaleMap: true,
        point_id: 123,
      };

      const result = buildSaveSettingsPayload(params);

      expect(result).toEqual({
        type_data_map: 'fast',
        type_show_del: 120,
        update_interval: 60,
        action_centered_map: 1,
        night_map: 0,
        is_scaleMap: 1,
        color: '#FF0000',
        fontSize: 14,
        theme: 'dark',
        point_id: 123,
        mapScale: 1.5,
      });
    });
  });
});
