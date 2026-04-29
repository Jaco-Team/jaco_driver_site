import { apiConfig, joinUrl } from '@/shared/api/config';

function normalizeAssetPath(value: string): string {
  return `${value || ''}`.replace(/^\/+/, '');
}

export const apiRoutes = {
  csrfCookie: '/sanctum/csrf-cookie',
  auth: {
    sessionLogin: '/api/v1/auth/session/login',
    tokenLogin: '/api/v1/auth/token/login',
    passwordRecoverySendCode: '/api/v1/auth/password/recovery/send-code',
    passwordRecoveryConfirmCode: '/api/v1/auth/password/recovery/confirm-code',
    me: '/api/v1/auth/me',
    sessionMeta: '/api/v1/auth/session/meta',
    logout: '/api/v1/auth/logout',
  },
  sso: {
    login: '/auth/sso/login',
    logout: '/auth/sso/logout',
  },
  settings: {
    get: '/api/v1/settings/get',
    avgTime: '/api/v1/settings/avg-time',
    points: '/api/v1/settings/points',
    pointPhones: '/api/v1/settings/get_point_phones',
    savePosition: '/api/v1/settings/save-position',
    save: '/api/v1/settings/save',
  },
  graph: {
    root: '/api/v1/graph',
    orderAppeals: '/api/v1/graph/order-appeals',
    cameraAppeals: '/api/v1/graph/camera-appeals',
  },
  orders: {
    getOrders: '/api/v1/orders/get_orders',
    actionOrder: '/api/v1/orders/action_order',
    checkFakeOrder: '/api/v1/orders/check_fake_order',
    getPayQr: '/api/v1/orders/get_pay_qr',
    hideDeletedOrders: '/api/v1/orders/hide_del_orders',
    checkPayOrder: '/api/v1/orders/check_pay_order',
  },
  price: {
    between: '/api/v1/price/between',
  },
} as const;

export function getLegacyModulePath(module: string = ''): string {
  return `${module || ''}`.replace(/^\/+/, '');
}

export function getSsoLoginUrl(): string {
  return joinUrl(apiConfig.apiOrigin, apiRoutes.sso.login);
}

export function resolveGraphErrorImageUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return joinUrl(apiConfig.mediaOrigin, normalizeAssetPath(value));
}
