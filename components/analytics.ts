import type { MouseEvent } from 'react';

type YandexMetrikaWindow = Window & {
  ym?: (
    id: number | string,
    method: 'reachGoal' | 'hit',
    target: string,
    params?: Record<string, unknown>,
    callback?: () => void
  ) => void;
  __ymIds?: Array<number | string>;
};

type AnalyticsParams = Record<string, unknown>;

type AnalyticsOptions = {
  callback?: () => void;
};

function getAnalyticsWindow(): YandexMetrikaWindow {
  return window as YandexMetrikaWindow;
}

function sendToAllCounters(cb: (id: number | string) => void) {
  if (typeof window === 'undefined') return;
  const analyticsWindow = getAnalyticsWindow();
  const ym = analyticsWindow.ym;
  const ids = analyticsWindow.__ymIds;
  if (!ym || !Array.isArray(ids) || !ids.length) return;
  ids.forEach((id) => {
    try {
      cb(id);
    } catch {}
  });
}

export function log(
  event: string,
  label?: string,
  params?: AnalyticsParams,
  opts?: AnalyticsOptions
) {
  const payload = { ...(params || {}), ...(label ? { label } : {}) };
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.debug('[YM] reachGoal', { event, payload, ids: getAnalyticsWindow().__ymIds });
  }
  sendToAllCounters((id) => {
    const cb = opts && typeof opts.callback === 'function' ? opts.callback : undefined;
    getAnalyticsWindow().ym?.(
      id,
      'reachGoal',
      event,
      Object.keys(payload).length ? payload : undefined,
      cb
    );
  });
}

const PAGE_TITLES: Record<string, string> = {
  '/list_orders': 'Список заказов',
  '/map_orders': 'Карта заказов',
  '/price': 'Расчёт',
  '/graph': 'График работы',
  '/statistics': 'Статистика',
  '/settings': 'Настройки',
  '/auth': 'Авторизация',
  '/auth/callback': 'SSO авторизация',
  '/registration': 'Восстановление пароля',
  '/initial': 'Стартовая',
};

function resolveTitle(url: string, explicitTitle?: string) {
  try {
    if (explicitTitle) return explicitTitle;
    const path = new URL(url, location.origin).pathname;
    return PAGE_TITLES[path] || document.title || path;
  } catch {
    return explicitTitle || document.title || String(url);
  }
}

export function hit(url: string, title?: string) {
  const finalTitle = resolveTitle(url, title);
  sendToAllCounters((id) => {
    getAnalyticsWindow().ym?.(id, 'hit', url, { title: finalTitle });
  });
}

export function screenOpen(urlOrTitle: string) {
  const isUrl = typeof urlOrTitle === 'string' && /^(\/|https?:\/\/)/.test(urlOrTitle);
  const title = isUrl ? resolveTitle(urlOrTitle) : String(urlOrTitle);
  log('screen_open', `Открытие страницы ${title}`);
}

function phoneSuffix(phone: string, n = 4) {
  return String(phone || '')
    .replace(/\D/g, '')
    .slice(-n);
}

export function logTel(goal: string, phone: string, label?: string, e?: MouseEvent) {
  try {
    e?.preventDefault?.();
  } catch {}
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    location.href = `tel:${phone}`;
  };
  log(goal, label, { phone_last: phoneSuffix(phone) }, { callback: go });
  setTimeout(go, 200);
}
