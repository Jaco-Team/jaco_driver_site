
import { useEffect, useState } from 'react';
import { UseSessionReturn, SessionData } from '@/shared/types/session';

let sessionData = {
  isAuth: 'load',
  token: '',
  user: null,
};

const listeners: ((data: SessionData) => void)[] = [];

export function markSessionAuthenticated(user: any): void {
  const token = user?.token || '';
  sessionData = {
    isAuth: true,
    token,
    user,
  };
  listeners.forEach(listener => listener(sessionData));
}

export function markSessionUnauthorized(): void {
  sessionData = {
    isAuth: false,
    token: '',
    user: null,
  };
  listeners.forEach(listener => listener(sessionData));
}

export function setSessionData(data: SessionData): void {
  sessionData = data;
  listeners.forEach(listener => listener(sessionData));
}

export function getSessionData(): SessionData {
  return sessionData;
}

export default function useSession(): { isAuth: boolean; user: any; token: any } {
  const [session, setSession] = useState<SessionData>(sessionData);

  useEffect(() => {
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
  }, []);

  return {
    isAuth: session.isAuth === true,
    token: session.token,
    user: session.user,
  };
}
