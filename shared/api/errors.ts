import { AxiosError } from 'axios';

import { ErrorInfo } from '@/shared/api/types';

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

  if (typeof data?.text === 'string' && data.text.trim().length > 0) {
    message = data.text;
  } else if (validationMessage) {
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

export function getAuthErrorMessage(
  error: unknown,
  fallbackMessage: string = 'Не удалось выполнить вход.'
): string {
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
    return info.message || 'Слишком много попыток. Попробуйте позже.';
  }

  return info.message || fallbackMessage;
}

export function getAuthSecurityState(error: unknown): {
  captchaRequired: boolean;
  retryAfter: number;
} {
  const axiosError = error as AxiosError;
  const data = (axiosError?.response?.data as any) ?? null;
  const headerRetryAfter = Number(axiosError?.response?.headers?.['retry-after'] ?? 0);
  const payloadRetryAfter = Number(data?.retry_after ?? 0);
  const retryAfter = Math.max(
    0,
    Math.ceil(
      Number.isFinite(payloadRetryAfter) && payloadRetryAfter > 0
        ? payloadRetryAfter
        : Number.isFinite(headerRetryAfter)
          ? headerRetryAfter
          : 0
    )
  );

  return {
    captchaRequired: Boolean(data?.captcha_required),
    retryAfter,
  };
}
