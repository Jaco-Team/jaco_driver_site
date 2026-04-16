export function formatPhoneNumber(phone: unknown): string {
  const source = `${phone ?? ''}`.trim();
  const digits = source.replace(/\D/g, '');

  if (digits.length !== 11) {
    return source;
  }

  const prefix = digits[0];
  const rest = digits.slice(1);

  if (rest.startsWith('9')) {
    return `${prefix} (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6, 8)}-${rest.slice(8, 10)}`;
  }

  return `${prefix} (${rest.slice(0, 4)}) ${rest.slice(4, 6)}-${rest.slice(6, 8)}-${rest.slice(8, 10)}`;
}
