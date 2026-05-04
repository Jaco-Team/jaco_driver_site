import { ensureCsrfCookie, http } from '@/shared/api/connector';
import { getApiErrorInfo, getAuthErrorMessage } from '@/shared/api/errors';

export type { ApiResponse, User, ErrorInfo } from '@/shared/api/types';

export { http, ensureCsrfCookie, getApiErrorInfo, getAuthErrorMessage };

export const log = (event: string, message: string, data?: any): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${event}]`, message, data || '');
  }
};
