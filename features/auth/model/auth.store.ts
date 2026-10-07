import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';

import {
  confirmPasswordRecoveryCode as confirmPasswordRecoveryCodeApi,
  fetchMe,
  loginToken,
  sendPasswordRecoveryCode as requestPasswordRecoveryCodeApi,
} from '@/features/auth/api/auth.api';
import { getApiErrorInfo, getAuthErrorMessage, getAuthSecurityState } from '@/shared/api/errors';
import { clearAuthToken, getAuthToken } from '@/shared/api/token';
import { clearOfflineCache } from '@/shared/lib/offline/cache';
import { isConnectivityError } from '@/shared/lib/offline/isConnectivityError';
import { markAppOffline } from '@/features/offline/model/connectivity.store';
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
  captcha_required?: boolean;
  retry_after?: number;
}

interface AuthState {
  isSubmitting: boolean;
  isSessionRefreshing: boolean;
  loginErr: string;
  authNotice: string | null;
  session: AuthSession;
}

interface AuthActions {
  setLoginErr: (err: string) => void;
  setAuthNotice: (message: string | null) => void;
  setAuthenticated: (user: User) => void;
  setUnauthorized: () => void;
  login: (login: string, pwd: string, captchaToken?: string) => Promise<AuthResult>;
  requestPasswordRecoveryCode: (
    login: string,
    pwd: string,
    captchaToken?: string
  ) => Promise<ApiResponse>;
  confirmPasswordRecoveryCode: (login: string, code: string) => Promise<ApiResponse>;
  refreshSession: () => Promise<AuthResult>;
}

type AuthStore = AuthState & AuthActions;

const EXPLICIT_UNAUTHORIZED_STORAGE_KEY = 'jaco_driver_explicit_unauthorized';

function sessionFromUser(user: User, token?: string | null): AuthSession {
  const resolvedToken = `${token ?? user?.token ?? getAuthToken() ?? ''}`.trim();

  return {
    isAuth: true,
    token: resolvedToken,
    user: {
      ...user,
      token: resolvedToken || user?.token,
      id: user?.id ?? user?.user_id ?? undefined,
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

function initialSession(): AuthSession {
  if (readExplicitUnauthorized()) {
    return unauthorizedSession();
  }

  return { isAuth: 'load', token: '', user: null };
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
    authNotice: null,
    session: initialSession(),

    setLoginErr: (err: string) => {
      set({ loginErr: err });
    },

    setAuthNotice: (message: string | null) => {
      set({ authNotice: message });
    },

    setAuthenticated: (user: User) => {
      setExplicitUnauthorized(false);
      set({ session: sessionFromUser(user), authNotice: null });
    },

    setUnauthorized: () => {
      setExplicitUnauthorized(true);
      clearAuthToken();
      clearOfflineCache();
      set({ session: unauthorizedSession() });
    },

    login: async (login: string, pwd: string, captchaToken = '') => {
      if (get().isSubmitting) {
        return currentAuthResult(get(), false, 'Уже выполняется вход');
      }

      set({ isSubmitting: true });

      try {
        const loginResult = await loginToken(login, pwd, 'test', captchaToken);
        const me = await fetchMe();
        const authData = sessionFromUser(me, loginResult.token);
        const result = {
          st: true,
          ...authData,
          text: '',
        };

        setExplicitUnauthorized(false);
        set({
          isSubmitting: false,
          loginErr: '',
          authNotice: null,
          session: authData,
        });

        return result;
      } catch (error) {
        const errorInfo = getApiErrorInfo(error);
        const security = getAuthSecurityState(error);
        const captchaRequired = Boolean(
          (errorInfo.data as { captcha_required?: unknown } | null)?.captcha_required
        );
        const errorText = getAuthErrorMessage(error);
        const authData = unauthorizedSession();
        const result = {
          st: false,
          ...authData,
          text: errorText,
          status: errorInfo.status,
          captcha_required: captchaRequired,
          retry_after: security.retryAfter,
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

    requestPasswordRecoveryCode: async (login: string, pwd: string, captchaToken = '') => {
      if (get().isSubmitting) {
        return { st: false, text: 'Подождите' };
      }

      set({ isSubmitting: true });

      try {
        return await requestPasswordRecoveryCodeApi(login, pwd, captchaToken);
      } catch (error) {
        const errorInfo = getApiErrorInfo(error);
        const security = getAuthSecurityState(error);
        return {
          st: false,
          text: getAuthErrorMessage(error, 'Не удалось отправить код восстановления.'),
          status: errorInfo.status ?? undefined,
          data: errorInfo.data,
          ...(typeof security.captchaRequired === 'boolean'
            ? { captcha_required: security.captchaRequired }
            : {}),
          retry_after: security.retryAfter,
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
          retry_after: getAuthSecurityState(error).retryAfter,
          locked: errorInfo.status === 429,
        };
      } finally {
        set({ isSubmitting: false });
      }
    },

    refreshSession: async () => {
      if (get().session.isAuth === false || readExplicitUnauthorized() || !getAuthToken()) {
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
        const authData = sessionFromUser(me, getAuthToken());
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
        const token = `${getAuthToken() ?? ''}`.trim();

        if (isConnectivityError(error) && token) {
          markAppOffline();
          const current = get().session;
          const authData: AuthSession = {
            isAuth: true,
            token,
            user: current.user,
          };

          set({ session: authData });

          return {
            st: true,
            ...authData,
            text: 'Нет интернета',
            status,
          };
        }

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
          clearOfflineCache();
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
