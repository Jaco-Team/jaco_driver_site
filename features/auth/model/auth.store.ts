import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { useOrdersStore } from '@/entities/order/model/order.store';

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
let sessionGeneration = 0;

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

function resetOrderStatusFilter(): void {
  useOrdersStore.getState().setTypeDop([]);
  useOrdersStore.setState({ is_showModalTypeDop: false });
}

function resetStatusFilterForSession(
  previous: AuthSession,
  next: AuthSession,
  freshLogin = false
): void {
  const previousOwner = previous.user?.user_id ?? previous.user?.id ?? previous.user?.login;
  const nextOwner = next.user?.user_id ?? next.user?.id ?? next.user?.login;
  const accountChanged =
    previousOwner != null && nextOwner != null && String(previousOwner) !== String(nextOwner);

  // Initial session verification is not a new login: preserve the saved filter.
  if (freshLogin || previous.isAuth === false || accountChanged) {
    resetOrderStatusFilter();
  }
  if (accountChanged) {
    clearOfflineCache();
  }
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
      sessionGeneration += 1;
      const session = sessionFromUser(user);
      resetStatusFilterForSession(get().session, session, true);
      setExplicitUnauthorized(false);
      set({ session, authNotice: null, isSessionRefreshing: false });
    },

    setUnauthorized: () => {
      sessionGeneration += 1;
      resetOrderStatusFilter();
      setExplicitUnauthorized(true);
      clearAuthToken();
      clearOfflineCache();
      set({ session: unauthorizedSession(), isSessionRefreshing: false });
    },

    login: async (login: string, pwd: string, captchaToken = '') => {
      if (get().isSubmitting) {
        return currentAuthResult(get(), false, 'Уже выполняется вход');
      }

      sessionGeneration += 1;
      set({ isSubmitting: true, isSessionRefreshing: false });

      try {
        const loginResult = await loginToken(login, pwd, 'test', captchaToken);
        const me = await fetchMe();
        const authData = sessionFromUser(me, loginResult.token);
        sessionGeneration += 1;
        resetStatusFilterForSession(get().session, authData, true);
        const result = {
          st: true,
          ...authData,
          text: '',
        };

        setExplicitUnauthorized(false);
        set({
          isSubmitting: false,
          isSessionRefreshing: false,
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

        sessionGeneration += 1;
        setExplicitUnauthorized(true);
        clearAuthToken();
        set({
          isSubmitting: false,
          isSessionRefreshing: false,
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
      const requestToken = getAuthToken();
      if (get().session.isAuth === false || readExplicitUnauthorized() || !requestToken) {
        sessionGeneration += 1;
        const authData = unauthorizedSession();
        set({ session: authData, isSessionRefreshing: false });
        return {
          st: false,
          ...authData,
          text: 'Не авторизован',
        };
      }

      if (get().isSessionRefreshing) {
        return currentAuthResult(get(), 'load');
      }

      const requestGeneration = ++sessionGeneration;
      const isCurrentRequest = () =>
        requestGeneration === sessionGeneration &&
        getAuthToken() === requestToken &&
        !readExplicitUnauthorized();
      const currentResult = () => currentAuthResult(get(), get().session.isAuth);
      set({ isSessionRefreshing: true });

      try {
        const me = await fetchMe();
        if (!isCurrentRequest()) return currentResult();
        const authData = sessionFromUser(me, requestToken);
        resetStatusFilterForSession(get().session, authData);
        const result = {
          st: true,
          ...authData,
          text: '',
        };

        setExplicitUnauthorized(false);
        set({ session: authData });

        return result;
      } catch (error) {
        if (!isCurrentRequest()) return currentResult();
        const errorInfo = getApiErrorInfo(error);
        const status = errorInfo.status;
        const token = requestToken.trim();

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
          resetOrderStatusFilter();
          clearAuthToken();
          clearOfflineCache();
        }

        set({ session: authData });

        return result;
      } finally {
        if (requestGeneration === sessionGeneration) {
          set({ isSessionRefreshing: false });
        }
      }
    },
  }),
  shallow
);

export function useSession(): AuthSession {
  return useAuthStore((state) => state.session);
}
