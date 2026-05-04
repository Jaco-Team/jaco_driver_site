import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';

import {
  confirmPasswordRecoveryCode as confirmPasswordRecoveryCodeApi,
  fetchMe,
  loginWeb,
  sendPasswordRecoveryCode as requestPasswordRecoveryCodeApi,
} from '@/features/auth/api/auth.api';
import { getApiErrorInfo, getAuthErrorMessage } from '@/shared/api/errors';
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

function sessionFromUser(user: User): AuthSession {
  return {
    isAuth: true,
    token: `${user?.token ?? ''}`,
    user,
  };
}

function unauthorizedSession(): AuthSession {
  return {
    isAuth: false,
    token: '',
    user: null,
  };
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
    session: { isAuth: 'load', token: '', user: null },

    setLoginErr: (err: string) => {
      set({ loginErr: err });
    },

    setAuthenticated: (user: User) => {
      set({ session: sessionFromUser(user) });
    },

    setUnauthorized: () => {
      set({ session: unauthorizedSession() });
    },

    login: async (login: string, pwd: string) => {
      if (get().isSubmitting) {
        return currentAuthResult(get(), false, 'Уже выполняется вход');
      }

      set({ isSubmitting: true });

      try {
        await loginWeb(login, pwd, true);
        const me = await fetchMe();
        const authData = sessionFromUser(me);
        const result = {
          st: true,
          ...authData,
          text: '',
        };

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
