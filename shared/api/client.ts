import { http } from '@/shared/api/connector';
import { getApiErrorInfo, getAuthErrorMessage } from '@/shared/api/errors';

export type { ApiResponse, User, ErrorInfo } from '@/shared/api/types';

export { http, getApiErrorInfo, getAuthErrorMessage };
