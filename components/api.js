import queryString from 'query-string';
import axios from 'axios';

const DEFAULT_HTTP_BASE_URL = 'http://localhost:8080'; //'https://api2.jacochef.ru';
const DEFAULT_LEGACY_BASE_URL = 'http://localhost:8080'; //'https://api2.jacochef.ru/driver/public/index.php';

function normalizeBaseUrl(value) {
  return `${value || ''}`.replace(/\/+$/, '');
}

function joinUrl(base, path = '') {
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

export const http = axios.create({
  baseURL: HTTP_BASE_URL,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: BASE_HEADERS,
});

function getValidationMessage(data) {
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

export function getApiErrorInfo(error) {
  const status = error?.response?.status ?? null;
  const data = error?.response?.data ?? null;
  const validationMessage = getValidationMessage(data);

  let message = 'Не удалось выполнить запрос.';

  if (validationMessage) {
    message = validationMessage;
  } else if (typeof data === 'string' && data.trim().length > 0) {
    message = data;
  } else if (typeof data?.message === 'string' && data.message.trim().length > 0) {
    message = data.message;
  } else if (typeof error?.message === 'string' && error.message.trim().length > 0) {
    message = error.message;
  }

  return {
    status,
    data,
    message,
    isNetwork: error?.code === 'ERR_NETWORK',
  };
}

export function getAuthErrorMessage(error, fallbackMessage = 'Не удалось выполнить вход.') {
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

export async function ensureCsrfCookie() {
  await http.get('/sanctum/csrf-cookie');
}

export async function loginWeb(login, password, remember = true) {
  await ensureCsrfCookie();

  const { data } = await http.post('/api/v1/auth/session/login', {
    login,
    password,
    remember,
  });

  return data;
}

export async function loginToken(login, password, deviceName = 'rn-device') {
  const { data } = await http.post('/api/v1/auth/token/login', {
    email: login,
    login,
    password,
    device_name: deviceName,
  });

  return data;
}

export async function fetchMe() {
  const { data } = await http.get('/api/v1/auth/me');
  return data;
}

export async function fetchSessionMeta() {
  const { data } = await http.get('/api/v1/auth/session/meta');
  return data;
}

export async function logoutWeb() {
  try {
    await http.post('/api/v1/auth/logout');
  } catch (error) {
    const status = getApiErrorInfo(error).status;
    if (status !== 401 && status !== 419) {
      throw error;
    }
  }
}

export async function logoutSso() {
  await http.post('/auth/sso/logout');
}

export function getSsoLoginUrl() {
  return joinUrl(HTTP_BASE_URL, '/auth/sso/login');
}

export function redirectToSsoLogin() {
  if (typeof window === 'undefined') {
    return;
  }

  window.location.assign(getSsoLoginUrl());
}

export async function api_get(module = '', data = {}) {
  const urlApi = joinUrl(LEGACY_BASE_URL, module);

  try {
    const response = await axios.get(urlApi, {
      params: data,
      withCredentials: true,
      headers: {
        ...BASE_HEADERS,
      },
    });

    if (typeof response.data === 'string') {
      return {
        st: false,
        text: response.data,
      };
    }

    return response.data;
  } catch (error) {
    const info = getApiErrorInfo(error);

    return {
      st: false,
      text: info.message,
      status: info.status,
      data: info.data,
    };
  }
}

export async function api(module = '', data = {}) {
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
      return {
        st: false,
        text: response.data,
      };
    }

    return response.data;
  } catch (error) {
    const info = getApiErrorInfo(error);

    return {
      st: false,
      text: info.message,
      status: info.status,
      data: info.data,
    };
  }
}
