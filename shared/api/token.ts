const AUTH_TOKEN_STORAGE_KEY = 'jaco_driver_auth_token';

let inMemoryToken: string | null = null;

export function getAuthToken(): string | null {
  if (inMemoryToken) {
    return inMemoryToken;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  try {
    inMemoryToken = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    inMemoryToken = null;
  }

  return inMemoryToken;
}

export function setAuthToken(token: string | null | undefined): void {
  inMemoryToken = token ? `${token}` : null;

  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (inMemoryToken) {
      window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, inMemoryToken);
    } else {
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
  } catch {}
}

export function clearAuthToken(): void {
  setAuthToken(null);
}
