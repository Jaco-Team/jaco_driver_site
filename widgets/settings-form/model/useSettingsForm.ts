import { useState, useEffect, useRef } from 'react';
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

const initialSnackbarState: SnackbarState = {
  open: false,
  vertical: 'top',
  horizontal: 'center',
  severity: 'success',
  message: '',
};

function normalizeFontSize(value: unknown): number {
  const parsed = parseInt(String(value ?? ''), 10);
  return Number.isNaN(parsed) ? 16 : parsed;
}

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
  const [color, setColor] = useState<string>('#000000');
  const [groupTypeTheme, setGroupTypeTheme] = useState<ThemeType>('white');
  const [fontSize, setFontSize] = useState<number>(16);
  const [mapScale, setMapScale] = useState<number>(1);
  const [snackbarState, setSnackbarState] = useState<SnackbarState>(initialSnackbarState);
  const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
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
      setUpdateInterval(parseInt(String(res.update_interval ?? 30)));
      setTypeShowDel((res.type_show_del as TypeShowDel) ?? 'min');
      setGroupTypeTime((res.type_data_map as TypeDataMap) ?? 'norm');
      setGroupTypeTheme((res.theme as ThemeType) ?? 'white');
      setFontSize(normalizeFontSize(res.fontSize));
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

  const setAppTheme = (nextAppTheme: AppThemePreference): void => {
    hasLocalThemeChoiceRef.current = true;
    setAppThemeState(nextAppTheme);
    setPreviewAppTheme(nextAppTheme);
  };

  const handleSave = async (): Promise<void> => {
    const darkTheme = appTheme === 'dark' || (appTheme === 'system' && getDeviceDarkTheme());
    const result = await saveMySetting(
      session?.token,
      groupTypeTime,
      typeShowDel,
      updateInterval,
      centeredMap,
      color,
      fontSize,
      groupTypeTheme,
      mapScale,
      darkTheme,
      darkTheme,
      appTheme,
      isScaleMap
    );

    if (result?.st) {
      setGlobalFontSize(fontSize);
      setTheme(groupTypeTheme);
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
    pointId,
    points,
    globalFontSize,
    groupTypeTime,
    typeShowDel,
    updateInterval,
    centeredMap,
    appTheme,
    isScaleMap,
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
    setColor,
    setGroupTypeTheme,
    setFontSize,
    setMapScale,

    // Действия
    handleSave,
    closeSnackbar,
    setIsDeleteSheetOpen,
    confirmDemoAccountDeletion,
  };
};
