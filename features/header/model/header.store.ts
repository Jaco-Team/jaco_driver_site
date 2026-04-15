import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { http, log } from '@/shared/api/client';
import { SettingsData } from '@/shared/types/settings';

interface HeaderState {
  isOpenMenu: boolean;
  activePageRU: string;
  phones: string | null;
  token: string;
  is_scaleMap: boolean;
  check_pos_check: boolean;
  avgTime: string | number;
  is_need_avg_time: boolean;
  is_need_page_stat: boolean;
  night_map: boolean;
  globalFontSize: number;
  theme: string;
  mapScale: string;
  point: any | null;
}

interface HeaderActions {
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
  getStat: (token: string) => Promise<void>;
}

type HeaderStore = HeaderState & HeaderActions;

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

export const useHeaderStore = createWithEqualityFn<HeaderStore>(
  (set, get) => ({
    isOpenMenu: false,
    activePageRU: '',
    phones: null,
    token: '',
    is_scaleMap: false,
    check_pos_check: false,
    avgTime: 0,
    is_need_avg_time: false,
    is_need_page_stat: false,
    night_map: false,
    globalFontSize: 16,
    theme: 'white',
    mapScale: '1',

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

    getMyAvgTime: async (token: string) => {
      const { data } = await http.get<{ text?: string | number }>('/api/v1/settings/avg-time');
      set({ avgTime: `${data?.text ?? '00:00:00'}` });
    },

    setActivePageRU: (activePageRU: string) => {
      set({ activePageRU });
    },

    getSettings: async (token: string) => {
      const { data } = await http.get<{ data: SettingsData }>('/api/v1/settings/get');
      const settings = unwrapSettingsPayload(data);
      const currentState = get();
      const hasField = (field: keyof SettingsData) =>
        settings[field] !== undefined && settings[field] !== null && settings[field] !== '';

      set({
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

    check_pos: async (func: (lat: number, lng: number) => void) => {
      await navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const { latitude, longitude } = coords;
          func(latitude, longitude);
        },
        ({ message }) => {
          // Обработка ошибки
        },
        { enableHighAccuracy: true }
      );
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
      await http.post('/api/v1/settings/save-position', {
        latitude,
        longitude,
      });
    },

    setOpenMenu: () => {
      set({ isOpenMenu: true });
    },

    setCloseMenu: () => {
      set({ isOpenMenu: false });
    },

    getStat: async (token: string) => {
      if (get().phones === null) {
        const data = { point_id: 1 };
        const json = await http.post<{ data: { phone: string } }>(
          'api/v1/settings/get_point_phones',
          data
        );
        set({ phones: json?.data?.data?.phone ?? null, token });
      }
    },
  }),
  shallow
);
