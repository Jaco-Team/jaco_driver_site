import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchDriverSettings } from '@/entities/settings/api/settings.api';
import { useHeaderStore } from './header.store';

vi.mock('@/entities/settings/api/settings.api', () => ({
  fetchDriverAverageTime: vi.fn(),
  fetchDriverSettings: vi.fn(),
  fetchPointPhones: vi.fn(),
  saveDriverPosition: vi.fn(),
}));

vi.mock('@/features/auth/model/auth.store', () => ({
  useAuthStore: {
    getState: () => ({ session: { isAuth: true } }),
  },
}));

vi.mock('@/entities/settings', () => ({
  useSettingsStore: {
    getState: () => ({ point_id: null, points: [] }),
  },
}));

vi.mock('@/shared/lib/geolocation', () => ({
  readDriverPosition: vi.fn(),
}));

vi.mock('@/features/offline/model/connectivity.store', () => ({
  isAppOnline: () => true,
  markAppOffline: vi.fn(),
}));

vi.mock('@/shared/lib/offline/cache', () => ({
  readOfflineCache: () => null,
  writeOfflineCache: vi.fn(),
}));

describe('header theme preference', () => {
  beforeEach(() => {
    useHeaderStore.setState({
      darkTheme: false,
      appTheme: 'system',
      previewAppTheme: null,
      deviceDarkTheme: false,
      darkThemeSource: 'device',
      globalFontSize: 16,
    });
  });

  it('keeps the global font size within 10–26', () => {
    useHeaderStore.getState().setGlobalFontSize(9);
    expect(useHeaderStore.getState().globalFontSize).toBe(10);

    useHeaderStore.getState().setGlobalFontSize(22);
    expect(useHeaderStore.getState().globalFontSize).toBe(22);

    useHeaderStore.getState().applySettings({ fontSize: 40 });
    expect(useHeaderStore.getState().globalFontSize).toBe(26);
  });

  it('keeps following the device when dark_theme is missing', () => {
    useHeaderStore.getState().followDeviceTheme(true);
    useHeaderStore.getState().applySettings({ theme: 'white' });

    expect(useHeaderStore.getState().darkTheme).toBe(true);
    expect(useHeaderStore.getState().darkThemeSource).toBe('device');

    useHeaderStore.getState().setDeviceDarkTheme(false);
    expect(useHeaderStore.getState().darkTheme).toBe(false);
  });

  it('uses a saved setting before the device preference', () => {
    useHeaderStore.getState().followDeviceTheme(true);
    useHeaderStore.getState().applySettings({ dark_theme: 0 });

    expect(useHeaderStore.getState().darkTheme).toBe(false);
    expect(useHeaderStore.getState().darkThemeSource).toBe('settings');

    useHeaderStore.getState().setDeviceDarkTheme(true);
    expect(useHeaderStore.getState().darkTheme).toBe(false);
  });

  it('lets server app_theme override legacy flags and follows device in system mode', () => {
    useHeaderStore.getState().setDeviceDarkTheme(true);
    useHeaderStore.getState().applySettings({ app_theme: 'light', dark_theme: 1, night_map: 1 });
    expect(useHeaderStore.getState().darkTheme).toBe(false);
    expect(useHeaderStore.getState().appTheme).toBe('light');

    useHeaderStore.getState().applySettings({ app_theme: 'system', dark_theme: 0 });
    expect(useHeaderStore.getState().darkTheme).toBe(true);
    useHeaderStore.getState().setDeviceDarkTheme(false);
    expect(useHeaderStore.getState().darkTheme).toBe(false);
  });

  it('previews a theme without changing the saved preference or losing it to a server refresh', () => {
    useHeaderStore.getState().applySettings({ app_theme: 'light' });
    useHeaderStore.getState().setPreviewAppTheme('dark');

    expect(useHeaderStore.getState()).toMatchObject({
      appTheme: 'light',
      previewAppTheme: 'dark',
      darkTheme: true,
    });

    useHeaderStore.getState().applySettings({ app_theme: 'system' });
    expect(useHeaderStore.getState()).toMatchObject({
      appTheme: 'system',
      previewAppTheme: 'dark',
      darkTheme: true,
    });

    useHeaderStore.getState().applyServerAppTheme('light');
    expect(useHeaderStore.getState()).toMatchObject({
      appTheme: 'light',
      previewAppTheme: 'dark',
      darkTheme: true,
    });

    useHeaderStore.getState().clearPreviewAppTheme();
    expect(useHeaderStore.getState()).toMatchObject({
      appTheme: 'light',
      previewAppTheme: null,
      darkTheme: false,
    });
  });

  it('commits the selected theme and follows the device during a system preview', () => {
    useHeaderStore.getState().setDeviceDarkTheme(true);
    useHeaderStore.getState().setPreviewAppTheme('system');
    expect(useHeaderStore.getState().darkTheme).toBe(true);

    useHeaderStore.getState().setDeviceDarkTheme(false);
    expect(useHeaderStore.getState().darkTheme).toBe(false);

    useHeaderStore.getState().setPreviewAppTheme('dark');
    useHeaderStore.getState().setAppTheme('dark');
    expect(useHeaderStore.getState()).toMatchObject({
      appTheme: 'dark',
      previewAppTheme: null,
      darkTheme: true,
    });
  });
});

describe('header menu flags after a cafe switch', () => {
  beforeEach(() => {
    vi.mocked(fetchDriverSettings).mockReset();
    useHeaderStore.setState({
      is_need_avg_time: true,
      is_need_page_stat: true,
      globalFontSize: 18,
      pointId: 1,
    });
  });

  it('requests settings for the selected cafe and updates only the menu flags', async () => {
    vi.mocked(fetchDriverSettings).mockResolvedValue({
      settings: { point_id: 1, driver_avg_time: 0, driver_page_stat_time: 0, fontSize: 12 },
    });

    await useHeaderStore.getState().refreshPointFlags(2);

    expect(fetchDriverSettings).toHaveBeenCalledWith(2);
    expect(useHeaderStore.getState()).toMatchObject({
      is_need_avg_time: false,
      is_need_page_stat: false,
      globalFontSize: 18,
      pointId: 1,
    });
  });

  it('keeps current flags when the response has no value for them', async () => {
    vi.mocked(fetchDriverSettings).mockResolvedValue({ settings: { point_id: 2 } });

    await useHeaderStore.getState().refreshPointFlags(2);

    expect(useHeaderStore.getState()).toMatchObject({
      is_need_avg_time: true,
      is_need_page_stat: true,
    });
  });

  it('ignores a response for a previously selected cafe', async () => {
    let resolveFirst: (value: unknown) => void = () => undefined;
    vi.mocked(fetchDriverSettings)
      .mockReturnValueOnce(new Promise((resolve) => (resolveFirst = resolve)) as never)
      .mockResolvedValueOnce({ settings: { driver_avg_time: 1, driver_page_stat_time: 1 } });

    const first = useHeaderStore.getState().refreshPointFlags(2);
    await useHeaderStore.getState().refreshPointFlags(1);
    resolveFirst({ settings: { driver_avg_time: 0, driver_page_stat_time: 0 } });
    await first;

    expect(useHeaderStore.getState()).toMatchObject({
      is_need_avg_time: true,
      is_need_page_stat: true,
    });
  });
});
