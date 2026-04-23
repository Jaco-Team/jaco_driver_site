import { useState, useEffect } from 'react';
import {
  useSettingsStore,
  type SettingsResponse,
  type ThemeType,
  type TypeDataMap,
  type TypeShowDel,
} from '@/entities/settings';
import { useHeaderStore } from '@/features/header/model/header.store';
import useSession from '@/components/sessionHook';
import { SnackbarState } from '../ui/components';

const initialSnackbarState: {
  severity: string;
  horizontal: string;
  vertical: string;
  message: string;
  open: boolean;
} = {
  open: false,
  vertical: 'top',
  horizontal: 'center',
  severity: 'success',
  message: '',
};

export const useSettingsForm = () => {
  const session = useSession();
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
  const [globalFontSize, setGlobalFontSize, setTheme, setGlobalMapScale] = useHeaderStore(
    (state) => [
      state.globalFontSize,
      state.setGlobalFontSize,
      state.setTheme,
      state.setGlobalMapScale,
    ]
  );

  const [isLoad, setIsLoad] = useState<boolean>(false);
  const [groupTypeTime, setGroupTypeTime] = useState<TypeDataMap>('norm');
  const [typeShowDel, setTypeShowDel] = useState<TypeShowDel>('min');
  const [updateInterval, setUpdateInterval] = useState<number>(30);
  const [centeredMap, setCenteredMap] = useState<boolean>(false);
  const [nightMap, setNightMap] = useState<boolean>(false);
  const [isScaleMap, setIsScaleMap] = useState<boolean>(false);
  const [color, setColor] = useState<string>('#000000');
  const [groupTypeTheme, setGroupTypeTheme] = useState<ThemeType>('white');
  const [fontSize, setFontSize] = useState<number>(10);
  const [mapScale, setMapScale] = useState<number>(1);
  const [snackbarState, setSnackbarState] = useState<SnackbarState>(initialSnackbarState);

  useEffect(() => {
    const fetchData = async () => {
      if (session?.isAuth !== true) return;

      const res = (await getMySetting(session?.token ?? '')) as SettingsResponse;
      if (res?.color && res?.color?.length > 0) {
        setColor(res.color as string);
      }
      setPointId(parseInt(String(res.point_id)));
      setCenteredMap(parseInt(String(res.action_centered_map)) === 1);
      setNightMap(parseInt(String(res.night_map)) === 1);
      setIsScaleMap(parseInt(String(res.is_scaleMap)) === 1);
      setUpdateInterval(parseInt(String(res.update_interval ?? 30)));
      setTypeShowDel((res.type_show_del as TypeShowDel) ?? 'min');
      setGroupTypeTime((res.type_data_map as TypeDataMap) ?? 'norm');
      setGroupTypeTheme((res.theme as ThemeType) ?? 'white');
      setFontSize(parseInt(String(res.fontSize ?? 16)));
      setMapScale(parseFloat(String(res.mapScale ?? 1)));
      setIsLoad(true);
    };

    if (!isLoad) {
      void fetchData();
    }
  }, [getMySetting, isLoad, session?.isAuth, session?.token]);

  const handleSave = async (): Promise<void> => {
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
      nightMap,
      isScaleMap,
      pointId
    );

    if (result?.st) {
      setGlobalFontSize(fontSize);
      setTheme(groupTypeTheme);
      setGlobalMapScale(String(mapScale));
      setSnackbarState((prev) => ({
        ...prev,
        open: true,
        severity: 'success',
        message: 'Сохранено',
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

  return {
    // Состояния
    session,
    isSaving,
    pointId,
    points,
    globalFontSize,
    groupTypeTime,
    typeShowDel,
    updateInterval,
    centeredMap,
    nightMap,
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
    setNightMap,
    setIsScaleMap,
    setColor,
    setGroupTypeTheme,
    setFontSize,
    setMapScale,

    // Действия
    handleSave,
    closeSnackbar,
  };
};
