import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { apiConfig } from '@/shared/api/config';
import { apiRoutes } from '@/shared/api/routes';

const BASE_HEADERS = {
  'X-Requested-With': 'XMLHttpRequest',
  Accept: 'application/json',
} as const;

const STATE_CHANGING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

interface CsrfRetryConfig extends InternalAxiosRequestConfig {
  _csrfRetry?: boolean;
}

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  for (const cookie of document.cookie.split(';')) {
    const normalizedCookie = cookie.trim();
    const separatorIndex = normalizedCookie.indexOf('=');

    if (separatorIndex === -1 || normalizedCookie.slice(0, separatorIndex) !== 'XSRF-TOKEN') {
      continue;
    }

    const encodedToken = normalizedCookie.slice(separatorIndex + 1);

    try {
      return decodeURIComponent(encodedToken);
    } catch {
      return encodedToken;
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
  await http.get(apiRoutes.csrfCookie);
}

http.interceptors.request.use(
  (config) => {
    const method = config.method?.toLowerCase() ?? '';

    if (STATE_CHANGING_METHODS.has(method)) {
      const csrfToken = getCsrfToken();

      if (csrfToken) {
        config.headers.set('X-XSRF-TOKEN', csrfToken);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as CsrfRetryConfig | undefined;
    const method = originalConfig?.method?.toLowerCase() ?? '';

    if (
      error.response?.status !== 419 ||
      !originalConfig ||
      originalConfig._csrfRetry ||
      !STATE_CHANGING_METHODS.has(method)
    ) {
      return Promise.reject(error);
    }

    originalConfig._csrfRetry = true;

    try {
      await ensureCsrfCookie();
      const csrfToken = getCsrfToken();

      if (csrfToken) {
        originalConfig.headers.set('X-XSRF-TOKEN', csrfToken);
      }

      return http(originalConfig);
    } catch {
      return Promise.reject(error);
    }
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
