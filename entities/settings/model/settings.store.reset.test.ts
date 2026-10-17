import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSettingsStore } from './settings.store';
import { DEFAULT_DRIVER_SETTINGS } from './settingsDefaults';
import { OFFLINE_CACHE_KEY, readOfflineCache } from '@/shared/lib/offline/cache';

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  fetchDriverSettings: vi.fn(),
  token: 'token',
  online: true,
  markAppOffline: vi.fn(),
}));

vi.mock('@/shared/api/connector', () => ({
  connector: { rest: { post: mocks.post } },
  http: {},
}));
vi.mock('@/entities/settings/api/settings.api', () => ({
  fetchDriverSettings: mocks.fetchDriverSettings,
}));
vi.mock('@/shared/api/token', () => ({ getAuthToken: () => mocks.token }));
vi.mock('@/features/offline/model/connectivity.store', () => ({
  isAppOnline: () => mocks.online,
  markAppOffline: mocks.markAppOffline,
}));
vi.mock('@/components/analytics', () => ({ log: vi.fn() }));

function saveDefaults() {
  const defaults = DEFAULT_DRIVER_SETTINGS;
  return useSettingsStore
    .getState()
    .saveMySetting(
      'token',
      defaults.type_data_map,
      defaults.type_show_del,
      defaults.update_interval,
      false,
      '#123456',
      defaults.fontSize,
      defaults.theme,
      defaults.mapScale,
      false,
      false,
      defaults.app_theme,
      false,
      true,
      false
    );
}

