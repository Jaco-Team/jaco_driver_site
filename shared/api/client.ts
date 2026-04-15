
import axios, { AxiosError, AxiosInstance } from 'axios';
import queryString from 'query-string';

const DEFAULT_HTTP_BASE_URL = 'http://localhost:8080';
const DEFAULT_LEGACY_BASE_URL = 'http://localhost:8080';

function normalizeBaseUrl(value: string | undefined): string {
  return `${value || ''}`.replace(/\/+$/, '');
}

function joinUrl(base: string, path: string = ''): string {
  const normalizedBase = normalizeBaseUrl(base);
  const normalizedPath = `${path || ''}`.replace(/^\/+/, '');
  return normalizedPath ? `${normalizedBase}/${normalizedPath}` : normalizedBase;
}

const HTTP_BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL) || DEFAULT_HTTP_BASE_URL;
const LEGACY_BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_LEGACY_API_URL) || DEFAULT_LEGACY_BASE_URL;

const BASE_HEADERS = {
  'X-Requested-With': 'XMLHttpRequest',
  Accept: 'application/json',
};

export const http: AxiosInstance = axios.create({
  baseURL: HTTP_BASE_URL,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: BASE_HEADERS,
});

export async function ensureCsrfCookie(): Promise<void> {
  try {
    await http.get('/sanctum/csrf-cookie');
    console.log('✅ CSRF cookie получен');
  } catch (error) {
    console.error('❌ Ошибка получения CSRF cookie:', error);
    throw error;
  }
}

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'XSRF-TOKEN') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

http.interceptors.request.use(
  async (config) => {
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
      }
    }
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`, response.status);
    return response;
  },
  async (error: AxiosError) => {
    console.error(`❌ API Error: ${error.config?.url}`, error.message);

    // Если получили 419 (CSRF mismatch), пробуем обновить CSRF и повторить запрос
    if (error.response?.status === 419 && error.config) {
      console.log('🔄 Получен 419, пробуем обновить CSRF и повторить запрос...');
      try {
        await ensureCsrfCookie();
        // Повторяем оригинальный запрос
        const originalConfig = error.config;
        if (originalConfig) {
          const newCsrfToken = getCsrfToken();
          if (newCsrfToken) {
            originalConfig.headers['X-XSRF-TOKEN'] = newCsrfToken;
          }
          return http(originalConfig);
        }
      } catch (csrfError) {
        console.error('❌ Не удалось обновить CSRF:', csrfError);
      }
    }

    return Promise.reject(error);
  }
);

// Типы для API ответов
export interface ApiResponse<T = any> {
  st: boolean;
  text?: string;
  data?: T;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface User {
  token?: string;
  id?: number;
  name?: string;
  login?: string;
  email?: string;
  [key: string]: any;
}

export interface ErrorInfo {
  status: number | null;
  data?: any;
  message: string;
  isNetwork: boolean;
}

function getValidationMessage(data: any): string {
  const errors = data?.errors;
  if (!errors || typeof errors !== 'object') {
    return '';
  }

  for (const value of Object.values(errors)) {
    if (Array.isArray(value) && value.length > 0 && value[0]) {
      return `${value[0]}`;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return '';
}

export function getApiErrorInfo(error: unknown): ErrorInfo {
  const axiosError = error as AxiosError;
  const status = axiosError?.response?.status ?? null;
  const data = (axiosError?.response?.data as any) ?? null;
  const validationMessage = getValidationMessage(data);

  let message = 'Не удалось выполнить запрос.';

  if (validationMessage) {
    message = validationMessage;
  } else if (typeof data === 'string' && data.trim().length > 0) {
    message = data;
  } else if (typeof data?.message === 'string' && data.message.trim().length > 0) {
    message = data.message;
  } else if (typeof axiosError?.message === 'string' && axiosError.message.trim().length > 0) {
    message = axiosError.message;
  }

  return {
    status,
    data,
    message,
    isNetwork: axiosError?.code === 'ERR_NETWORK',
  };
}

export function getAuthErrorMessage(error: unknown, fallbackMessage: string = 'Не удалось выполнить вход.'): string {
  const info = getApiErrorInfo(error);

  if (info.isNetwork) {
    return 'Не удалось подключиться к серверу.';
  }

  if (info.status === 401) {
    return 'Неверный логин или пароль.';
  }

  if (info.status === 419) {
    return 'Сессия истекла. Обновите страницу и попробуйте снова.';
  }

  if (info.status === 422) {
    return info.message || 'Проверьте корректность введенных данных.';
  }

  if (info.status === 429) {
    return 'Слишком много попыток. Попробуйте позже.';
  }

  return info.message || fallbackMessage;
}

export const loginWeb = async (login: string, password: string, remember: boolean = true): Promise<User> => {
  await ensureCsrfCookie();
  const { data } = await http.post<User>('/api/v1/auth/session/login', {
    login,
    password,
    remember,
  });
  return data;
};

export async function loginToken(login: string, password: string, deviceName: string = 'web-device'): Promise<User> {
  const { data } = await http.post<User>('/api/v1/auth/token/login', {
    email: login,
    login,
    password,
    device_name: deviceName,
  });
  return data;
}

export const fetchMe = async (): Promise<User> => {
  try {
    const { data } = await http.get<User>('/api/v1/auth/me');
    return data;
  } catch (error) {
    console.error('fetchMe error:', error);
    throw error;
  }
};

export async function fetchSessionMeta(): Promise<any> {
  const { data } = await http.get('/api/v1/auth/session/meta');
  return data;
}

export async function logoutWeb(): Promise<void> {
  try {
    await http.post('/api/v1/auth/logout');
  } catch (error) {
    const info = getApiErrorInfo(error);
    if (info.status !== 401 && info.status !== 419) {
      throw error;
    }
  }
}

export async function logoutSso(): Promise<void> {
  await http.post('/auth/sso/logout');
}

export function getSsoLoginUrl(): string {
  return joinUrl(HTTP_BASE_URL, '/auth/sso/login');
}

export function redirectToSsoLogin(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.location.assign(getSsoLoginUrl());
}

export async function api_get(module: string = '', data: any = {}): Promise<ApiResponse> {
  const urlApi = joinUrl(LEGACY_BASE_URL, module);

  try {
    const response = await axios.get(urlApi, {
      params: data,
      withCredentials: true,
      headers: BASE_HEADERS,
    });

    if (typeof response.data === 'string') {
      return { st: false, text: response.data };
    }

    return response.data;
  } catch (error) {
    const info = getApiErrorInfo(error);
    return {
      st: false,
      text: info.message,
      status: info.status ?? undefined,
      data: info.data,
    };
  }
}

export async function api(module: string = '', data: any = {}): Promise<ApiResponse> {
  const urlApi = joinUrl(LEGACY_BASE_URL, module);

  try {
    const response = await axios.post(urlApi, queryString.stringify(data), {
      withCredentials: true,
      headers: {
        ...BASE_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    });

    if (typeof response.data === 'string') {
      return { st: false, text: response.data };
    }

    return response.data;
  } catch (error) {
    const info = getApiErrorInfo(error);
    return {
      st: false,
      text: info.message,
      status: info.status ?? undefined,
      data: info.data,
    };
  }
}

export const log = (event: string, message: string, data?: any): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${event}]`, message, data || '');
  }
};
