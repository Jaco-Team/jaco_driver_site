import { create } from 'zustand';

import { getAuthToken } from '@/shared/api/token';
import { getOfflineMapCity } from '@/shared/config/offlineMapCities';
import {
  deleteOfflineYandexMap,
  downloadOfflineCityMap,
  getOfflineCityPlan,
  readOfflineMapRegistry,
  readPendingCityDownloads,
  setCityDownloadAutoResume,
  validateOfflineCityMaps,
  type OfflineMapDownloadProgress,
  type OfflineMapMetadata,
} from '@/shared/lib/offline/yandexOfflineMap';

const SELECTED_CITY_KEY = 'jaco_offline_selected_city';
const activeDownloads = new Map<
  string,
  {
    controller: AbortController;
    promise: Promise<void>;
    autoResume: boolean;
  }
>();

interface OfflineMapState {
  hydrated: boolean;
  selectedCityId: string;
  jobs: Record<string, OfflineMapDownloadProgress>;
  maps: Record<string, OfflineMapMetadata>;
  busyCityId: string | null;
  deletingCityId: string | null;
  error: string;
  hydrate: () => void;
  selectCity: (id: string) => void;
  applyProgress: (progress: OfflineMapDownloadProgress) => void;
  download: (id: string, refresh?: boolean) => Promise<void>;
  pause: (id: string, autoResume?: boolean) => Promise<void>;
  pauseAll: (autoResume: boolean) => void;
  resumePending: () => void;
  remove: (id: string) => Promise<void>;
}

export const useOfflineMapStore = create<OfflineMapState>((set, get) => ({
  hydrated: false,
  selectedCityId: '',
  jobs: {},
  maps: {},
  busyCityId: null,
  deletingCityId: null,
  error: '',

  hydrate: () => {
    if (typeof window === 'undefined') return;
    let selectedCityId = '';
    try {
      selectedCityId = localStorage.getItem(SELECTED_CITY_KEY) || '';
    } catch {}
    const pending = readPendingCityDownloads();
    set({
      hydrated: true,
      selectedCityId: getOfflineMapCity(selectedCityId) ? selectedCityId : '',
      maps: readOfflineMapRegistry().regions,
      jobs: Object.fromEntries(
        pending.map((item) => [
          item.cityId,
          {
            ...item,
            status: activeDownloads.has(item.cityId)
              ? 'downloading'
              : item.status === 'downloading'
                ? 'paused'
                : item.status,
          },
        ])
      ),
    });
    void validateOfflineCityMaps()
      .then(() => set({ maps: readOfflineMapRegistry().regions }))
      .catch(() => undefined);
  },

  selectCity: (id) => {
    if (!getOfflineMapCity(id)) return;
    set({ selectedCityId: id });
    try {
      localStorage.setItem(SELECTED_CITY_KEY, id);
    } catch {}
  },

  applyProgress: (progress) => {
    if (!progress.pointId.startsWith('city:')) return;
    const cityId = progress.pointId.slice(5);
    if (!getOfflineMapCity(cityId)) return;
    const jobs = { ...get().jobs };
    if (progress.status === 'ready') delete jobs[cityId];
    else jobs[cityId] = progress;
    set({
      jobs,
      ...(progress.status === 'ready' ? { maps: readOfflineMapRegistry().regions } : {}),
    });
  },

  download: async (id, refresh = false) => {
    if (get().busyCityId || get().deletingCityId || !getOfflineMapCity(id)) return;
    const controller = new AbortController();
    const plan = getOfflineCityPlan(id);
    set({
      busyCityId: id,
      error: '',
      jobs: {
        ...get().jobs,
        [id]: {
          pointId: plan.pointId,
          completed: get().jobs[id]?.completed ?? 0,
          total: plan.tileCount,
          byteSize: get().jobs[id]?.byteSize ?? 0,
          status: 'downloading',
        },
      },
    });
    const promise = Promise.resolve().then(async () => {
      try {
        const metadata = await downloadOfflineCityMap(
          id,
          getAuthToken() || '',
          controller.signal,
          refresh
        );
        const jobs = { ...get().jobs };
        delete jobs[id];
        set({ jobs, maps: { ...get().maps, [metadata.pointId]: metadata } });
      } catch (error) {
        if (controller.signal.aborted) {
          try {
            setCityDownloadAutoResume(id, activeDownloads.get(id)?.autoResume ?? false);
          } catch {
            set({ error: 'Не удалось сохранить состояние загрузки на устройстве.' });
          }
        }
        const message = controller.signal.aborted
          ? undefined
          : error instanceof Error
            ? error.message
            : 'Не удалось скачать карту.';
        set({
          jobs: {
            ...get().jobs,
            [id]: {
              ...get().jobs[id],
              pointId: plan.pointId,
              total: plan.tileCount,
              completed: get().jobs[id]?.completed ?? 0,
              byteSize: get().jobs[id]?.byteSize ?? 0,
              status: controller.signal.aborted ? 'paused' : 'error',
              error: message,
            },
          },
        });
      } finally {
        activeDownloads.delete(id);
        set({ busyCityId: null });
      }
    });
    activeDownloads.set(id, { controller, promise, autoResume: true });
    await promise;
  },

  pause: async (id, autoResume = false) => {
    const active = activeDownloads.get(id);
    if (active) active.autoResume = autoResume;
    try {
      setCityDownloadAutoResume(id, autoResume);
    } catch {
      set({ error: 'Не удалось сохранить состояние загрузки на устройстве.' });
    }
    active?.controller.abort();
    await active?.promise;
  },

  pauseAll: (autoResume) => {
    for (const id of activeDownloads.keys()) void get().pause(id, autoResume);
    if (!autoResume) {
      for (const pending of readPendingCityDownloads()) void get().pause(pending.cityId, false);
    }
  },

  resumePending: () => {
    if (get().busyCityId) return;
    const pending = readPendingCityDownloads().find(
      (item) => item.autoResume && item.status !== 'error'
    );
    if (pending) void get().download(pending.cityId);
  },

  remove: async (id) => {
    if (get().deletingCityId) return;
    set({ deletingCityId: id, error: '' });
    try {
      await get().pause(id);
      await deleteOfflineYandexMap(`city:${id}`);
      const maps = { ...get().maps };
      const jobs = { ...get().jobs };
      delete maps[`city:${id}`];
      delete jobs[id];
      set({ maps, jobs });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Не удалось удалить карту.' });
    } finally {
      set({ deletingCityId: null });
    }
  },
}));
