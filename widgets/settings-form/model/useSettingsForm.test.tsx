import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSettingsForm } from './useSettingsForm';

const mocks = vi.hoisted(() => ({
  getMySetting: vi.fn(),
  saveMySetting: vi.fn(),
  setPointId: vi.fn(),
  resetRecommendation: vi.fn(),
  setGlobalFontSize: vi.fn(),
  setTheme: vi.fn(),
  setHeaderAppTheme: vi.fn(),
  applyServerAppTheme: vi.fn(),
  setPreviewAppTheme: vi.fn(),
  clearPreviewAppTheme: vi.fn(),
  setGlobalMapScale: vi.fn(),
  push: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock('@/entities/settings', () => ({
  normalizeBooleanSetting: (value: unknown) => Number(value) === 1 || value === true,
  useSettingsStore: (selector: (state: any) => unknown) =>
    selector({
      saveMySetting: mocks.saveMySetting,
      getMySetting: mocks.getMySetting,
      isClick: false,
      pointId: 7,
      points: [],
      setPointId: mocks.setPointId,
    }),
}));

vi.mock('@/features/header/model/header.store', () => ({
  useHeaderStore: (selector: (state: any) => unknown) =>
    selector({
      globalFontSize: 16,
      appTheme: 'system',
      setGlobalFontSize: mocks.setGlobalFontSize,
      setTheme: mocks.setTheme,
      setAppTheme: mocks.setHeaderAppTheme,
      applyServerAppTheme: mocks.applyServerAppTheme,
      setPreviewAppTheme: mocks.setPreviewAppTheme,
      clearPreviewAppTheme: mocks.clearPreviewAppTheme,
      setGlobalMapScale: mocks.setGlobalMapScale,
    }),
}));

vi.mock('@/features/auth/model/auth.store', () => ({
  useSession: () => ({ isAuth: true, token: 'token', user: { login: 'driver' } }),
  useAuthStore: { getState: () => ({ setAuthNotice: vi.fn() }) },
}));

vi.mock('@/features/auth/model/logoutSession', () => ({
  logoutAndClearSession: vi.fn(),
}));

vi.mock('@/features/order-recommendation/model/orderRecommendation.store', () => ({
  useOrderRecommendationStore: {
    getState: () => ({ reset: mocks.resetRecommendation }),
  },
}));

describe('useSettingsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getMySetting.mockResolvedValue({
      point_id: 7,
      action_centered_map: 0,
      app_theme: 'light',
      is_scaleMap: 1,
      map_hints: 0,
      ai_recommend: 1,
      update_interval: 30,
      type_show_del: 'min',
      type_data_map: 'norm',
      theme: 'white',
      fontSize: 16,
      mapScale: 1,
    });
    mocks.saveMySetting.mockResolvedValue({ st: true });
  });

  it('loads both courier feature flags from the shared settings response', async () => {
    const { result } = renderHook(() => useSettingsForm());

    await waitFor(() => expect(result.current.isLoad).toBe(true));

    expect(result.current.mapHints).toBe(false);
    expect(result.current.aiRecommend).toBe(true);
  });

  it('saves both feature flags together with the other settings', async () => {
    const { result } = renderHook(() => useSettingsForm());
    await waitFor(() => expect(result.current.isLoad).toBe(true));

    await act(async () => {
      result.current.setMapHints(true);
      result.current.setAiRecommend(false);
    });
    await act(async () => {
      await result.current.handleSave();
    });

    expect(mocks.saveMySetting).toHaveBeenCalledWith(
      'token',
      'norm',
      'min',
      30,
      false,
      '#000000',
      16,
      'white',
      1,
      false,
      false,
      'light',
      true,
      true,
      false
    );
    expect(mocks.resetRecommendation).toHaveBeenCalledTimes(1);
  });
});
