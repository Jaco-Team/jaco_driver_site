import { connector, ensureCsrfCookie } from '@/shared/api/connector';
import { getApiErrorInfo } from '@/shared/api/errors';
import { apiRoutes, getSsoLoginUrl } from '@/shared/api/routes';
import type { ApiResponse, User } from '@/shared/api/types';

export async function loginWeb(
  login: string,
  password: string,
  remember: boolean = true
): Promise<User> {
  await ensureCsrfCookie();

  return connector.rest.post<User, { login: string; password: string; remember: boolean }>(
    apiRoutes.auth.sessionLogin,
    {
      login: login.trim(),
      password,
      remember,
    }
  );
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

export function redirectToSsoLogin(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.location.assign(getSsoLoginUrl());
}
