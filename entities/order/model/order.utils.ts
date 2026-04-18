import { Order, TYPE_SHOW_DEL_FROM_INT, TYPE_SHOW_DEL_TO_INT } from './order.types';

export function normalizeOrderRow(order: any): Order {
  if (!order || typeof order !== 'object') {
    return {
      drink_list: [],
      pd: '',
      et: '',
      kv: '',
      comment: '',
      id: 0,
    };
  }

  return {
    ...order,
    drink_list: Array.isArray(order.drink_list) ? order.drink_list : [],
    pd: order.pd ?? '',
    et: order.et ?? '',
    kv: order.kv ?? '',
    comment: order.comment ?? '',
    id: order.id ?? 0,
  };
}

export function normalizeTypeDataMapForApi(value: any): string {
  if (Array.isArray(value)) {
    const firstValue = normalizeModeString(value[0]);
    return firstValue || 'norm';
  }

  const normalized = normalizeModeString(value);
  return normalized || 'norm';
}

export function normalizeTypeDataMapForUi(value: any): string {
  if (Array.isArray(value)) {
    return normalizeModeString(value[0]) || 'norm';
  }

  const normalized = normalizeModeString(value);
  return normalized || 'norm';
}

export function normalizeTypeShowDelForApi(value: any): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  const normalized = `${value ?? ''}`.trim().toLowerCase();
  if (/^-?\d+$/.test(normalized)) {
    return parseInt(normalized, 10);
  }

  return TYPE_SHOW_DEL_TO_INT[normalized] ?? TYPE_SHOW_DEL_TO_INT.min;
}

export function normalizeTypeShowDelForUi(value: any): string {
  const normalized = `${value ?? ''}`.trim().toLowerCase();

  if (normalized in TYPE_SHOW_DEL_TO_INT) {
    return normalized;
  }

  if (/^-?\d+$/.test(normalized)) {
    return TYPE_SHOW_DEL_FROM_INT[parseInt(normalized, 10)] ?? 'min';
  }

  return 'min';
}

export function normalizeModeString(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  let normalized = `${value}`.trim();
  if (!normalized) {
    return '';
  }

  try {
    const parsed = JSON.parse(normalized);
    if (Array.isArray(parsed)) {
      normalized = `${parsed[0] ?? ''}`.trim();
    } else if (typeof parsed === 'string' || typeof parsed === 'number') {
      normalized = `${parsed}`.trim();
    }
  } catch {
    // keep original normalized value
  }

  while (
    normalized.length >= 2 &&
    ((normalized.startsWith('"') && normalized.endsWith('"')) ||
      (normalized.startsWith("'") && normalized.endsWith("'")))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }

  return normalized;
}

export function filterOrdersByTypes(
  orders: Order[],
  types: string[],
  typeToStatus: Record<number, string>
): Order[] {
  const statuses = types.map((type) => typeToStatus[parseInt(type)]);
  return orders.filter((order) => statuses.includes(order.status || ''));
}
