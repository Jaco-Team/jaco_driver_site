import { Order, TYPE_SHOW_DEL_FROM_INT, TYPE_SHOW_DEL_TO_INT } from './order.types';

function emptyOrder(): Order {
  return {
    drink_list: [],
    pd: '',
    et: '',
    kv: '',
    comment: '',
    id: 0,
  };
}

export function normalizeOrderRow(order: unknown): Order {
  if (!order || typeof order !== 'object') {
    return emptyOrder();
  }

  const row = order as Partial<Order>;
  const id = parseInt(`${row.id ?? 0}`, 10);
  const latitude = parseFloat(`${row.xy?.latitude ?? ''}`);
  const longitude = parseFloat(`${row.xy?.longitude ?? ''}`);

  return {
    ...row,
    drink_list: Array.isArray(row.drink_list) ? row.drink_list : [],
    pd: row.pd ?? '',
    et: row.et ?? '',
    kv: row.kv ?? '',
    comment: row.comment ?? '',
    id: Number.isNaN(id) ? 0 : id,
    xy:
      Number.isNaN(latitude) || Number.isNaN(longitude)
        ? row.xy
        : {
            latitude,
            longitude,
          },
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
