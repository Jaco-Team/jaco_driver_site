import { describe, expect, it } from 'vitest';
import { resolveMarkerTheme } from './markerTheme';

describe('marker theme contrast', () => {
  describe.each(['transparent', 'transparent_white'])('%s', (theme) => {
    it.each([false, true])('follows the effective dark theme: %s', (isDark) => {
      expect(resolveMarkerTheme(theme, isDark)).toBe(isDark ? 'transparent_white' : 'transparent');
    });
  });

  describe.each(['white', 'white_border', 'black', 'classic'])('%s', (theme) => {
    it.each([false, true])('keeps a fixed marker theme in dark mode: %s', (isDark) => {
      expect(resolveMarkerTheme(theme, isDark)).toBe(theme);
    });
  });
});
