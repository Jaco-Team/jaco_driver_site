import axios, { AxiosError, AxiosInstance } from 'axios';

import { apiConfig } from '@/shared/api/config';
import { getAuthToken } from '@/shared/api/token';

const BASE_HEADERS = {
  'X-Requested-With': 'XMLHttpRequest',
  Accept: 'application/json',
} as const;

function isAuthEndpoint(url: string | undefined): boolean {
  return typeof url === 'string' && url.includes('/api/v1/auth/');
}

function isExpectedAuthFailure(error: AxiosError): boolean {
  const status = error.response?.status;
  return isAuthEndpoint(error.config?.url) && (status === 401 || status === 422);
}

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');

    if (name === 'XSRF-TOKEN') {
      return decodeURIComponent(value);
    }
  }

  return null;
}

export const http: AxiosInstance = axios.create({
  baseURL: apiConfig.apiOrigin,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: BASE_HEADERS,
});

export async function ensureCsrfCookie(): Promise<void> {
  await http.get('/sanctum/csrf-cookie');
}

http.interceptors.request.use(
  async (config) => {
    const authToken = getAuthToken();

    if (authToken) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      const csrfToken = getCsrfToken();

      if (csrfToken) {
        config.headers = config.headers ?? {};
        config.headers['X-XSRF-TOKEN'] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (isExpectedAuthFailure(error)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 419 && error.config) {
      try {
        await ensureCsrfCookie();
        const originalConfig = error.config;
        const csrfToken = getCsrfToken();

        if (csrfToken) {
          originalConfig.headers = originalConfig.headers ?? {};
          originalConfig.headers['X-XSRF-TOKEN'] = csrfToken;
        }

        return http(originalConfig);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const connector = {
  rest: {
    async get<T>(url: string, config?: Parameters<AxiosInstance['get']>[1]): Promise<T> {
      const { data } = await http.get<T>(url, config);
      return data;
    },
    async post<T, TPayload = unknown>(
      url: string,
      payload?: TPayload,
      config?: Parameters<AxiosInstance['post']>[2]
    ): Promise<T> {
      const { data } = await http.post<T>(url, payload, config);
      return data;
    },
  },
};
