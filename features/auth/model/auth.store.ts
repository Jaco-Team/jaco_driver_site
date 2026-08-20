import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';

import {
  confirmPasswordRecoveryCode as confirmPasswordRecoveryCodeApi,
  fetchMe,
  loginWeb,
  sendPasswordRecoveryCode as requestPasswordRecoveryCodeApi,
} from '@/features/auth/api/auth.api';
import { getApiErrorInfo, getAuthErrorMessage } from '@/shared/api/errors';
import { clearAuthToken } from '@/shared/api/token';
import type { ApiResponse, User } from '@/shared/api/types';

export interface AuthSession {
  isAuth: boolean | 'load';
  token: string;
  user: User | null;
}

interface AuthResult extends AuthSession {
  st: boolean | 'load';
  text?: string;
  status?: number | null;
}

interface AuthState {
  isSubmitting: boolean;
  isSessionRefreshing: boolean;
  loginErr: string;
  session: AuthSession;
}

interface AuthActions {
  setLoginErr: (err: string) => void;
  setAuthenticated: (user: User) => void;
  setUnauthorized: () => void;
  login: (login: string, pwd: string) => Promise<AuthResult>;
  requestPasswordRecoveryCode: (login: string, pwd: string) => Promise<ApiResponse>;
  confirmPasswordRecoveryCode: (login: string, code: string) => Promise<ApiResponse>;
  refreshSession: () => Promise<AuthResult>;
}

type AuthStore = AuthState & AuthActions;

const EXPLICIT_UNAUTHORIZED_STORAGE_KEY = 'jaco_driver_explicit_unauthorized';

function sessionFromUser(user: User): AuthSession {
  return {
    isAuth: true,
    token: '',
    user: {
      ...user,
      token: undefined,
      id: user?.id ?? user?.user_id,
    },
  };
}

function unauthorizedSession(): AuthSession {
  return {
    isAuth: false,
    token: '',
    user: null,
  };
}

function readExplicitUnauthorized(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(EXPLICIT_UNAUTHORIZED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function setExplicitUnauthorized(value: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (value) {
      window.localStorage.setItem(EXPLICIT_UNAUTHORIZED_STORAGE_KEY, '1');
    } else {
      window.localStorage.removeItem(EXPLICIT_UNAUTHORIZED_STORAGE_KEY);
    }
  } catch {}
}

function currentAuthResult(state: AuthStore, st: boolean | 'load', text?: string): AuthResult {
  return {
    st,
    isAuth: state.session.isAuth,
    token: state.session.token,
    user: state.session.user,
    text,
  };
}

export const useAuthStore = createWithEqualityFn<AuthStore>(
  (set, get) => ({
    isSubmitting: false,
    isSessionRefreshing: false,
    loginErr: '',
    session: readExplicitUnauthorized()
      ? unauthorizedSession()
      : { isAuth: 'load', token: '', user: null },

    setLoginErr: (err: string) => {
      set({ loginErr: err });
    },

    setAuthenticated: (user: User) => {
      setExplicitUnauthorized(false);
      set({ session: sessionFromUser(user) });
    },

    setUnauthorized: () => {
      setExplicitUnauthorized(true);
      clearAuthToken();
      set({ session: unauthorizedSession() });
    },

    login: async (login: string, pwd: string) => {
      if (get().isSubmitting) {
        return currentAuthResult(get(), false, 'Уже выполняется вход');
      }

      set({ isSubmitting: true });

      try {
        clearAuthToken();
        await loginWeb(login, pwd, true);
        const me = await fetchMe();
        const authData = sessionFromUser(me);
        const result = {
          st: true,
          ...authData,
          text: '',
        };

        setExplicitUnauthorized(false);
        set({
          isSubmitting: false,
          loginErr: '',
          session: authData,
        });

        return result;
      } catch (error) {
        const errorInfo = getApiErrorInfo(error);
        const errorText = getAuthErrorMessage(error);
        const authData = unauthorizedSession();
        const result = {
          st: false,
          ...authData,
          text: errorText,
          status: errorInfo.status,
        };

        setExplicitUnauthorized(true);
        clearAuthToken();
        set({
          isSubmitting: false,
          loginErr: errorText,
          session: authData,
        });

        return result;
      }
    },

    requestPasswordRecoveryCode: async (login: string, pwd: string) => {
      if (get().isSubmitting) {
        return { st: false, text: 'Подождите' };
      }

      set({ isSubmitting: true });

      try {
        return await requestPasswordRecoveryCodeApi(login, pwd);
      } catch (error) {
        const errorInfo = getApiErrorInfo(error);
        return {
          st: false,
          text: getAuthErrorMessage(error, 'Не удалось отправить код восстановления.'),
          status: errorInfo.status ?? undefined,
          data: errorInfo.data,
        };
      } finally {
        set({ isSubmitting: false });
      }
    },

    confirmPasswordRecoveryCode: async (login: string, code: string) => {
      if (get().isSubmitting) {
        return { st: false, text: 'Подождите' };
      }

      set({ isSubmitting: true });

      try {
        return await confirmPasswordRecoveryCodeApi(login, code);
      } catch (error) {
        const errorInfo = getApiErrorInfo(error);
        return {
          st: false,
          text: getAuthErrorMessage(error, 'Не удалось подтвердить код восстановления.'),
          status: errorInfo.status ?? undefined,
          data: errorInfo.data,
        };
      } finally {
        set({ isSubmitting: false });
      }
    },

    refreshSession: async () => {
      if (get().session.isAuth === false || readExplicitUnauthorized()) {
        const authData = unauthorizedSession();
        set({ session: authData });
        return {
          st: false,
          ...authData,
          text: 'Не авторизован',
        };
      }

      if (get().isSessionRefreshing) {
        return currentAuthResult(get(), 'load');
      }

      set({ isSessionRefreshing: true });

      try {
        const me = await fetchMe();
        const authData = sessionFromUser(me);
        const result = {
          st: true,
          ...authData,
          text: '',
        };

        setExplicitUnauthorized(false);
        set({ session: authData });

        return result;
      } catch (error) {
        const errorInfo = getApiErrorInfo(error);
        const status = errorInfo.status;
        const isUnauthorized = status === 401 || status === 403;
        const errorText = isUnauthorized
          ? 'Не авторизован'
          : getAuthErrorMessage(error, 'Не удалось проверить сессию.');
        const authData = unauthorizedSession();
        const result = {
          st: false,
          ...authData,
          text: errorText,
          status,
        };

        setExplicitUnauthorized(isUnauthorized);

        if (isUnauthorized) {
          clearAuthToken();
        }

        set({ session: authData });

        return result;
      } finally {
        set({ isSessionRefreshing: false });
      }
    },
  }),
  shallow
);

export function useSession(): AuthSession {
  return useAuthStore((state) => state.session);
}
