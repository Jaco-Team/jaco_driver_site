import type { HomeLocation } from '@/entities/order/model/order.types';

export function getOfflineMapRegionId(
  pointId: number | string | null,
  home: HomeLocation | null
): string | null {
  if (pointId !== null) return String(pointId).trim() || null;

  const [latitude, longitude] = home?.center ?? [];
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 85.05112878 ||
    Math.abs(longitude) > 180
  ) {
    return null;
  }

  // Without a settings filter, keep each server-provided cafe in its own region.
  return `home:${latitude.toFixed(6)}:${longitude.toFixed(6)}`;
}
