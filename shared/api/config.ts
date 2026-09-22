const DEFAULT_API_ORIGIN = 'https://apidriver.jacochef.ru';
const ENABLED_ENV_VALUES = ['1', 'true', 'yes'];

function trimEnv(value: string | undefined): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeBaseUrl(value: string | undefined): string {
  return `${value || ''}`.replace(/\/+$/, '');
}

export function joinUrl(base: string, path: string = ''): string {
  const normalizedBase = normalizeBaseUrl(base);
  const normalizedPath = `${path || ''}`.replace(/^\/+/, '');

  return normalizedPath ? `${normalizedBase}/${normalizedPath}` : normalizedBase;
}

function resolveApiOrigin(): string {
  // Next.js inlines NEXT_PUBLIC_* into the client bundle only with static access.
  return normalizeBaseUrl(
    trimEnv(process.env.NEXT_PUBLIC_API_ORIGIN) ??
      trimEnv(process.env.NEXT_PUBLIC_API_URL) ??
      DEFAULT_API_ORIGIN
  );
}

function resolveMediaOrigin(apiOrigin: string): string {
  return normalizeBaseUrl(trimEnv(process.env.NEXT_PUBLIC_MEDIA_ORIGIN) ?? apiOrigin);
}

function isEnvEnabled(value: string | undefined): boolean {
  return ENABLED_ENV_VALUES.includes(`${trimEnv(value) ?? ''}`.toLowerCase());
}

const apiOrigin = resolveApiOrigin();
const isApiProxyEnabled = isEnvEnabled(process.env.NEXT_PUBLIC_API_PROXY);

export const apiConfig = {
  apiOrigin,
  // Same-origin base: next.config.js rewrites /api/v1/* to apiOrigin, so the browser
  // never issues a cross-origin request and a backend without CORS still works.
  apiBaseUrl: isApiProxyEnabled ? '' : apiOrigin,
  isApiProxyEnabled,
  mediaOrigin: resolveMediaOrigin(apiOrigin),
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;
