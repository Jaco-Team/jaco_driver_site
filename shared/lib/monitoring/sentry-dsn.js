// Shared by the Node build config and browser/server SDK initialization.
const SENTRY_ORIGIN = 'https://sentry.jacochef.ru';

/**
 * The DSN is a public routing key. Never fall back to SaaS.
 * @param {string | undefined} value
 * @returns {string | undefined}
 */
function selfHostedDsn(value) {
  if (!value || value !== value.trim()) return undefined;
  try {
    const url = new URL(value);
    if (
      url.origin !== SENTRY_ORIGIN || url.password || url.search || url.hash ||
      !/^[a-zA-Z0-9]{16,64}$/.test(url.username) || !/^\/[0-9]+$/.test(url.pathname)
    ) return undefined;
    return value;
  } catch {
    return undefined;
  }
}

module.exports = { SENTRY_ORIGIN, selfHostedDsn };
