import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import {
  PointPhonesPayload,
  fetchDriverAverageTime,
  fetchDriverSettings,
  fetchPointPhones,
  saveDriverPosition,
} from '@/entities/settings/api/settings.api';
import { type SettingsData, useSettingsStore } from '@/entities/settings';

interface HeaderState {
  isOpenMenu: boolean;
  activePageRU: string;
  phones: PointPhonesPayload | null;
  token: string;
  is_scaleMap: boolean;
  check_pos_check: boolean;
  avgTime: string;
  is_need_avg_time: boolean;
  is_need_page_stat: boolean;
  night_map: boolean;
  globalFontSize: number;
  theme: string;
  mapScale: string;
  point: any | null;
  pointId: number | null;
}

interface HeaderActions {
  applySettings: (settings: SettingsData) => void;
  setGlobalFontSize: (fontSize: number) => void;
  setTheme: (theme: string) => void;
  setGlobalMapScale: (mapScale: string) => void;
  getMyFontSize: (token: string) => Promise<void>;
  getMyAvgTime: (token: string) => Promise<void>;
  setActivePageRU: (activePageRU: string) => void;
  getSettings: (token: string) => Promise<void>;
  check_pos: (func: (lat: number, lng: number) => void) => Promise<void>;
  checkMyPos: () => void;
  saveMyPos: (latitude?: number | string, longitude?: number | string) => Promise<void>;
  setOpenMenu: () => void;
  setCloseMenu: () => void;
  getStat: (token: string, pointId?: string | number | null) => Promise<void>;
}

type HeaderStore = HeaderState & HeaderActions;

let avgTimePromise: Promise<string> | null = null;
let pointPhonesPromise: Promise<PointPhonesPayload> | null = null;
let pointPhonesKey = '';

function normalizeBoolLike(value: any): boolean {
  if (value === true || value === 1 || value === '1') {
    return true;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }
  }
  return false;
}

function normalizePointId(value: SettingsData['point_id']): number | null {
  if (value === undefined || value === null || `${value}`.trim() === '') {
    return null;
  }

  const parsed = parseInt(`${value}`, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export const useHeaderStore = createWithEqualityFn<HeaderStore>(
  (set, get) => ({
    isOpenMenu: false,
    activePageRU: '',
    phones: null,
    token: '',
    is_scaleMap: false,
    check_pos_check: false,
    avgTime: '00:00:00',
    is_need_avg_time: false,
    is_need_page_stat: false,
    night_map: false,
    globalFontSize: 16,
    theme: 'white',
    mapScale: '1',
    point: null,
    pointId: null,

    applySettings: (settings) => {
      const currentState = get();
      const hasField = (field: keyof SettingsData) =>
        settings[field] !== undefined && settings[field] !== null && settings[field] !== '';
      const nextPointId = normalizePointId(settings.point_id);

      set({
        pointId: nextPointId ?? currentState.pointId,
        is_need_avg_time: hasField('driver_avg_time')
          ? normalizeBoolLike((settings as any).driver_avg_time)
          : currentState.is_need_avg_time,
        is_need_page_stat: hasField('driver_page_stat_time')
          ? normalizeBoolLike((settings as any).driver_page_stat_time)
          : currentState.is_need_page_stat,
        night_map: hasField('night_map')
          ? normalizeBoolLike(settings.night_map)
          : currentState.night_map,
        is_scaleMap: hasField('is_scaleMap')
          ? normalizeBoolLike(settings.is_scaleMap)
          : currentState.is_scaleMap,
        globalFontSize: hasField('fontSize')
          ? parseInt(String(settings.fontSize ?? 16), 10)
          : currentState.globalFontSize,
        theme: hasField('theme') ? `${settings.theme ?? 'white'}` : currentState.theme,
        mapScale: hasField('mapScale')
          ? `${parseFloat(String(settings.mapScale ?? 1))}`
          : currentState.mapScale,
      });
    },

    setGlobalFontSize: (fontSize: number) => {
      set({ globalFontSize: parseInt(String(fontSize)) });
    },

    setTheme: (theme: string) => {
      set({ theme });
    },

    setGlobalMapScale: (mapScale: string) => {
      set({ mapScale });
    },

    getMyFontSize: async (token: string) => {
      await get().getSettings(token);
    },

    getMyAvgTime: async (_token: string) => {
      if (!avgTimePromise) {
        avgTimePromise = fetchDriverAverageTime().finally(() => {
          avgTimePromise = null;
        });
      }

      const avgTime = await avgTimePromise;
      set({ avgTime });
    },

    setActivePageRU: (activePageRU: string) => {
      set({ activePageRU });
    },

    getSettings: async (_token: string) => {
      const payload = await fetchDriverSettings();
      get().applySettings(payload.settings ?? {});
    },

    check_pos: async (func: (lat: number, lng: number) => void) => {
      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            func(coords.latitude, coords.longitude);
            resolve();
          },
          () => {
            resolve();
          },
          { enableHighAccuracy: true }
        );
      });
    },

    checkMyPos: () => {
      // Нужно импортировать useOrdersStore, но пока оставим заглушку
      // if (useOrdersStore.getState().driver_need_gps === false) return;
      if (get().check_pos_check === false) {
        set({ check_pos_check: true });
      } else {
        return;
      }
      get().check_pos(get().saveMyPos);
      setTimeout(() => {
        set({ check_pos_check: false });
      }, 1000);
    },

    saveMyPos: async (latitude: number | string = '', longitude: number | string = '') => {
      await saveDriverPosition(latitude, longitude);
    },

    setOpenMenu: () => {
      set({ isOpenMenu: true });
    },

    setCloseMenu: () => {
      set({ isOpenMenu: false });
    },

    getStat: async (token: string, pointId?: string | number | null) => {
      const settingsPointId = useSettingsStore.getState().point_id;
      const resolvedPointId =
        pointId !== undefined && pointId !== null && `${pointId}`.trim() !== ''
          ? pointId
          : settingsPointId !== undefined &&
              settingsPointId !== null &&
              `${settingsPointId}`.trim() !== ''
            ? settingsPointId
            : 1;

      const nextPointPhonesKey = `${resolvedPointId}`;

      if (!pointPhonesPromise || pointPhonesKey !== nextPointPhonesKey) {
        pointPhonesKey = nextPointPhonesKey;
        pointPhonesPromise = fetchPointPhones(resolvedPointId).finally(() => {
          pointPhonesPromise = null;
          pointPhonesKey = '';
        });
      }

      const phones = await pointPhonesPromise;
      set({ phones, token });
    },
  }),
  shallow
);
