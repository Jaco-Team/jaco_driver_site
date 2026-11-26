import { apiConfig, joinUrl } from '@/shared/api/config';
import { connector } from '@/shared/api/connector';
import { apiRoutes } from '@/shared/api/routes';

export type CabinetPromo = {
  id: number;
  code: string;
  description: string;
  conditions: string;
  valid_until: string | null;
  time_from: string | null;
  time_to: string | null;
  uses_left: number;
};

type CabinetSource =
  | 'photo_url'
  | 'appointment_name'
  | 'workplace_name'
  | 'health_book'
  | 'instructions'
  | 'issued_clothes'
  | 'promos';

export type CabinetHealthBook = {
  status: 'valid' | 'expiring' | 'expired' | 'missing';
  valid_until: string | null;
  items?: { type: number; name: string; valid_until: string | null }[];
};

export type CabinetData = {
  photo_url: string | null;
  appointment_name: string | null;
  workplace_name: string | null;
  registration_date: string | null;
  experience_months: number | null;
  health_book: CabinetHealthBook | null;
  instructions: { id: number; name: string; url: string | null }[];
  issued_clothes: { id: number; name: string; issued_on: string | null }[];
  promos: CabinetPromo[];
  unavailable: CabinetSource[];
};

export function fetchCabinet(token: string, signal: AbortSignal) {
  return connector.rest.get<CabinetData>(apiRoutes.cabinet, {
    signal,
    timeout: apiConfig.sessionTimeoutMs,
    headers: token ? { 'X-Driver-Expected-Token': token } : undefined,
  });
}

export function resolveCabinetPhotoUrl(
  value: string | null | undefined,
  showTestPhoto: boolean
): string | null {
  if (!value) return null;
  if (/^https:\/\//i.test(value)) return value;
  return showTestPhoto && /^\/lk-fixtures\/LK-TEST-\d+\.png$/.test(value)
    ? joinUrl(apiConfig.mediaOrigin, value)
    : null;
}
