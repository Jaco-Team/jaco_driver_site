const DEFAULT_API_ORIGIN = 'https://apidriver.jacochef.ru';

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

const apiOrigin = resolveApiOrigin();

export const apiConfig = {
  apiOrigin,
  mediaOrigin: resolveMediaOrigin(apiOrigin),
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;
