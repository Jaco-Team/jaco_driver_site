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
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { AppProps, NextWebVitalsMetric } from 'next/app';
import { log, hit, screenOpen } from '@/components/analytics';
import type { EmotionCache } from '@emotion/react';

import { AppCacheProvider, createEmotionCache } from '@mui/material-nextjs/v16-pagesRouter';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import * as Sentry from '@sentry/react';
import { appPalette } from '@/shared/styles/appPalette';
import { devLog } from '@/shared/lib/devLog';
import YandexMetrika from '@/components/YandexMetrika';
import { useAuthStore } from '@/features/auth/model/auth.store';

const theme = createTheme({
  palette: {
    primary: {
      main: appPalette.brand,
    },
    secondary: {
      main: appPalette.primary,
    },
  },
  typography: {
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});

const clientEmotionCache = createEmotionCache({ key: 'css' });
const PUBLIC_ROUTES = new Set(['/auth', '/auth/callback', '/registration', '/initial']);

export function reportWebVitals(metric: NextWebVitalsMetric) {
  devLog('web_vitals', 'Next web vitals', metric);
}

type MyAppProps = AppProps & { emotionCache?: EmotionCache };

function MyApp(props: MyAppProps) {
  const { Component, pageProps, emotionCache = clientEmotionCache } = props;
  const { session: _session, ...pagePropsWithoutSession } = pageProps as typeof pageProps & {
    session?: unknown;
  };
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

    (window as any).Analytics = { log, hit };

    return () => {
      delete (window as any).Analytics;
    };
  }, []);

  useEffect(() => {
    const send = (url: string) => {
      hit(url);
      screenOpen(url);
    };

    // первый вход
    send(location.pathname + location.search + location.hash);

    // все последующие переходы SPA
    router.events.on('routeChangeComplete', send);
    return () => router.events.off('routeChangeComplete', send);
  }, [router.events]);

  useEffect(() => {
    if (PUBLIC_ROUTES.has(router.pathname)) {
      return;
    }

    if (useAuthStore.getState().session.isAuth !== 'load') {
      return;
    }

    void useAuthStore.getState().refreshSession();
  }, [router.pathname]);

  return (
    <AppCacheProvider emotionCache={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <YandexMetrika yid={104768072} />
        <Component {...pagePropsWithoutSession} />
      </ThemeProvider>
    </AppCacheProvider>
  );
}

export default MyApp;
