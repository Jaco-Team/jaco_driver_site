import { connector } from '@/shared/api/connector';
import { getApiErrorInfo } from '@/shared/api/errors';
import { apiRoutes } from '@/shared/api/routes';

export type RecoveryChannel = 'sms' | 'telegram' | 'voice';

const KNOWN_CHANNELS: readonly RecoveryChannel[] = ['sms', 'telegram', 'voice'];

export interface RecoveryResult {
  st: boolean;
  text: string;
  /** Код отказа сервера: account_not_found, invalid_code, too_many_requests и т. д. */
  errorCode: string;
  retryAfter: number;
  resendAfter: number;
  captchaRequired: boolean;
}

function seconds(value: unknown): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? Math.ceil(parsed) : 0;
}

function toResult(payload: unknown, fallbackText: string): RecoveryResult {
  const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const st = record.st === true;
  const text = typeof record.text === 'string' && record.text.trim() ? record.text : '';

  return {
    st,
    text: text || (st ? '' : fallbackText),
    errorCode: typeof record.error_code === 'string' ? record.error_code : '',
    retryAfter: seconds(record.retry_after),
    resendAfter: seconds(record.resend_after),
    captchaRequired: record.captcha_required === true,
  };
}

/** Отказ сервер присылает тем же телом, что и успех, но со статусом 4xx. */
function fromError(error: unknown, fallbackText: string): RecoveryResult {
  const info = getApiErrorInfo(error);
  const result = toResult(info.data, fallbackText);

  return { ...result, st: false, text: result.text || fallbackText };
}

/** Способы получения кода, доступные сейчас. Если список не пришёл, остаётся SMS. */
export async function fetchRecoveryChannels(): Promise<RecoveryChannel[]> {
  try {
    const payload = await connector.rest.get<{ channels?: unknown }>(
      apiRoutes.auth.passwordRecoveryChannels
    );
    const channels = Array.isArray(payload?.channels)
      ? KNOWN_CHANNELS.filter((channel) => (payload.channels as unknown[]).includes(channel))
      : [];

    return channels.length > 0 ? channels : ['sms'];
  } catch {
    return ['sms'];
  }
}

export async function requestRecoveryCode(
  login: string,
  channel: RecoveryChannel,
  captchaToken: string = ''
): Promise<RecoveryResult> {
  const fallback = 'Не удалось запросить код. Попробуйте позже.';

  try {
    const payload = await connector.rest.post<unknown>(apiRoutes.auth.passwordRecoveryRequestCode, {
      login,
      delivery_channel: channel,
      ...(captchaToken ? { captcha_token: captchaToken } : {}),
    });

    return toResult(payload, fallback);
  } catch (error) {
    return fromError(error, fallback);
  }
}

export async function resetPasswordWithCode(
  login: string,
  code: string,
  password: string
): Promise<RecoveryResult> {
  const fallback = 'Не удалось обновить пароль. Попробуйте позже.';

  try {
    const payload = await connector.rest.post<unknown>(apiRoutes.auth.passwordRecoveryReset, {
      login,
      code,
      password,
    });

    return toResult(payload, fallback);
  } catch (error) {
    return fromError(error, fallback);
  }
}
