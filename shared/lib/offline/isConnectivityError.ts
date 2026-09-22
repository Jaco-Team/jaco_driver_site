import { AxiosError } from 'axios';

import { getApiErrorInfo } from '@/shared/api/errors';

export function isConnectivityError(error: unknown): boolean {
  const axiosError = error as AxiosError | undefined;
  const code = axiosError?.code;

  if (code === 'ERR_NETWORK' || code === 'ECONNABORTED' || code === 'ETIMEDOUT') {
    return true;
  }

  return getApiErrorInfo(error).isNetwork;
}
