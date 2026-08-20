export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeCssColor(value: unknown, fallback = 'blue'): string {
  const color = String(value ?? '').trim();

  if (/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color)) {
    return color;
  }

  if (/^[a-zA-Z]{1,32}$/.test(color)) {
    return color;
  }

  if (
    /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/.test(color)
  ) {
    return color;
  }

  return fallback;
}

export function sanitizeCssIdent(value: unknown, fallback = 'default'): string {
  const ident = String(value ?? '').replace(/[^a-zA-Z0-9_-]/g, '');

  return ident || fallback;
}
