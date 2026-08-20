import axios, { AxiosInstance } from 'axios';

import { apiConfig } from '@/shared/api/config';
import { getAuthToken } from '@/shared/api/token';

const BASE_HEADERS = {
  'X-Requested-With': 'XMLHttpRequest',
  Accept: 'application/json',
} as const;

export const http: AxiosInstance = axios.create({
  baseURL: apiConfig.apiOrigin,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: BASE_HEADERS,
});

http.interceptors.request.use(
  (config) => {
    const authToken = getAuthToken();

    if (authToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
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
