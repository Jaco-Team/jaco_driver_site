import { useEffect, useState } from 'react';

import { fetchMe, getApiErrorInfo } from '@/components/api';

const INITIAL_SESSION = Object.freeze({
  isAuth: 'load',
  token: '',
  user: null,
});

let sessionSnapshot = { ...INITIAL_SESSION };
let sessionRequest = null;
const listeners = new Set();

function publish(nextSession) {
  sessionSnapshot = nextSession;
  listeners.forEach((listener) => listener(sessionSnapshot));
}

function toAuthorizedSession(user) {
  return {
    isAuth: true,
    token: `${user?.token ?? ''}`,
    user: user || null,
  };
}

function toUnauthorizedSession() {
  return {
    isAuth: false,
    token: '',
    user: null,
  };
}

async function resolveSession(force = false) {
  if (typeof window === 'undefined') {
    return { ...INITIAL_SESSION };
  }

  if (!force && sessionSnapshot.isAuth !== 'load') {
    return sessionSnapshot;
  }

  if (sessionRequest) {
    return sessionRequest;
  }

  sessionRequest = fetchMe()
    .then((user) => {
      const nextSession = toAuthorizedSession(user);
      publish(nextSession);
      return nextSession;
    })
    .catch((error) => {
      const status = getApiErrorInfo(error).status;

      if (status !== 401 && status !== 403) {
        console.error('session_me_request_failed', error);
      }

      const nextSession = toUnauthorizedSession();
      publish(nextSession);
      return nextSession;
    })
    .finally(() => {
      sessionRequest = null;
    });

  return sessionRequest;
}

export function markSessionAuthenticated(user) {
  publish(toAuthorizedSession(user));
}

export function markSessionUnauthorized() {
  publish(toUnauthorizedSession());
}

export async function refreshSession() {
  publish({ ...INITIAL_SESSION });
  return resolveSession(true);
}

export default function useSession() {
  const [session, setSession] = useState(() => {
    if (typeof window === 'undefined') {
      return { ...INITIAL_SESSION };
    }

    return sessionSnapshot;
  });

  useEffect(() => {
    const listener = (nextSession) => {
      setSession(nextSession);
    };

    listeners.add(listener);
    listener(sessionSnapshot);
    void resolveSession();

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return session;
}
