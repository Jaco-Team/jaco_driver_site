import { useEffect, useState } from 'react';
import { fetchMe } from '@/shared/api/client';
import { useLoginStore } from '@/features/auth/model/login.store';

export interface SessionData {
  isAuth: boolean | 'load';
  token: string;
  user: any | null;
}

let sessionData: SessionData = {
  isAuth: 'load',
  token: '',
  user: null,
};

let isFetching = false;
let fetchPromise: Promise<void> | null = null;

const listeners: ((data: SessionData) => void)[] = [];

// Функция для загрузки сессии с сервера
async function fetchSessionFromServer(): Promise<void> {
  if (isFetching && fetchPromise) {
    return fetchPromise;
  }

  isFetching = true;
  fetchPromise = (async () => {
    try {
      console.log('🔄 Загружаем сессию с сервера...');
      const user = await fetchMe();
      const token = user?.token || '';

      const newSessionData: SessionData = {
        isAuth: true,
        token,
        user,
      };

      console.log('✅ Сессия загружена с сервера', newSessionData);
      sessionData = newSessionData;

      // Также обновляем стор
      useLoginStore.getState().setAuthData({
        isAuth: true,
        token,
        user,
      });
    } catch (error) {
      console.log('❌ Сессия не найдена на сервере');
      sessionData = {
        isAuth: false,
        token: '',
        user: null,
      };

      // Обновляем стор
      useLoginStore.getState().setAuthData({
        isAuth: false,
        token: '',
        user: null,
      });
    } finally {
      isFetching = false;
      fetchPromise = null;
      // Оповещаем всех слушателей
      listeners.forEach((listener) => listener(sessionData));
    }
  })();

  return fetchPromise;
}

export async function refreshSession(): Promise<void> {
  await fetchSessionFromServer();
}

export function markSessionAuthenticated(user: any): void {
  const token = user?.token || '';
  sessionData = {
    isAuth: true,
    token,
    user,
  };
  console.log('✅ SessionHook: Сессия отмечена как авторизованная', sessionData);
  listeners.forEach((listener) => listener(sessionData));

  // Обновляем стор
  useLoginStore.getState().setAuthData({
    isAuth: true,
    token,
    user,
  });
}

export function markSessionUnauthorized(): void {
  console.log('❌ SessionHook: Сессия отмечена как неавторизованная');
  sessionData = {
    isAuth: false,
    token: '',
    user: null,
  };
  listeners.forEach((listener) => listener(sessionData));

  // Обновляем стор
  useLoginStore.getState().setAuthData({
    isAuth: false,
    token: '',
    user: null,
  });
}

export function setSessionData(data: SessionData): void {
  sessionData = data;
  listeners.forEach((listener) => listener(sessionData));
}

export function getSessionData(): SessionData {
  return sessionData;
}

export default function useSession(): { isAuth: boolean | 'load'; user: any; token: string } {
  const [session, setSession] = useState<SessionData>(sessionData);

  useEffect(() => {
    if (session.isAuth === 'load') {
      void fetchSessionFromServer().then(() => {
        setSession(sessionData);
      });
    }
    const listener = (newData: SessionData) => {
      setSession(newData);
    };
    listeners.push(listener);

    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [session.isAuth]);

  return {
    isAuth: session.isAuth,
    token: session.token,
    user: session.user,
  };
}
