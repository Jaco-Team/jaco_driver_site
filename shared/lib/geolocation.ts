export type GeolocationPermissionState = 'granted' | 'denied' | 'prompt' | 'unknown';

export interface GeolocationReadResult {
  latitude: string;
  longitude: string;
  blocked: boolean;
  message: string | null;
}

const FIRST_TRY_TIMEOUT_MS = 15000;
const RETRY_TIMEOUT_MS = 10000;

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

export async function readDriverPosition(): Promise<GeolocationReadResult> {
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
