export function resolveMarkerTheme<T extends string>(
  theme: T,
  isDark: boolean
): T | 'transparent' | 'transparent_white' {
  if (theme === 'transparent' || theme === 'transparent_white') {
    return isDark ? 'transparent_white' : 'transparent';
  }

  return theme;
}
