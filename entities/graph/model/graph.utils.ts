import dayjs, { Dayjs } from 'dayjs';

import {
  GraphCameraError,
  GraphDateCell,
  GraphMonthItem,
  GraphOrderError,
  GraphScheduleCell,
  GraphScheduleRow,
  GraphStateSnapshot,
} from '@/entities/graph/model/types';

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function toStringValue(value: unknown): string {
  return value === null || value === undefined ? '' : `${value}`;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => toStringValue(item)).filter(Boolean) : [];
}

export function formatMoney(value: unknown): string {
  return new Intl.NumberFormat('ru-RU').format(Number(value ?? 0));
}

export function isWeekend(dow: unknown): boolean {
  const normalized = String(dow ?? '')
    .trim()
    .toLowerCase();
  return normalized.includes('сб') || normalized.includes('вс');
}

export function toMonthStart(value: unknown): Dayjs | null {
  if (!value) {
    return null;
  }

  const normalized = String(value).length <= 7 ? `${value}-01` : String(value);
  const parsed = dayjs(normalized);
  return parsed.isValid() ? parsed : null;
}

export function isTruthyFlag(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

export function getRowIdentifier(cellData: GraphScheduleCell | undefined): string {
  return `${cellData?.user_id ?? cellData?.driver_id ?? cellData?.id ?? ''}`;
}

export function normalizeUserName(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

export function isCurrentUserRow(
  rowData: GraphScheduleRow,
  currentUserId: string,
  currentUserName: string
): boolean {
  const firstCell = rowData?.[0];

  if (!firstCell) {
    return false;
  }

  if (isTruthyFlag(firstCell.is_my) || isTruthyFlag(firstCell.is_me)) {
    return true;
  }

  const rowUserName = normalizeUserName(firstCell.user_name);
  const normalizedCurrentUserName = normalizeUserName(currentUserName);

  if (rowUserName && normalizedCurrentUserName && rowUserName === normalizedCurrentUserName) {
    return true;
  }

  const rowIdentifier = getRowIdentifier(firstCell);
  return Boolean(currentUserId) && Boolean(rowIdentifier) && rowIdentifier === `${currentUserId}`;
}

export function isTodayColumn(dayValue: unknown, chooseDate: string): boolean {
  const viewedMonth = toMonthStart(chooseDate);

  if (!viewedMonth || !viewedMonth.isSame(dayjs(), 'month')) {
    return false;
  }

  return Number(dayValue) === dayjs().date();
}

export function normalizeGraphMonthItem(value: unknown): GraphMonthItem {
  const record = toRecord(value);

  return {
    ...record,
    day: toStringValue(record.day),
    mounth: toStringValue(record.mounth),
    is_active: toStringValue(record.is_active),
  };
}

export function normalizeGraphDateCell(value: unknown): GraphDateCell {
  const record = toRecord(value);

  return {
    ...record,
    day: toStringValue(record.day),
    dow: toStringValue(record.dow),
  };
}

export function normalizeGraphScheduleCell(value: unknown): GraphScheduleCell {
  const record = toRecord(value);
  const base = record as Partial<GraphScheduleCell>;

  return {
    ...base,
    user_name: toStringValue(record.user_name),
    hours: toStringValue(record.hours),
    min: record.min ?? '',
    is_my: record.is_my,
    is_me: record.is_me,
  };
}

export function normalizeGraphScheduleRow(value: unknown): GraphScheduleRow {
  return Array.isArray(value) ? value.map((item) => normalizeGraphScheduleCell(item)) : [];
}

export function normalizeGraphOrderError(value: unknown): GraphOrderError {
  const record = toRecord(value);
  const base = record as Partial<GraphOrderError>;

  return {
    ...base,
    date_time_order: toStringValue(record.date_time_order),
    order_desc: toStringValue(record.order_desc),
    item_name: toStringValue(record.item_name),
    pr_name: toStringValue(record.pr_name),
    my_price: record.my_price ?? '',
    imgs: toStringArray(record.imgs),
    new_text_1: toStringValue(record.new_text_1),
    new_text_2: toStringValue(record.new_text_2),
    is_edit: record.is_edit ?? '',
    err_id: record.err_id ?? '',
    row_id: record.row_id ?? '',
    order_id: record.order_id ?? '',
  };
}

export function normalizeGraphCameraError(value: unknown): GraphCameraError {
  const record = toRecord(value);
  const base = record as Partial<GraphCameraError>;

  return {
    ...base,
    date_time_fine: toStringValue(record.date_time_fine),
    fine_name: toStringValue(record.fine_name),
    price: record.price ?? '',
    imgs: toStringArray(record.imgs),
    text_one: toStringValue(record.text_one),
    text_two: toStringValue(record.text_two),
    is_edit: record.is_edit ?? '',
    id: record.id ?? '',
  };
}

export function normalizeGraphResponse(payload: unknown, chooseDate: string): GraphStateSnapshot {
  const record = toRecord(payload);
  const errs = toRecord(record.errs);

  return {
    monthList: Array.isArray(record.mounth)
      ? record.mounth.map((item) => normalizeGraphMonthItem(item))
      : [],
    dates: Array.isArray(record.all_dates)
      ? record.all_dates.map((item) => normalizeGraphDateCell(item))
      : [],
    users: Array.isArray(record.users)
      ? record.users.map((item) => normalizeGraphScheduleRow(item))
      : [],
    currentUserId: toStringValue(record.user_id),
    currentUserName: toStringValue(record.user_name),
    errOrders: Array.isArray(errs.orders)
      ? errs.orders.map((item) => normalizeGraphOrderError(item))
      : [],
    errCam: Array.isArray(errs.err_cam)
      ? errs.err_cam.map((item) => normalizeGraphCameraError(item))
      : [],
    chooseDate,
  };
}

export function getActiveMonthLabel(monthList: GraphMonthItem[]): string {
  return monthList.find((item) => parseInt(String(item.is_active), 10) === 1)?.mounth ?? '';
}
