export const DRIVER_YANDEX_METRIKA_ID = '104768072';

export function resolveYandexMetrikaIds(
  envValue: unknown = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
): string[] {
  const fromEnv = String(envValue ?? '')
    .split(/[,\s]+/)
    .map((id) => id.trim())
    .filter(Boolean);

  return [...new Set([...fromEnv, DRIVER_YANDEX_METRIKA_ID])];
}
