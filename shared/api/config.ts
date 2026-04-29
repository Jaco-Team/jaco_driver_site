const DEFAULT_API_ORIGIN = 'http://localhost:8080';

function readEnv(key: string): string | undefined {
  const value = process.env[key];

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
  return normalizeBaseUrl(
    readEnv('NEXT_PUBLIC_API_ORIGIN') ?? readEnv('NEXT_PUBLIC_API_URL') ?? DEFAULT_API_ORIGIN
  );
}

function resolveLegacyApiOrigin(apiOrigin: string): string {
  return normalizeBaseUrl(
    readEnv('NEXT_PUBLIC_LEGACY_API_ORIGIN') ?? readEnv('NEXT_PUBLIC_LEGACY_API_URL') ?? apiOrigin
  );
}

function resolveMediaOrigin(apiOrigin: string): string {
  return normalizeBaseUrl(readEnv('NEXT_PUBLIC_MEDIA_ORIGIN') ?? apiOrigin);
}

const apiOrigin = resolveApiOrigin();

export const apiConfig = {
  apiOrigin,
  legacyApiOrigin: resolveLegacyApiOrigin(apiOrigin),
  mediaOrigin: resolveMediaOrigin(apiOrigin),
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;
