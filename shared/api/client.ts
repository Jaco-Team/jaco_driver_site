
import axios, { AxiosError, AxiosInstance } from 'axios';

export const http: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  [key: string]: any;
}

export interface ErrorInfo {
  status: number;
  data?: any;
  message: string;
}

export const api = async <T = any>(endpoint: string, data: any): Promise<T & ApiResponse> => {
  try {
    const response = await http.post(`/v1/${endpoint}`, data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    return { st: false, text: (error as Error).message } as any;
  }
};

export const fetchMe = async (): Promise<User> => {
  try {
    const response = await http.get<User>('/v1/auth/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const redirectToSsoLogin = (): void => {
  if (typeof window !== 'undefined') {
    // Замените URL на ваш реальный SSO endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/v1/auth/sso/login`;
  }
};

export const getApiErrorInfo = (error: unknown): ErrorInfo => {
  const axiosError = error as AxiosError;
  if (axiosError.response) {
    return {
      status: axiosError.response.status,
      data: axiosError.response.data,
      message: (axiosError.response.data as any)?.message || axiosError.message,
    };
  }
  return {
    status: 0,
    message: (error as Error).message,
  };
};

export const getAuthErrorMessage = (error: unknown, defaultMessage: string = 'Ошибка авторизации'): string => {
  const errorInfo = getApiErrorInfo(error);
  return errorInfo.data?.message || errorInfo.message || defaultMessage;
};

export const loginWeb = async (login: string, pwd: string, remember: boolean = false): Promise<User> => {
  const response = await http.post<User>('/v1/auth/session/login', { login, pwd, remember });
  return response.data;
};

export const markSessionAuthenticated = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const markSessionUnauthorized = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('isAuth');
    localStorage.removeItem('user');
  }
};

// Логгер
export const log = (event: string, message: string): void => {
  console.log(`[${event}]`, message);
};
