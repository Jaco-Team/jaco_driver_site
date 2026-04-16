import { http } from '@/shared/api/client';
import { SettingsData } from '@/entities/settings/model/types';

export interface PointPhonesPayload {
  phone_upr?: string | null;
  phone_man?: string | null;
  phone_center?: string | null;
}

export async function fetchDriverSettings(): Promise<SettingsData> {
  const { data } = await http.get<{ settings?: SettingsData }>('/api/v1/settings/get');

  if (data?.settings && typeof data.settings === 'object') {
    return data.settings;
  }

  if (data && typeof data === 'object') {
    return data as SettingsData;
  }

  return {};
}

export async function fetchDriverAverageTime(): Promise<string> {
  const { data } = await http.get<{ text?: string | number }>('/api/v1/settings/avg-time');
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

  const { data } = await http.post<{ phone?: PointPhonesPayload }>(
    '/api/v1/settings/get_point_phones',
    payload
  );

  return data?.phone ?? null;
}

export async function saveDriverPosition(
  latitude?: number | string,
  longitude?: number | string
): Promise<void> {
  await http.post('/api/v1/settings/save-position', {
    latitude,
    longitude,
  });
}
