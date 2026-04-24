import axios, { AxiosError, AxiosInstance } from 'axios';
import queryString from 'query-string';

import { apiConfig, joinUrl } from '@/shared/api/config';
import { getApiErrorInfo } from '@/shared/api/errors';
import { getLegacyModulePath } from '@/shared/api/routes';
import type { ApiResponse } from '@/shared/api/types';

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
  legacy: {
    async get<T extends ApiResponse = ApiResponse>(
      module: string = '',
      params: Record<string, any> = {}
    ): Promise<T> {
      const url = joinUrl(apiConfig.legacyApiOrigin, getLegacyModulePath(module));

      try {
        const response = await axios.get<T | string>(url, {
          params,
          withCredentials: true,
          headers: BASE_HEADERS,
        });

        if (typeof response.data === 'string') {
          return { st: false, text: response.data } as T;
        }

        return response.data;
      } catch (error) {
        const info = getApiErrorInfo(error);
        return {
          st: false,
          text: info.message,
          status: info.status ?? undefined,
          data: info.data,
        } as T;
      }
    },
    async post<T extends ApiResponse = ApiResponse>(
      module: string = '',
      payload: Record<string, any> = {}
    ): Promise<T> {
      const url = joinUrl(apiConfig.legacyApiOrigin, getLegacyModulePath(module));

      try {
        const response = await axios.post<T | string>(url, queryString.stringify(payload), {
          withCredentials: true,
          headers: {
            ...BASE_HEADERS,
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          },
        });

        if (typeof response.data === 'string') {
          return { st: false, text: response.data } as T;
        }

        return response.data;
      } catch (error) {
        const info = getApiErrorInfo(error);
        return {
          st: false,
          text: info.message,
          status: info.status ?? undefined,
          data: info.data,
        } as T;
      }
    },
  },
};
