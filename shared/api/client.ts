import { connector, ensureCsrfCookie, http } from '@/shared/api/connector';
import { getApiErrorInfo, getAuthErrorMessage } from '@/shared/api/errors';
import { apiRoutes, getSsoLoginUrl } from '@/shared/api/routes';
import type { ApiResponse } from '@/shared/api/types';
import type { User } from '@/shared/api/types';

export type { ApiResponse, User, ErrorInfo } from '@/shared/api/types';

export { http, ensureCsrfCookie, getApiErrorInfo, getAuthErrorMessage };

export const loginWeb = async (
  login: string,
  password: string,
  remember: boolean = true
): Promise<User> => {
  await ensureCsrfCookie();

  return connector.rest.post<User, { login: string; password: string; remember: boolean }>(
    apiRoutes.auth.sessionLogin,
    {
      login: login.trim(),
      password,
      remember,
    }
  );
};

export async function loginToken(
  login: string,
  password: string,
  deviceName: string = 'web-device'
): Promise<User> {
  return connector.rest.post<
    User,
    { email: string; login: string; password: string; device_name: string }
  >(apiRoutes.auth.tokenLogin, {
    email: login,
    login,
    password,
    device_name: deviceName,
  });
}

export async function sendPasswordRecoveryCode(
  login: string,
  password: string
): Promise<ApiResponse> {
  await ensureCsrfCookie();

  return connector.rest.post<ApiResponse, { login: string; password: string }>(
    apiRoutes.auth.passwordRecoverySendCode,
    {
      login: login.trim(),
      password,
    }
  );
}

export async function confirmPasswordRecoveryCode(
  login: string,
  code: string
): Promise<ApiResponse> {
  await ensureCsrfCookie();

  return connector.rest.post<ApiResponse, { login: string; code: string }>(
    apiRoutes.auth.passwordRecoveryConfirmCode,
    {
      login: login.trim(),
      code,
    }
  );
}

export const fetchMe = async (): Promise<User> => connector.rest.get<User>(apiRoutes.auth.me);

export async function fetchSessionMeta(): Promise<any> {
  return connector.rest.get(apiRoutes.auth.sessionMeta);
}

export async function logoutWeb(): Promise<void> {
  try {
    await connector.rest.post(apiRoutes.auth.logout);
  } catch (error) {
    const info = getApiErrorInfo(error);

    if (info.status !== 401 && info.status !== 419) {
      throw error;
    }
  }
}

export async function logoutSso(): Promise<void> {
  await connector.rest.post(apiRoutes.sso.logout);
}

export { getSsoLoginUrl };

export function redirectToSsoLogin(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.location.assign(getSsoLoginUrl());
}

export async function api_get(module: string = '', data: any = {}): Promise<ApiResponse> {
  return connector.legacy.get(module, data);
}

export async function api(module: string = '', data: any = {}): Promise<ApiResponse> {
  return connector.legacy.post(module, data);
}

export const log = (event: string, message: string, data?: any): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${event}]`, message, data || '');
  }
};
