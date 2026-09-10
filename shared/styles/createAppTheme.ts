import { createTheme } from '@mui/material/styles';

import { appDarkPalette, appPalette } from './appPalette';

export function createAppTheme(darkMode: boolean) {
  const isDark = Boolean(darkMode);

  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: appPalette.brand,
        dark: appPalette.brandDark,
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: appPalette.primary,
        dark: appPalette.primaryDark,
        contrastText: '#FFFFFF',
      },
      error: {
        main: appPalette.error,
      },
      background: {
        default: isDark ? appDarkPalette.background : appPalette.surface,
        paper: isDark ? appDarkPalette.surface : '#FFFFFF',
      },
      text: {
        primary: isDark ? appDarkPalette.text : appPalette.text,
        secondary: isDark ? appDarkPalette.textMuted : appPalette.textMuted,
      },
      divider: isDark ? appDarkPalette.border : appPalette.border,
      action: {
        hover: isDark ? 'rgba(117, 147, 173, 0.10)' : appPalette.softHover,
        selected: isDark ? 'rgba(117, 147, 173, 0.16)' : appPalette.soft,
      },
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    },
  });
}
