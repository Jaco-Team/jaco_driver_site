import {
  MAX_GLOBAL_FONT_SIZE,
  MIN_GLOBAL_FONT_SIZE,
  normalizeGlobalFontSize,
} from '@/shared/lib/fontSize';

export function normalizeFeedbackFontSize(value: number | null | undefined): number {
  return normalizeGlobalFontSize(value);
}

export function clampFeedbackFontSize(value: number, min: number, max: number): number {
  const normalizedMin = Math.min(MAX_GLOBAL_FONT_SIZE, Math.max(MIN_GLOBAL_FONT_SIZE, min));
  const normalizedMax = Math.min(MAX_GLOBAL_FONT_SIZE, Math.max(normalizedMin, max));

  return Math.min(normalizedMax, Math.max(normalizedMin, value));
}
