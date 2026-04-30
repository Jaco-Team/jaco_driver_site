// features/auth/model/login.store.ts
import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import {
  fetchMe,
  getApiErrorInfo,
  getAuthErrorMessage,
  loginWeb,
  log,
  sendPasswordRecoveryCode as requestPasswordRecoveryCodeApi,
  confirmPasswordRecoveryCode as confirmPasswordRecoveryCodeApi,
} from '@/shared/api/client';

import { markSessionAuthenticated, markSessionUnauthorized } from '@/components/sessionHook';

interface AuthData {
  isAuth: boolean | 'load';
  token: string;
  user: any | null;
}

interface LoginState {
  is_load: boolean;
  is_loadToken: boolean;
  loginErr: string;
  authData: AuthData;
}

interface LoginActions {
  setLoginErr: (err: string) => void;
  setAuthData: (data: any) => void;
  login: (login: string, pwd: string) => Promise<any>;
  requestPasswordRecoveryCode: (login: string, pwd: string) => Promise<any>;
  confirmPasswordRecoveryCode: (login: string, code: string) => Promise<any>;
  check_token: () => Promise<any>;
}

type LoginStore = LoginState & LoginActions;

export const useLoginStore = createWithEqualityFn<LoginStore>(
  (set, get) => ({
    is_load: false,
    is_loadToken: false,
    loginErr: '',
    authData: { isAuth: 'load', token: '', user: null },

    setLoginErr: (err: string) => {
      set({ loginErr: err });
    },

    setAuthData: (data: any) => {
      set({ authData: data });
    },

    login: async (login: string, pwd: string) => {
      if (get().is_load) {
        return { st: false, text: 'Уже выполняется вход' };
      }

      console.log('🔐 Начинаем процесс авторизации для:', login);
      set({ is_load: true });

      try {
        // Выполняем loginWeb - он устанавливает cookie
        await loginWeb(login, pwd, true);

        // После успешного логина, получаем данные пользователя
        const me = await fetchMe();
        const token = `${me?.token ?? ''}`;
        const json = {
          st: true,
          isAuth: true,
          token,
          user: me,
          text: '',
        };

        // Обновляем новый стор
        set({
          is_load: false,
          loginErr: '',
          authData: json,
        });

        // Обновляем sessionHook
        markSessionAuthenticated(me);

        console.log('✅ Авторизация успешна, данные сохранены в сторах');
        return json;
      } catch (error) {
        const errorInfo = getApiErrorInfo(error);
        const errorText = getAuthErrorMessage(error);
        const json = {
          st: false,
          isAuth: false,
          token: '',
          user: null,
          text: errorText,
          status: errorInfo.status,
        };

        set({
          is_load: false,
          loginErr: errorText,
          authData: json,
        });

        markSessionUnauthorized();

        return json;
      }
    },

    requestPasswordRecoveryCode: async (login: string, pwd: string) => {
      if (!get().is_load) {
        set({ is_load: true });
      } else {
        return { st: false, text: 'Подождите' };
      }

      try {
        return await requestPasswordRecoveryCodeApi(login, pwd);
      } catch (error) {
        const errorInfo = getApiErrorInfo(error);
        return {
          st: false,
          text: getAuthErrorMessage(error, 'Не удалось отправить код восстановления.'),
          status: errorInfo.status,
          data: errorInfo.data,
        };
      } finally {
        set({ is_load: false });
      }
    },

    confirmPasswordRecoveryCode: async (login: string, code: string) => {
      if (!get().is_load) {
        set({ is_load: true });
      } else {
        return { st: false, text: 'Подождите' };
      }

      try {
        return await confirmPasswordRecoveryCodeApi(login, code);
      } catch (error) {
        const errorInfo = getApiErrorInfo(error);
        return {
          st: false,
          text: getAuthErrorMessage(error, 'Не удалось подтвердить код восстановления.'),
          status: errorInfo.status,
          data: errorInfo.data,
        };
      } finally {
        set({ is_load: false });
      }
    },

    check_token: async () => {
      if (get().is_loadToken) {
        return { st: 'load' };
      }

      set({ is_loadToken: true });

      try {
        // Просто проверяем, есть ли активная сессия на сервере
        const me = await fetchMe();
        const token = `${me?.token ?? ''}`;
        const json = {
          st: true,
          isAuth: true,
          token,
          user: me,
          text: '',
        };

        set({ authData: json });
        markSessionAuthenticated(me);

        return json;
      } catch (error) {
        const errorInfo = getApiErrorInfo(error);
        const status = errorInfo.status;
        const isUnauthorized = status === 401 || status === 403;
        const errorText = isUnauthorized
          ? 'Не авторизован'
          : getAuthErrorMessage(error, 'Не удалось проверить сессию.');
        const json = {
          st: false,
          isAuth: false,
          token: '',
          user: null,
          text: errorText,
          status,
        };

        set({ authData: json });
        markSessionUnauthorized();

        return json;
      } finally {
        set({ is_loadToken: false });
      }
    },
  }),
  shallow
);
