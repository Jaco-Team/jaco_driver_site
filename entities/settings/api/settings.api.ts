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

export async function fetchDriverAverageTime(): Promise<string> {
  const data = await connector.rest.get<{ text?: string | number }>(apiRoutes.settings.avgTime);
  return `${data?.text ?? '00:00:00'}`;
}

export async function fetchPointPhones(
  pointId?: string | number | null
): Promise<PointPhonesPayload | null> {
  if (pointId === undefined || pointId === null || `${pointId}`.trim() === '') {
    return null;
  }

  const payload = {
    point_id: typeof pointId === 'number' ? pointId : parseInt(`${pointId}`, 10),
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
