import type { ParsedUrlQuery } from 'node:querystring';

import { apiConfig } from '@/shared/api/config';
import { normalizeGlobalFontSize } from '@/shared/lib/fontSize';

export type CabinetPreviewOptions = {
  theme: 'light' | 'dark' | null;
  fontSize: number | null;
  showStatistics: boolean;
};

export type CabinetPageOptions = {
  cabinetPreview: CabinetPreviewOptions | null;
  showTestPhoto?: boolean;
};

export function isLocalCabinetPreviewEnabled(): boolean {
  return (
    process.env.NODE_ENV === 'development' &&
    apiConfig.isApiProxyEnabled &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(apiConfig.apiOrigin)
  );
}

export function readDevCabinetOptions(query: ParsedUrlQuery, host: string): CabinetPageOptions {
  if (!isLocalCabinetPreviewEnabled() || !/^localhost(:\d+)?$/i.test(host)) {
    return { cabinetPreview: null };
  }

  if (query.uiPreview !== '1') {
    return query.testPhoto === '1'
      ? { cabinetPreview: null, showTestPhoto: true }
      : { cabinetPreview: null };
  }

  return {
    cabinetPreview: {
      theme: query.theme === 'dark' || query.theme === 'light' ? query.theme : null,
      fontSize: typeof query.font === 'string' ? normalizeGlobalFontSize(query.font) : null,
      showStatistics: query.statistics !== '0',
    },
  };
}
