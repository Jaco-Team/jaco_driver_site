import { beforeEach, describe, expect, it, vi } from 'vitest';

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
      darkThemeSource: 'device',
    });
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
});
