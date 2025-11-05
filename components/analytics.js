function sendToAllCounters(cb) {
  if (typeof window === 'undefined') return;
  const ym = window.ym;
  const ids = window.__ymIds;
  if (!ym || !Array.isArray(ids) || !ids.length) return;
  ids.forEach(id => { try { cb(id); } catch(e) {} });
}

/** отправка события в Метрику */
export function log(event, label, params, opts) {
  const payload = { ...(params || {}), ...(label ? { label } : {}) };
  if (typeof window !== 'undefined') {
    console.debug('[YM] reachGoal', { event, payload, ids: window.__ymIds });
  }
  sendToAllCounters(id => {
    const cb = opts && typeof opts.callback === 'function' ? opts.callback : undefined;
    window.ym(id, 'reachGoal', event, Object.keys(payload).length ? payload : undefined, cb);
  });
}

/** Читаемые названия страниц */
const PAGE_TITLES = {
  '/list_orders': 'Список заказов',
  '/map_orders':  'Карта заказов',
  '/price': 'Расчёт',
  '/graph': 'График работы',
  '/statistics': 'Статистика',
  '/settings': 'Настройки',
  '/auth': 'Авторизация',
  '/registration':'Восстановление пароля',
  '/initial': 'Стартовая',
};

/** Резолвим человекочитаемый title для URL */
export function resolveTitle(url, explicitTitle) {
  try {
    if (explicitTitle) return explicitTitle;
    const path = new URL(url, location.origin).pathname;
    return PAGE_TITLES[path] || document.title || path;
  } catch {
    return explicitTitle || document.title || String(url);
  }
}

/** Хит просмотра страницы (SPA) — назад совместим: hit(url) или hit(url, title) */
export function hit(url, title) {
  const finalTitle = resolveTitle(url, title);
  sendToAllCounters(id => {
    window.ym(id, 'hit', url, { title: finalTitle });
  });
}

/** "Открытие страницы ${title}" */
export function screenOpen(urlOrTitle) {
  const isUrl = typeof urlOrTitle === 'string' && /^(\/|https?:\/\/)/.test(urlOrTitle);
  const title = isUrl ? resolveTitle(urlOrTitle) : String(urlOrTitle);
  log('screen_open', `Открытие страницы ${title}`);
}

// хвост телефона (последние N цифр)
function phoneSuffix(phone, n = 4) {
  return String(phone || '').replace(/\D/g, '').slice(-n);
}

// готовая функция для tel-кликов — вызываем прямо из onClick
export function logTel(goal, phone, label, e) {
  try { e?.preventDefault?.(); } catch {}
  let done = false;
  const go = () => { if (done) return; done = true; location.href = `tel:${phone}`; };
  log(goal, label, { phone_last: phoneSuffix(phone) }, { callback: go });
  setTimeout(go, 200);
}
