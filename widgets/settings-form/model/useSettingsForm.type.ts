import type { Dispatch, SetStateAction } from 'react';

import type { Point } from '@/entities/point';
import type { AuthSession } from '@/features/auth/model/auth.store';
import type { SnackbarState } from '@/shared/ui/SnackbarNotification/SnackbarNotification';
import type { ThemeType, TypeDataMap, TypeShowDel } from '@/entities/settings';

export interface UseSettingsFormReturn {
  session: AuthSession;
  isSaving: boolean;
  pointId: number | null;
  points: Point[];
  globalFontSize: number;
  groupTypeTime: TypeDataMap;
  typeShowDel: TypeShowDel;
  updateInterval: number;
  centeredMap: boolean;
  nightMap: boolean;
  isScaleMap: boolean;
  color: string;
  groupTypeTheme: ThemeType;
  fontSize: number;
  mapScale: number;
  snackbarState: SnackbarState;
  isLoad: boolean;
  setPointId: (id: number | null) => void;
  setGroupTypeTime: Dispatch<SetStateAction<TypeDataMap>>;
  setTypeShowDel: Dispatch<SetStateAction<TypeShowDel>>;
  setUpdateInterval: Dispatch<SetStateAction<number>>;
  setCenteredMap: Dispatch<SetStateAction<boolean>>;
  setNightMap: Dispatch<SetStateAction<boolean>>;
  setIsScaleMap: Dispatch<SetStateAction<boolean>>;
  setColor: Dispatch<SetStateAction<string>>;
  setGroupTypeTheme: Dispatch<SetStateAction<ThemeType>>;
  setFontSize: Dispatch<SetStateAction<number>>;
  setMapScale: Dispatch<SetStateAction<number>>;
  handleSave: () => Promise<void>;
  closeSnackbar: () => void;
}
