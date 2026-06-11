import { connector } from '@/shared/api/connector';
import { apiRoutes } from '@/shared/api/routes';
import { DriverSettingsPayload } from '@/entities/settings/model/types';

export interface PointPhonesPayload {
  phone_upr?: string | null;
  phone_man?: string | null;
  phone_center?: string | null;
}

export async function fetchDriverSettings(): Promise<DriverSettingsPayload> {
  const data = await connector.rest.get<DriverSettingsPayload>(apiRoutes.settings.get);
  if (data && typeof data === 'object') {
    return data;
  }

  return {};
}

function normalizePointId(value?: string | number | null): number | null {
  if (value === undefined || value === null || `${value}`.trim() === '') {
    return null;
  }

  const parsed = typeof value === 'number' ? value : parseInt(`${value}`, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function fetchDriverAverageTime(pointId?: string | number | null): Promise<string> {
  const normalizedPointId = normalizePointId(pointId);
  const payload: { point_id?: number } = {};

  if (normalizedPointId !== null) {
    payload.point_id = normalizedPointId;
  }

  const data = await connector.rest.post<{ text?: string | number }, typeof payload>(
    apiRoutes.settings.avgTime,
    payload
  );

  return `${data?.text ?? '00:00:00'}`;
}

export async function fetchPointPhones(
  pointId?: string | number | null
): Promise<PointPhonesPayload | null> {
  const normalizedPointId = normalizePointId(pointId);

  if (normalizedPointId === null) {
    return null;
  }

  const payload = {
    point_id: normalizedPointId,
  };

  const data = await connector.rest.post<{ phone?: PointPhonesPayload }, typeof payload>(
    apiRoutes.settings.pointPhones,
    payload
  );

  return data?.phone ?? null;
}

export async function saveDriverPosition(
  latitude?: number | string,
  longitude?: number | string
): Promise<void> {
  await connector.rest.post(apiRoutes.settings.savePosition, {
    latitude,
    longitude,
  });
}
