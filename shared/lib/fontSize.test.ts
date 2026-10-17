import { describe, expect, it } from 'vitest';
import {
  DEFAULT_GLOBAL_FONT_SIZE,
  MAX_GLOBAL_FONT_SIZE,
  MIN_GLOBAL_FONT_SIZE,
  normalizeGlobalFontSize,
  scaleGlobalFontSize,
} from './fontSize';

describe('global font size', () => {
  it('uses range 10–26 and default value 16', () => {
    expect(MIN_GLOBAL_FONT_SIZE).toBe(10);
    expect(DEFAULT_GLOBAL_FONT_SIZE).toBe(16);
    expect(MAX_GLOBAL_FONT_SIZE).toBe(26);
  });

  it.each([
    [9, 10],
    [10, 10],
    [16, 16],
    [22, 22],
    [26, 26],
    [27, 26],
    [40, 26],
    ['22px', 22],
    ['invalid', 16],
  ])('normalizes %p to %p', (value, expected) => {
    expect(normalizeGlobalFontSize(value)).toBe(expected);
  });

  it('keeps the current typography at 16 and never exceeds 26', () => {
    expect(scaleGlobalFontSize(14, 16)).toBe(14);
    expect(scaleGlobalFontSize(20, 16)).toBe(20);
    expect(scaleGlobalFontSize(20, 22)).toBe(26);
    expect(scaleGlobalFontSize(32, 16)).toBe(26);
    expect(scaleGlobalFontSize(16, 10)).toBe(10);
    expect(scaleGlobalFontSize(14, 26, 12, 18)).toBe(18);
  });
});
