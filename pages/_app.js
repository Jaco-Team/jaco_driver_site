import '../styles/globals.scss';

import '../styles/initial.scss';
import '../styles/price.scss';
import '../styles/graph.scss';
import '../styles/list.scss';
import '../styles/map.scss';
import '../styles/order_card.scss';
import '../styles/auth.scss';
import '../styles/settings.scss';
import '../styles/setting_style.scss';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { log, hit, screenOpen } from '@/components/analytics';

import { createTheme, ThemeProvider } from '@mui/material/styles';

import * as Sentry from '@sentry/react';
import { appPalette } from '@/shared/styles/appPalette';
import YandexMetrika from '@/components/YandexMetrika';
import { useLoginStore } from '@/features/auth/model/login.store';
import { refreshSession } from '@/components/sessionHook';

const theme = createTheme({
  palette: {
    primary: {
      main: appPalette.brand,
    },
    secondary: {
      main: appPalette.primary,
    },
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});

export function reportWebVitals(metric) {
  console.log(metric);
}

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    Sentry.init({
      dsn: 'https://0446c6db46dce5a0368f09bc573ad37d@o4505941569830912.ingest.sentry.io/4505946950008832',
      integrations: [],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });

    window.Analytics = { log, hit };

    return () => {
      delete window.Analytics;
    };
  }, []);

  useEffect(() => {
    const send = (url) => {
      hit(url);
      screenOpen(url);
    };

    // первый вход
    send(location.pathname + location.search + location.hash);

    // все последующие переходы SPA
    router.events.on('routeChangeComplete', send);
    return () => router.events.off('routeChangeComplete', send);
  }, [router.events]);

  const checkToken = useLoginStore((state) => state.check_token);
  useEffect(() => {
    const initAuth = async () => {
      await refreshSession();
      await checkToken();
    };

    initAuth();
  }, [checkToken]);

  return (
    <ThemeProvider theme={theme}>
      <YandexMetrika yid={104768072} />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
