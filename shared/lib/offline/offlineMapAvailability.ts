import type { OfflineMapMetadata } from './yandexOfflineMap';

export type OfflineMapAvailability =
  'ready' | 'checking' | 'missing' | 'expired' | 'incomplete' | 'assets_missing';

export function getOfflineMapAvailability(
  metadata: OfflineMapMetadata | undefined,
  now = Date.now(),
  assetsReady: boolean | null = true
): OfflineMapAvailability {
  if (!metadata) return 'missing';
  if (!Number.isFinite(metadata.expiresAt) || metadata.expiresAt <= now) return 'expired';
  if (metadata.incomplete) return 'incomplete';
  if (assetsReady === null) return 'checking';
  if (!assetsReady) return 'assets_missing';
  return 'ready';
}

export function getOfflineMapUnavailableReason(availability: OfflineMapAvailability): string {
  switch (availability) {
    case 'checking':
      return 'Проверяем сохранённую карту.';
    case 'expired':
      return 'Срок хранения карты истёк. Скачайте её заново с интернетом.';
    case 'incomplete':
      return 'Карта скачана не полностью. Продолжите скачивание с интернетом.';
    case 'assets_missing':
      return 'Подготовка офлайн-карты не завершена. Повторите с интернетом.';
    default:
      return 'Карта этого города не скачана. Скачайте её с интернетом.';
  }
}