describe('settings reset persistence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    window.localStorage.clear();
    window.localStorage.setItem('jaco_driver_selected_cafe_id', '13');
    mocks.online = true;
    mocks.token = 'token';
    mocks.post.mockResolvedValue({ settings: { ...DEFAULT_DRIVER_SETTINGS, color: '#123456' } });
    useSettingsStore.setState({
      isClick: false,
      pointId: 13,
      point_id: 13,
      points: [{ id: 13, name: 'Кафе', city_id: 1, base: 'test' }],
      cityId: '1',
      settingsSynced: true,
      settings: { fontSize: 26, color: '#123456', point_id: 13 } as any,
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('sends 30 minutes, preserves the cafe and persists the saved preset', async () => {
    expect((await saveDefaults()).st).toBe(true);
    expect(mocks.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        type_show_del: 30,
        fontSize: 16,
        theme: 'transparent',
        app_theme: 'system',
        color: '#123456',
      })
    );
    expect(useSettingsStore.getState().pointId).toBe(13);
    expect(useSettingsStore.getState().settings).toMatchObject({
      color: '#123456',
      fontSize: 16,
      point_id: 13,
      app_theme: 'system',
    });
    expect(window.localStorage.getItem('jaco_driver_selected_cafe_id')).toBe('13');
    expect(readOfflineCache()?.settings).toMatchObject({
      pointId: 13,
      cityId: '1',
      points: [{ id: 13, name: 'Кафе', city_id: 1, base: 'test' }],
      settings: { color: '#123456', fontSize: 16, point_id: 13, app_theme: 'system' },
    });
  });

  it('does not replace settings on a failed save', async () => {
    mocks.post.mockRejectedValueOnce(new Error('Network Error'));
    const previous = useSettingsStore.getState().settings;
    expect((await saveDefaults()).st).toBe(false);
    expect(useSettingsStore.getState().settings).toBe(previous);
  });

  it('still applies a pending load when saving fails', async () => {
    let finishLoad!: (value: unknown) => void;
    mocks.fetchDriverSettings.mockReturnValueOnce(
      new Promise((resolve) => {
        finishLoad = resolve;
      })
    );
    const loading = useSettingsStore.getState().getMySetting('token', true);
    mocks.post.mockRejectedValueOnce(new Error('Network Error'));
    expect((await saveDefaults()).st).toBe(false);

    finishLoad({
      settings: { fontSize: 18, point_id: 20, city_id: 2 },
      all_points: [{ id: 20, name: 'Доступное кафе', city_id: 2 }],
    });
    expect(await loading).toMatchObject({ fontSize: 18, point_id: 20 });
    expect(useSettingsStore.getState()).toMatchObject({
      pointId: 20,
      point_id: 20,
      cityId: '2',
      settingsSynced: true,
      settings: { fontSize: 18, point_id: 20 },
    });
    expect(window.localStorage.getItem('jaco_driver_selected_cafe_id')).toBeNull();
    expect(readOfflineCache()?.settings).toMatchObject({
      pointId: 20,
      settings: { fontSize: 18, point_id: 20 },
    });
    expect(mocks.markAppOffline).not.toHaveBeenCalled();
  });

  it('does not save while offline', async () => {
    mocks.online = false;
    expect((await saveDefaults()).st).toBe(false);
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('does not apply a previous account response to a new session', async () => {
    let finish!: (value: any) => void;
    mocks.post.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      })
    );
    const previous = useSettingsStore.getState().settings;
    const pending = saveDefaults();
    mocks.token = 'other-token';
    finish({ settings: DEFAULT_DRIVER_SETTINGS });
    expect((await pending).st).toBe(false);
    expect(useSettingsStore.getState().settings).toBe(previous);
  });

  it('ignores a settings load that started before the successful reset', async () => {
    let finishLoad!: (value: any) => void;
    mocks.fetchDriverSettings.mockReturnValueOnce(
      new Promise((resolve) => {
        finishLoad = resolve;
      })
    );
    const loading = useSettingsStore.getState().getMySetting('token', true);
    await saveDefaults();
    finishLoad({
      settings: { fontSize: 26, point_id: 13 },
      all_points: [{ id: 13, name: 'Кафе' }],
    });
    const loaded = await loading;
    expect(loaded.fontSize).toBe(16);
    expect(useSettingsStore.getState().settings?.fontSize).toBe(16);
  });

  it.each(['success', 'error'])(
    'keeps the saved cafe and offline snapshot after an obsolete load %s',
    async (outcome) => {
      let finishLoad!: (value: unknown) => void;
      let rejectLoad!: (error: Error) => void;
      mocks.fetchDriverSettings.mockReturnValueOnce(
        new Promise((resolve, reject) => {
          finishLoad = resolve;
          rejectLoad = reject;
        })
      );
      const loading = useSettingsStore.getState().getMySetting('token', true);
      expect((await saveDefaults()).st).toBe(true);
      const savedSettings = useSettingsStore.getState().settings;
      const savedCache = window.localStorage.getItem(OFFLINE_CACHE_KEY);

      if (outcome === 'success') {
        finishLoad({
          settings: { fontSize: 26, point_id: 20, app_theme: 'dark', color: '#ffffff' },
          all_points: [{ id: 20, name: 'Старое кафе', city_id: 2 }],
        });
      } else {
        rejectLoad(new Error('Network Error'));
      }
      expect(await loading).toBe(savedSettings);

      expect(useSettingsStore.getState()).toMatchObject({
        pointId: 13,
        point_id: 13,
        cityId: '1',
        points: [{ id: 13, name: 'Кафе', city_id: 1, base: 'test' }],
        settings: { ...DEFAULT_DRIVER_SETTINGS, color: '#123456', point_id: 13 },
      });
      expect(window.localStorage.getItem('jaco_driver_selected_cafe_id')).toBe('13');
      expect(window.localStorage.getItem(OFFLINE_CACHE_KEY)).toBe(savedCache);
      expect(mocks.markAppOffline).not.toHaveBeenCalled();
      expect(mocks.fetchDriverSettings).toHaveBeenCalledTimes(1);
      expect(mocks.post).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(300);
      expect(useSettingsStore.getState().isClick).toBe(false);
    }
  );

  it('still discards an unavailable saved cafe for a current successful load', async () => {
    mocks.fetchDriverSettings.mockResolvedValueOnce({
      settings: { fontSize: 18, point_id: 20 },
      all_points: [{ id: 20, name: 'Доступное кафе', city_id: 2 }],
    });

    await useSettingsStore.getState().getMySetting('token', true);

    expect(window.localStorage.getItem('jaco_driver_selected_cafe_id')).toBeNull();
    expect(useSettingsStore.getState().pointId).toBe(20);
    expect(useSettingsStore.getState().settings?.fontSize).toBe(18);
    expect(readOfflineCache()?.settings?.pointId).toBe(20);
  });
});
