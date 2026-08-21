import { connector } from '@/shared/api/connector';
import { getApiErrorInfo } from '@/shared/api/errors';
import { apiRoutes, getSsoLoginUrl } from '@/shared/api/routes';
import { setAuthToken } from '@/shared/api/token';
import type { ApiResponse, User } from '@/shared/api/types';

interface TokenLoginResponse {
  token?: string;
  token_type?: string;
  auth_mode?: string;
  user_id?: number | null;
  name?: string | null;
  login?: string | null;
  city_id?: number | null;
  point_id?: number | null;
  appointment_id?: number | null;
}

function toUser(payload: TokenLoginResponse, token: string): User {
  return {
    token,
    token_type: payload.token_type,
    id: payload.user_id ?? undefined,
    user_id: payload.user_id,
    name: payload.name ?? undefined,
    login: payload.login ?? undefined,
    city_id: payload.city_id,
    point_id: payload.point_id,
    appointment_id: payload.appointment_id,
    auth_mode: payload.auth_mode,
  };
}

export async function loginToken(
  login: string,
  password: string,
  deviceName: string = 'driver-web',
  captchaToken: string = ''
): Promise<User> {
  const payload = await connector.rest.post<
    TokenLoginResponse,
    { login: string; password: string; device_name: string; captcha_token?: string }
  >(apiRoutes.auth.tokenLogin, {
    login: login.trim(),
    password,
    device_name: deviceName,
    ...(captchaToken ? { captcha_token: captchaToken } : {}),
  });

  const token = `${payload?.token ?? ''}`.trim();

  if (!token) {
    throw new Error('Сервер не вернул токен авторизации.');
  }

  setAuthToken(token);

  return toUser(payload, token);
}

export async function exchangeSsoLoginCode(loginCode: string): Promise<string> {
  const payload = await connector.rest.post<{ token?: string }, { login_code: string }>(
    apiRoutes.auth.ssoExchange,
    { login_code: loginCode }
  );

  const token = `${payload?.token ?? ''}`.trim();

  if (!token) {
    throw new Error('Сервер не вернул токен авторизации. ');
  }

  setAuthToken(token);

  return token;
}

export async function sendPasswordRecoveryCode(
  login: string,
  password: string,
  captchaToken: string = ''
): Promise<ApiResponse> {
  return connector.rest.post<
    ApiResponse,
    { login: string; password: string; captcha_token?: string }
  >(apiRoutes.auth.passwordRecoverySendCode, {
    login: login.trim(),
    password,
    ...(captchaToken ? { captcha_token: captchaToken } : {}),
  });
}

export async function confirmPasswordRecoveryCode(
  login: string,
  code: string
): Promise<ApiResponse> {
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
