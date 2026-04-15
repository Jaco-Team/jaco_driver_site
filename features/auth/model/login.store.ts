// features/auth/model/login.store.ts
import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import {
  api,
  fetchMe,
  getApiErrorInfo,
  getAuthErrorMessage,
  loginWeb,
  log,
} from '@/shared/api/client';

import { markSessionAuthenticated, markSessionUnauthorized } from '@/components/sessionHook';
import { useLoginStore as oldLoginStore } from '@/components/store';

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
  sendSMS: (login: string, pwd: string) => Promise<any>;
  sendCode: (login: string, code: string) => Promise<any>;
  save_settings_format: (value: string) => Promise<any>;
  check_token: () => Promise<any>;
}

type LoginStore = LoginState & LoginActions;

// Функция для обновления старого стора
const updateOldStore = (data: any) => {
  try {
    oldLoginStore.setState({
      authData: {
        isAuth: data.isAuth,
        token: data.token,
        user: data.user,
      },
      loginErr: data.text || '',
      is_load: false,
      is_loadToken: false,
    });
  } catch (e) {
    console.error('Failed to update old store', e);
  }
};

export const useLoginStore = createWithEqualityFn<LoginStore>(
  (set, get) => ({
    is_load: false,
    is_loadToken: false,
    loginErr: '',
    authData: { isAuth: 'load', token: '', user: null },

    setLoginErr: (err: string) => {
      set({ loginErr: err });
      try {
        oldLoginStore.setState({ loginErr: err });
      } catch (e) {}
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
        oldLoginStore.setState({ is_load: true });
      } catch (e) {}

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

        // Обновляем старый стор
        updateOldStore(json);

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

        updateOldStore(json);
        markSessionUnauthorized();

        return json;
      }
    },

    sendSMS: async (login: string, pwd: string) => {
      if (!get().is_load) {
        set({ is_load: true });
        try {
          oldLoginStore.setState({ is_load: true });
        } catch (e) {}
      } else {
        return { st: false, text: 'Подождите' };
      }

      const data = {
        type: 'get_sms',
        login: login,
        pwd: pwd,
      };

      const json = await api('auth', data);

      set({ is_load: false });
      try {
        oldLoginStore.setState({ is_load: false });
      } catch (e) {}

      return json;
    },

    sendCode: async (login: string, code: string) => {
      if (!get().is_load) {
        set({ is_load: true });
        try {
          oldLoginStore.setState({ is_load: true });
        } catch (e) {}
      } else {
        return { st: false, text: 'Подождите' };
      }

      const data = {
        type: 'check_code',
        login: login,
        code: code,
      };

      const json = await api('auth', data);

      set({ is_load: false });
      try {
        oldLoginStore.setState({ is_load: false });
      } catch (e) {}

      return json;
    },

    save_settings_format: async (value: string) => {
      const data = {
        type: 'save_settings_format',
        value: value,
      };

      const json = await api('auth', data);
      return json;
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
        updateOldStore(json);
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
        updateOldStore(json);
        markSessionUnauthorized();

        return json;
      } finally {
        set({ is_loadToken: false });
      }
    },
  }),
  shallow
);
