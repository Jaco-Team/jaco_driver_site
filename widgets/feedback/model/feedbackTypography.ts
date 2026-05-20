const DEFAULT_GLOBAL_FONT_SIZE = 16;
const MIN_GLOBAL_FONT_SIZE = 10;
const MAX_GLOBAL_FONT_SIZE = 40;

export function normalizeFeedbackFontSize(value: number | null | undefined): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_GLOBAL_FONT_SIZE;
  }

  return Math.min(MAX_GLOBAL_FONT_SIZE, Math.max(MIN_GLOBAL_FONT_SIZE, parsed));
}

export function clampFeedbackFontSize(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
