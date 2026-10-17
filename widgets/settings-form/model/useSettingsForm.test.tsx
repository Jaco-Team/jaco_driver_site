import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSettingsForm } from './useSettingsForm';

const mocks = vi.hoisted(() => ({
  getMySetting: vi.fn(),
  saveMySetting: vi.fn(),
  setPointId: vi.fn(),
  resetRecommendation: vi.fn(),
  setOrderUpdateInterval: vi.fn(),
  setGlobalFontSize: vi.fn(),
  setTheme: vi.fn(),
  setHeaderAppTheme: vi.fn(),
  applyServerAppTheme: vi.fn(),
  setPreviewAppTheme: vi.fn(),
  clearPreviewAppTheme: vi.fn(),
  setGlobalMapScale: vi.fn(),
  push: vi.fn(),
  savedColor: '#123456',
  isOnline: true,
  session: { isAuth: true, token: 'token', user: { login: 'driver' } },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock('@/entities/settings', () => {
  const getState = () => ({
    saveMySetting: mocks.saveMySetting,
    getMySetting: mocks.getMySetting,
    isClick: false,
    pointId: 7,
    points: [],
    setPointId: mocks.setPointId,
    settings: { color: mocks.savedColor },
  });
  return {
    normalizeBooleanSetting: (value: unknown) => Number(value) === 1 || value === true,
    useSettingsStore: Object.assign((selector: (state: any) => unknown) => selector(getState()), {
      getState,
    }),
  };
});

vi.mock('@/features/offline/model/connectivity.store', () => ({
  useConnectivityStore: (selector: (state: any) => unknown) =>
    selector({ isOnline: mocks.isOnline }),
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
  useSession: () => mocks.session,
  useAuthStore: { getState: () => ({ session: mocks.session, setAuthNotice: vi.fn() }) },
}));

vi.mock('@/features/auth/model/logoutSession', () => ({
  logoutAndClearSession: vi.fn(),
}));

vi.mock('@/features/order-recommendation/model/orderRecommendation.store', () => ({
  useOrderRecommendationStore: {
    getState: () => ({ reset: mocks.resetRecommendation }),
  },
}));

vi.mock('@/entities/order/model/order.store', () => ({
  useOrdersStore: { getState: () => ({ setUpdateInterval: mocks.setOrderUpdateInterval }) },
}));

describe('useSettingsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isOnline = true;
    mocks.session = { isAuth: true, token: 'token', user: { login: 'driver' } };
    mocks.savedColor = '#123456';
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

  afterEach(() => {
    vi.unstubAllGlobals();
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

  it('normalizes font size received from the API, changed locally and saved', async () => {
    mocks.getMySetting.mockResolvedValueOnce({
      point_id: 7,
      app_theme: 'light',
      fontSize: 40,
    });
    const { result } = renderHook(() => useSettingsForm());

    await waitFor(() => expect(result.current.isLoad).toBe(true));
    expect(result.current.fontSize).toBe(26);

    act(() => result.current.setFontSize(9));
    expect(result.current.fontSize).toBe(10);

    act(() => result.current.setFontSize(40));
    await act(async () => {
      await result.current.handleSave();
    });

    expect(result.current.fontSize).toBe(26);
    expect(mocks.saveMySetting.mock.calls[0]?.[6]).toBe(26);
    expect(mocks.setGlobalFontSize).toHaveBeenCalledWith(26);
  });

  const themeCases = (['transparent', 'transparent_white'] as const).flatMap((markerTheme) =>
    (['light', 'dark', 'system'] as const).flatMap((appTheme) =>
      [false, true].map((deviceDark) => ({ markerTheme, appTheme, deviceDark }))
    )
  );

  it.each(themeCases)(
    'saves $markerTheme using app=$appTheme and deviceDark=$deviceDark',
    async ({ markerTheme, appTheme, deviceDark }) => {
      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({ matches: deviceDark }))
      );
      const { result } = renderHook(() => useSettingsForm());
      await waitFor(() => expect(result.current.isLoad).toBe(true));

      act(() => {
        result.current.setGroupTypeTheme(markerTheme);
        result.current.setAppTheme(appTheme);
      });
      await act(async () => {
        await result.current.handleSave();
      });

      const dark = appTheme === 'dark' || (appTheme === 'system' && deviceDark);
      const expectedMarker = dark ? 'transparent_white' : 'transparent';
      expect(mocks.saveMySetting).toHaveBeenCalledTimes(1);
      expect(mocks.saveMySetting.mock.calls[0]?.slice(7, 12)).toEqual([
        expectedMarker,
        1,
        dark,
        dark,
        appTheme,
      ]);
      expect(result.current.groupTypeTheme).toBe(expectedMarker);
      expect(mocks.setTheme).toHaveBeenLastCalledWith(expectedMarker);
      expect(mocks.setHeaderAppTheme).toHaveBeenLastCalledWith(appTheme);
    }
  );

  it('resolves the saved transparent marker again after the device theme changes', async () => {
    let deviceDark = true;
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: deviceDark }))
    );
    const { result } = renderHook(() => useSettingsForm());
    await waitFor(() => expect(result.current.isLoad).toBe(true));
    act(() => {
      result.current.setGroupTypeTheme('transparent');
      result.current.setAppTheme('system');
    });

    await act(async () => {
      await result.current.handleSave();
    });
    expect(result.current.groupTypeTheme).toBe('transparent_white');
    deviceDark = false;
    await act(async () => {
      await result.current.handleSave();
    });

    expect(mocks.saveMySetting).toHaveBeenCalledTimes(2);
    expect(mocks.saveMySetting.mock.calls[0]?.slice(7, 12)).toEqual([
      'transparent_white',
      1,
      true,
      true,
      'system',
    ]);
    expect(mocks.saveMySetting.mock.calls[1]?.slice(7, 12)).toEqual([
      'transparent',
      1,
      false,
      false,
      'system',
    ]);
    expect(result.current.groupTypeTheme).toBe('transparent');
    expect(mocks.setTheme).toHaveBeenLastCalledWith('transparent');
  });

  it('opening and cancelling the reset confirmation does not save or change the draft', async () => {
    const { result } = renderHook(() => useSettingsForm());
    await waitFor(() => expect(result.current.isLoad).toBe(true));
    act(() => {
      result.current.setFontSize(26);
      result.current.openResetSheet();
    });
    expect(result.current.isResetSheetOpen).toBe(true);
    act(() => result.current.closeResetSheet());
    expect(result.current.fontSize).toBe(26);
    expect(mocks.saveMySetting).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    'resets to the agreed defaults using the system dark mode=%s',
    async (dark) => {
      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({ matches: dark }))
      );
      const { result } = renderHook(() => useSettingsForm());
      await waitFor(() => expect(result.current.isLoad).toBe(true));
      act(() => {
        result.current.setFontSize(26);
        result.current.setColor('#ffffff');
        result.current.setGroupTypeTheme('black');
        result.current.openResetSheet();
      });
      mocks.setPointId.mockClear();

      await act(async () => {
        await result.current.confirmSettingsReset();
      });

      expect(mocks.saveMySetting).toHaveBeenCalledWith(
        'token',
        'norm',
        'min',
        30,
        false,
        '#123456',
        16,
        dark ? 'transparent_white' : 'transparent',
        1,
        dark,
        dark,
        'system',
        false,
        true,
        false
      );
      expect(result.current.isResetSheetOpen).toBe(false);
      expect(result.current.fontSize).toBe(16);
      expect(result.current.color).toBe('#123456');
      expect(result.current.appTheme).toBe('system');
      expect(result.current.mapHints).toBe(true);
      expect(result.current.aiRecommend).toBe(false);
      expect(result.current.typeShowDel).toBe('min');
      expect(result.current.snackbarState.message).toBe('Настройки сброшены');
      expect(mocks.setPointId).not.toHaveBeenCalled();
      expect(mocks.setOrderUpdateInterval).toHaveBeenCalledWith(30);
      expect(mocks.resetRecommendation).toHaveBeenCalledTimes(1);
    }
  );

  it('keeps the draft and confirmation open when reset saving fails', async () => {
    mocks.saveMySetting.mockResolvedValueOnce({ st: false, text: 'Ошибка сервера' });
    const { result } = renderHook(() => useSettingsForm());
    await waitFor(() => expect(result.current.isLoad).toBe(true));
    act(() => {
      result.current.setFontSize(26);
      result.current.setColor('#ffffff');
      result.current.setAppTheme('dark');
      result.current.openResetSheet();
    });
    mocks.clearPreviewAppTheme.mockClear();

    await act(async () => {
      await result.current.confirmSettingsReset();
    });

    expect(result.current.fontSize).toBe(26);
    expect(result.current.color).toBe('#ffffff');
    expect(result.current.appTheme).toBe('dark');
    expect(result.current.isResetSheetOpen).toBe(true);
    expect(result.current.snackbarState.severity).toBe('error');
    expect(mocks.resetRecommendation).not.toHaveBeenCalled();
    expect(mocks.clearPreviewAppTheme).not.toHaveBeenCalled();
  });

  it('does not open or send a reset while offline', async () => {
    mocks.isOnline = false;
    const { result } = renderHook(() => useSettingsForm());
    await waitFor(() => expect(result.current.isLoad).toBe(true));
    act(() => result.current.openResetSheet());
    await act(async () => {
      await result.current.confirmSettingsReset();
    });
    expect(result.current.isResetSheetOpen).toBe(false);
    expect(mocks.saveMySetting).not.toHaveBeenCalled();
  });

  it('blocks repeat reset, closing and ordinary save until the request finishes', async () => {
    let finish!: (value: { st: boolean }) => void;
    mocks.saveMySetting.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      })
    );
    const { result } = renderHook(() => useSettingsForm());
    await waitFor(() => expect(result.current.isLoad).toBe(true));
    act(() => result.current.openResetSheet());
    let pending!: Promise<void>;
    await act(async () => {
      pending = result.current.confirmSettingsReset();
      result.current.closeResetSheet();
      await result.current.confirmSettingsReset();
      await result.current.handleSave();
    });
    expect(result.current.isResetSheetOpen).toBe(true);
    expect(mocks.saveMySetting).toHaveBeenCalledTimes(1);
    await act(async () => {
      finish({ st: true });
      await pending;
    });
  });

  it('does not apply the reset to a different session after the response', async () => {
    let finish!: (value: { st: boolean }) => void;
    mocks.saveMySetting.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      })
    );
    const { result } = renderHook(() => useSettingsForm());
    await waitFor(() => expect(result.current.isLoad).toBe(true));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.confirmSettingsReset();
    });
    mocks.session = { isAuth: true, token: 'other-token', user: { login: 'other-driver' } };
    await act(async () => {
      finish({ st: true });
      await pending;
    });
    expect(mocks.setTheme).not.toHaveBeenCalled();
    expect(mocks.resetRecommendation).not.toHaveBeenCalled();
  });
});
