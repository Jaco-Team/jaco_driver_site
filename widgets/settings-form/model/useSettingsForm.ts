import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  normalizeBooleanSetting,
  useSettingsStore,
  type SettingsResponse,
  type AppThemePreference,
  type ThemeType,
  type TypeDataMap,
  type TypeShowDel,
} from '@/entities/settings';
import { useHeaderStore } from '@/features/header/model/header.store';
import { useAuthStore, useSession } from '@/features/auth/model/auth.store';
import { logoutAndClearSession } from '@/features/auth/model/logoutSession';
import type { SnackbarState } from '@/shared/ui/SnackbarNotification/SnackbarNotification';
import type { UseSettingsFormReturn } from './useSettingsForm.type';
import { useOrderRecommendationStore } from '@/features/order-recommendation/model/orderRecommendation.store';
import { DEFAULT_GLOBAL_FONT_SIZE, normalizeGlobalFontSize } from '@/shared/lib/fontSize';
import { resolveMarkerTheme } from '@/shared/lib/markerTheme';
import { DEFAULT_DRIVER_SETTINGS } from '@/entities/settings/model/settingsDefaults';
import { useConnectivityStore } from '@/features/offline/model/connectivity.store';
import { useOrdersStore } from '@/entities/order/model/order.store';

const initialSnackbarState: SnackbarState = {
  open: false,
  vertical: 'top',
  horizontal: 'center',
  severity: 'success',
  message: '',
};

function hasSavedDarkTheme(value: unknown): boolean {
  return value !== undefined && value !== null && `${value}`.trim() !== '';
}

