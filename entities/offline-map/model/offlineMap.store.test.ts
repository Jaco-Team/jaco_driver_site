import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useOfflineMapStore } from './offlineMap.store';

const mocks = vi.hoisted(() => ({
  download: vi.fn(),
  remove: vi.fn().mockResolvedValue(undefined),
  setAutoResume: vi.fn(),
  pending: [] as Array<{ cityId: string; status: string; autoResume: boolean }>,
}));
vi.mock('@/shared/api/token', () => ({ getAuthToken: () => 'token' }));
vi.mock('@/shared/lib/offline/yandexOfflineMap', () => ({
  downloadOfflineCityMap: mocks.download,
  deleteOfflineYandexMap: mocks.remove,
  setCityDownloadAutoResume: mocks.setAutoResume,
  getOfflineCityPlan: (id: string) => ({ pointId: `city:${id}`, tileCount: 5 }),
  readOfflineMapRegistry: () => ({ regions: {} }),
  validateOfflineCityMaps: vi.fn().mockResolvedValue({}),
  readPendingCityDownloads: () => mocks.pending,
}));

describe('city download state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.pending = [];
    localStorage.clear();
    useOfflineMapStore.setState({
      jobs: {},
      maps: {},
      busyCityId: null,
      deletingCityId: null,
      selectedCityId: '',
      error: '',
    });
    mocks.download.mockResolvedValue({ pointId: 'city:samara', cityId: 'samara' });
    mocks.setAutoResume.mockReset();
  });
  afterEach(async () => {
    const id = useOfflineMapStore.getState().busyCityId;
    if (id) await useOfflineMapStore.getState().pause(id);
  });

  it('stores the map city locally without changing the cafe filter', () => {
    useOfflineMapStore.getState().selectCity('tolyatti');
    expect(localStorage.getItem('jaco_offline_selected_city')).toBe('tolyatti');
    expect(useOfflineMapStore.getState().selectedCityId).toBe('tolyatti');
  });

  it('does not start overlapping city downloads', async () => {
    let finish!: (value: unknown) => void;
    mocks.download.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    );
    const first = useOfflineMapStore.getState().download('samara');
    await Promise.resolve();
    await useOfflineMapStore.getState().download('tolyatti');
    expect(mocks.download).toHaveBeenCalledTimes(1);
    finish({ pointId: 'city:samara', cityId: 'samara' });
    await first;
    expect(useOfflineMapStore.getState().busyCityId).toBeNull();
  });

  it('honors a manual pause before the queued preparation begins', async () => {
    mocks.download.mockImplementation(async (_id: string, _token: string, signal: AbortSignal) => {
      signal.throwIfAborted();
    });
    const download = useOfflineMapStore.getState().download('samara');
    await useOfflineMapStore.getState().pause('samara');
    await download;
    expect(useOfflineMapStore.getState().jobs.samara.status).toBe('paused');
    expect(mocks.setAutoResume).toHaveBeenLastCalledWith('samara', false);
  });

  it('resumes network pauses but not explicit user pauses', async () => {
    mocks.pending = [{ cityId: 'samara', status: 'paused', autoResume: false }];
    useOfflineMapStore.getState().resumePending();
    expect(mocks.download).not.toHaveBeenCalled();
    mocks.pending[0].autoResume = true;
    useOfflineMapStore.getState().resumePending();
    await Promise.resolve();
    expect(mocks.download).toHaveBeenCalledWith('samara', 'token', expect.any(AbortSignal), false);
    await Promise.resolve();
  });

  it('still aborts a download if writing the pause preference fails', async () => {
    mocks.setAutoResume.mockImplementation(() => {
      throw new Error('storage full');
    });
    mocks.download.mockImplementation(async (_id: string, _token: string, signal: AbortSignal) => {
      signal.throwIfAborted();
    });
    const download = useOfflineMapStore.getState().download('samara');
    await useOfflineMapStore.getState().pause('samara');
    await download;
    expect(useOfflineMapStore.getState().busyCityId).toBeNull();
    expect(useOfflineMapStore.getState().jobs.samara.status).toBe('paused');
    expect(useOfflineMapStore.getState().error).toContain('сохранить состояние');
  });
});
