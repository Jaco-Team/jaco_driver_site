export type GeolocationPermissionState = 'granted' | 'denied' | 'prompt' | 'unknown';

export interface GeolocationReadResult {
  latitude: string;
  longitude: string;
  blocked: boolean;
  message: string | null;
}

export interface ReadDriverPositionOptions {
  /** Показать курьеру обратный отсчёт до конца ожидания геопозиции. */
  showWait?: boolean;
}

const FIRST_TRY_TIMEOUT_MS = 15000;
const RETRY_TIMEOUT_MS = 10000;

export interface GeolocationWaitState {
  /** Когда ожидание закончится по таймауту. */
  deadlineAt: number;
  /** Когда начался текущий этап ожидания. */
  startedAt: number;
}

// Ожидание геопозиции, которое видит курьер (для обратного отсчёта).
let waitState: GeolocationWaitState | null = null;
let waitToken = 0;
const waitListeners = new Set<() => void>();

function setWaitDeadline(deadlineAt: number | null): void {
  waitState = deadlineAt === null ? null : { deadlineAt, startedAt: Date.now() };
  waitListeners.forEach((listener) => listener());
}

export function getGeolocationWaitState(): GeolocationWaitState | null {
  return waitState;
}

export function getGeolocationWaitDeadline(): number | null {
  return waitState?.deadlineAt ?? null;
}

export function subscribeGeolocationWait(listener: () => void): () => void {
  waitListeners.add(listener);
  return () => {
    waitListeners.delete(listener);
  };
}

function isGeolocationError(value: unknown): value is GeolocationPositionError {
  return Boolean(value && typeof value === 'object' && 'code' in value);
}

function errorMessageOf(error: unknown): string {
  if (isGeolocationError(error)) {
    return String(error.message ?? '');
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error ?? '');
}

function errorCodeOf(error: unknown): number | null {
  if (isGeolocationError(error) && typeof error.code === 'number') {
    return error.code;
  }

  return null;
}

export function describeGeolocationError(error: unknown): {
  text: string;
  canContinue: boolean;
} {
  const code = errorCodeOf(error);
  const raw = errorMessageOf(error).toLowerCase();

  if (
    code === 1 ||
    raw.includes('denied') ||
    raw.includes('permission') ||
    raw.includes('secure origins')
  ) {
    if (raw.includes('secure origin')) {
      return {
        text: 'Геолокация недоступна в этом браузере.\n\nОткройте приложение по ссылке https и разрешите доступ к местоположению.',
        canContinue: false,
      };
    }

    return {
      text: 'Нет доступа к геолокации.\n\nРазрешите доступ к местоположению в настройках браузера или телефона, затем повторите действие.',
      canContinue: false,
    };
  }

  if (code === 3 || raw.includes('timeout')) {
    return {
      text: 'Местоположение определяется слишком долго.\n\nПроверьте GPS и интернет. Можно продолжить без точной точки.',
      canContinue: true,
    };
  }

  if (code === 2 || raw.includes('unavailable')) {
    return {
      text: 'Не удалось определить местоположение.\n\nВключите GPS и выйдите на открытое место. Если сигнал слабый, повторите через несколько секунд.',
      canContinue: true,
    };
  }

  if (!('geolocation' in navigator)) {
    return {
      text: 'Браузер не определяет местоположение.\n\nОбновите браузер или откройте приложение в Chrome либо Safari.',
      canContinue: false,
    };
  }

  return {
    text: 'Не удалось определить местоположение.\n\nПроверьте GPS, интернет и разрешение на геолокацию, затем повторите действие.',
    canContinue: false,
  };
}

async function queryGeolocationPermission(): Promise<GeolocationPermissionState> {
  try {
    const permissions = navigator.permissions;

    if (!permissions?.query) {
      return 'unknown';
    }

    const status = await permissions.query({ name: 'geolocation' as PermissionName });

    if (status.state === 'granted' || status.state === 'denied' || status.state === 'prompt') {
      return status.state;
    }
  } catch {
    return 'unknown';
  }

  return 'unknown';
}

function requestPosition(options: PositionOptions): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => reject(error),
      options
    );
  });
}

function toResult(
  coords: GeolocationCoordinates | null,
  blocked: boolean,
  message: string | null
): GeolocationReadResult {
  return {
    latitude: coords ? String(coords.latitude) : '',
    longitude: coords ? String(coords.longitude) : '',
    blocked,
    message,
  };
}

export async function readDriverPosition(
  options: ReadDriverPositionOptions = {}
): Promise<GeolocationReadResult> {
  if (!options.showWait) {
    return readPosition(() => undefined);
  }

  const token = ++waitToken;
  const markStage = (timeoutMs: number) => {
    if (token === waitToken) setWaitDeadline(Date.now() + timeoutMs);
  };

  try {
    return await readPosition(markStage);
  } finally {
    if (token === waitToken) setWaitDeadline(null);
  }
}

async function readPosition(
  markStage: (remainingMs: number) => void
): Promise<GeolocationReadResult> {
  if (!('geolocation' in navigator)) {
    const described = describeGeolocationError(new Error('Geolocation is not supported'));

    return toResult(null, true, described.text);
  }

  const permission = await queryGeolocationPermission();

  if (permission === 'denied') {
    return toResult(
      null,
      true,
      describeGeolocationError({ code: 1, message: 'User denied Geolocation' }).text
    );
  }

  try {
    // Вторая попытка может понадобиться, поэтому отсчёт сразу включает её время.
    markStage(FIRST_TRY_TIMEOUT_MS + RETRY_TIMEOUT_MS);
    const coords = await requestPosition({
      enableHighAccuracy: true,
      timeout: FIRST_TRY_TIMEOUT_MS,
      maximumAge: 0,
    });

    return toResult(coords, false, null);
  } catch (firstError) {
    const first = describeGeolocationError(firstError);

    if (!first.canContinue) {
      return toResult(null, true, first.text);
    }

    try {
      markStage(RETRY_TIMEOUT_MS);
      const coords = await requestPosition({
        enableHighAccuracy: false,
        timeout: RETRY_TIMEOUT_MS,
        maximumAge: 60000,
      });

      return toResult(coords, false, null);
    } catch (retryError) {
      const retry = describeGeolocationError(retryError);

      if (!retry.canContinue) {
        return toResult(null, true, retry.text);
      }

      return toResult(null, false, null);
    }
  }
}