function getDeviceDarkTheme(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

export const useSettingsForm = (): UseSettingsFormReturn => {
  const router = useRouter();
  const session = useSession();
  const isOnline = useConnectivityStore((state) => state.isOnline);
  const isDemoAccount = session.user?.login?.trim() === '79990000001';
  const [saveMySetting, getMySetting, isSaving, pointId, points, setPointId] = useSettingsStore(
    (state) => [
      state.saveMySetting,
      state.getMySetting,
      state.isClick,
      state.pointId,
      state.points,
      state.setPointId,
    ]
  );
  const [
    globalFontSize,
    currentAppTheme,
    setGlobalFontSize,
    setTheme,
    setHeaderAppTheme,
    applyServerAppTheme,
    setPreviewAppTheme,
    clearPreviewAppTheme,
    setGlobalMapScale,
  ] = useHeaderStore((state) => [
    state.globalFontSize,
    state.appTheme,
    state.setGlobalFontSize,
    state.setTheme,
    state.setAppTheme,
    state.applyServerAppTheme,
    state.setPreviewAppTheme,
    state.clearPreviewAppTheme,
    state.setGlobalMapScale,
  ]);

  const [isLoad, setIsLoad] = useState<boolean>(false);
  const [groupTypeTime, setGroupTypeTime] = useState<TypeDataMap>('norm');
  const [typeShowDel, setTypeShowDel] = useState<TypeShowDel>('min');
  const [updateInterval, setUpdateInterval] = useState<number>(30);
  const [centeredMap, setCenteredMap] = useState<boolean>(false);
  const [appTheme, setAppThemeState] = useState<AppThemePreference>(currentAppTheme);
  const [isScaleMap, setIsScaleMap] = useState<boolean>(false);
  const [mapHints, setMapHints] = useState<boolean>(true);
  const [aiRecommend, setAiRecommend] = useState<boolean>(false);
  const [color, setColor] = useState<string>('#000000');
  const [groupTypeTheme, setGroupTypeTheme] = useState<ThemeType>('white');
  const [fontSize, setFontSizeState] = useState<number>(DEFAULT_GLOBAL_FONT_SIZE);
  const [mapScale, setMapScale] = useState<number>(1);
  const [snackbarState, setSnackbarState] = useState<SnackbarState>(initialSnackbarState);
  const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isResetSheetOpen, setIsResetSheetOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const resetInFlight = useRef(false);
  const isMounted = useRef(true);
  const hasLocalThemeChoiceRef = useRef(false);

  useEffect(() => {
    if (!hasLocalThemeChoiceRef.current) {
      setAppThemeState(currentAppTheme);
    }
  }, [currentAppTheme]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      if (session?.isAuth !== true) return;

      const res = (await getMySetting(session?.token ?? '', true)) as SettingsResponse;
      if (cancelled) return;
      if (res?.color && res?.color?.length > 0) {
        setColor(res.color as string);
      }
      setPointId(
        res.point_id === null || res.point_id === undefined || `${res.point_id}`.trim() === ''
          ? null
          : parseInt(String(res.point_id), 10)
      );
      setCenteredMap(parseInt(String(res.action_centered_map)) === 1);
      const hasDarkTheme = hasSavedDarkTheme(res.dark_theme);
      const nextAppTheme: AppThemePreference =
        res.app_theme === 'system' || res.app_theme === 'light' || res.app_theme === 'dark'
          ? res.app_theme
          : hasDarkTheme
            ? normalizeBooleanSetting(res.dark_theme)
              ? 'dark'
              : 'light'
            : 'system';
      applyServerAppTheme(nextAppTheme);
      if (!hasLocalThemeChoiceRef.current) {
        setAppThemeState(nextAppTheme);
      }
      setIsScaleMap(parseInt(String(res.is_scaleMap)) === 1);
      setMapHints(res.map_hints === undefined ? true : normalizeBooleanSetting(res.map_hints));
      setAiRecommend(normalizeBooleanSetting(res.ai_recommend));
      setUpdateInterval(parseInt(String(res.update_interval ?? 30)));
      setTypeShowDel((res.type_show_del as TypeShowDel) ?? 'min');
      setGroupTypeTime((res.type_data_map as TypeDataMap) ?? 'norm');
      setGroupTypeTheme((res.theme as ThemeType) ?? 'white');
      setFontSizeState(normalizeGlobalFontSize(res.fontSize));
      setMapScale(parseFloat(String(res.mapScale ?? 1)));
      setIsLoad(true);
    };

    if (!isLoad) {
      void fetchData();
    }
    return () => {
      cancelled = true;
    };
  }, [applyServerAppTheme, getMySetting, isLoad, session?.isAuth, session?.token, setPointId]);

  useEffect(() => () => clearPreviewAppTheme(), [clearPreviewAppTheme]);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const setAppTheme = (nextAppTheme: AppThemePreference): void => {
    hasLocalThemeChoiceRef.current = true;
    setAppThemeState(nextAppTheme);
    setPreviewAppTheme(nextAppTheme);
  };

  const setFontSize = useCallback((value: number): void => {
    setFontSizeState(normalizeGlobalFontSize(value));
  }, []);

  const handleSave = async (): Promise<void> => {
    if (resetInFlight.current || !isOnline || isSaving) return;
    const darkTheme = appTheme === 'dark' || (appTheme === 'system' && getDeviceDarkTheme());
    const markerTheme = resolveMarkerTheme(groupTypeTheme, darkTheme);
    const normalizedFontSize = normalizeGlobalFontSize(fontSize);
    const result = await saveMySetting(
      session?.token,
      groupTypeTime,
      typeShowDel,
      updateInterval,
      centeredMap,
      color,
      normalizedFontSize,
      markerTheme,
      mapScale,
      darkTheme,
      darkTheme,
      appTheme,
      isScaleMap,
      mapHints,
      aiRecommend
    );

    if (result?.st) {
      if (!aiRecommend) {
        useOrderRecommendationStore.getState().reset();
      }
      setGlobalFontSize(normalizedFontSize);
      setGroupTypeTheme(markerTheme);
      setTheme(markerTheme);
      setHeaderAppTheme(appTheme);
      hasLocalThemeChoiceRef.current = false;
      setGlobalMapScale(String(mapScale));
      setSnackbarState((prev) => ({
        ...prev,
        open: true,
        severity: 'success',
        message: 'Настройки сохранены',
      }));
      return;
    }

    setSnackbarState((prev) => ({
      ...prev,
      open: true,
      severity: 'error',
      message: result?.text || 'Не удалось сохранить настройки',
    }));
  };

  const openResetSheet = (): void => {
    if (isOnline && isLoad && !isSaving && !resetInFlight.current) setIsResetSheetOpen(true);
  };

  const closeResetSheet = (): void => {
    if (!resetInFlight.current) setIsResetSheetOpen(false);
  };

  const confirmSettingsReset = async (): Promise<void> => {
    if (!isOnline || !isLoad || isSaving || resetInFlight.current) return;

    resetInFlight.current = true;
    setIsResetting(true);
    const defaults = DEFAULT_DRIVER_SETTINGS;
    const savedColor = useSettingsStore.getState().settings?.color ?? '';
    const darkTheme = getDeviceDarkTheme();
    const markerTheme = resolveMarkerTheme(defaults.theme, darkTheme);
    const requestToken = session.token;
    const owner = session.user?.user_id ?? session.user?.id ?? session.user?.login;
    const isCurrentSession = () => {
      const current = useAuthStore.getState().session;
      const currentOwner = current.user?.user_id ?? current.user?.id ?? current.user?.login;
      return (
        isMounted.current &&
        current.isAuth === true &&
        current.token === requestToken &&
        String(currentOwner) === String(owner)
      );
    };

    try {
      const result = await saveMySetting(
        requestToken,
        defaults.type_data_map,
        defaults.type_show_del,
        defaults.update_interval,
        Boolean(defaults.action_centered_map),
        savedColor,
        defaults.fontSize,
        markerTheme,
        defaults.mapScale,
        darkTheme,
        darkTheme,
        defaults.app_theme,
        Boolean(defaults.is_scaleMap),
        Boolean(defaults.map_hints),
        Boolean(defaults.ai_recommend)
      );
      if (!isCurrentSession()) return;
      if (!result?.st) throw new Error(result?.text || 'Не удалось сбросить настройки');

      setGroupTypeTime(defaults.type_data_map);
      setTypeShowDel(defaults.type_show_del);
      setUpdateInterval(defaults.update_interval);
      setCenteredMap(false);
      setAppThemeState(defaults.app_theme);
      setIsScaleMap(false);
      setMapHints(true);
      setAiRecommend(false);
      setColor(savedColor || '#000000');
      setGroupTypeTheme(markerTheme);
      setFontSizeState(defaults.fontSize);
      setMapScale(defaults.mapScale);
      setGlobalFontSize(defaults.fontSize);
      setTheme(markerTheme);
      setHeaderAppTheme(defaults.app_theme);
      clearPreviewAppTheme();
      hasLocalThemeChoiceRef.current = false;
      setGlobalMapScale(String(defaults.mapScale));
      useOrdersStore.getState().setUpdateInterval(defaults.update_interval);
      useOrderRecommendationStore.getState().reset();
      setIsResetSheetOpen(false);
      setSnackbarState((previous) => ({
        ...previous,
        open: true,
        severity: 'success',
        message: 'Настройки сброшены',
      }));
    } catch (error) {
      if (isCurrentSession()) {
        setSnackbarState((previous) => ({
          ...previous,
          open: true,
          severity: 'error',
          message: error instanceof Error ? error.message : 'Не удалось сбросить настройки',
        }));
      }
    } finally {
      resetInFlight.current = false;
      if (isMounted.current) setIsResetting(false);
    }
  };

  const closeSnackbar = (): void => {
    setSnackbarState((prev) => ({ ...prev, open: false }));
  };

  const confirmDemoAccountDeletion = async (): Promise<void> => {
    if (!isDemoAccount || isDeletingAccount) return;

    setIsDeletingAccount(true);
    try {
      await logoutAndClearSession();
      useAuthStore.getState().setAuthNotice('Аккаунт удалён');
      setIsDeleteSheetOpen(false);
      router.push('/auth');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return {
    // Состояния
    session,
    isDemoAccount,
    isDeleteSheetOpen,
    isDeletingAccount,
    isSaving,
    isResetting,
    isResetSheetOpen,
    pointId,
    points,
    globalFontSize,
    groupTypeTime,
    typeShowDel,
    updateInterval,
    centeredMap,
    appTheme,
    isScaleMap,
    mapHints,
    aiRecommend,
    color,
    groupTypeTheme,
    fontSize,
    mapScale,
    snackbarState,
    isLoad,

    // Сеттеры
    setPointId,
    setGroupTypeTime,
    setTypeShowDel,
    setUpdateInterval,
    setCenteredMap,
    setAppTheme,
    setIsScaleMap,
    setMapHints,
    setAiRecommend,
    setColor,
    setGroupTypeTheme,
    setFontSize,
    setMapScale,

    // Действия
    handleSave,
    openResetSheet,
    closeResetSheet,
    confirmSettingsReset,
    closeSnackbar,
    setIsDeleteSheetOpen,
    confirmDemoAccountDeletion,
  };
};
