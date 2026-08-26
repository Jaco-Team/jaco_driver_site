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

import { useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { AppProps, NextWebVitalsMetric } from 'next/app';
import { log, hit, screenOpen } from '@/components/analytics';
import type { EmotionCache } from '@emotion/react';

import { AppCacheProvider, createEmotionCache } from '@mui/material-nextjs/v16-pagesRouter';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import { createAppTheme } from '@/shared/styles/createAppTheme';
import { devLog } from '@/shared/lib/devLog';
import YandexMetrika from '@/components/YandexMetrika';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { useHeaderStore } from '@/features/header/model/header.store';
import { resolveYandexMetrikaIds } from '@/shared/lib/yandexMetrikaIds';

const YANDEX_METRIKA_IDS = resolveYandexMetrikaIds();

const clientEmotionCache = createEmotionCache({ key: 'css' });
const PUBLIC_ROUTES = new Set(['/auth', '/auth/callback', '/registration', '/initial']);
const EXCLUDED_GLOBAL_FONT_ROUTES = new Set(['/list_orders', '/map_orders']);
const DEFAULT_GLOBAL_FONT_SIZE = 16;

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
  const globalFontSize = useHeaderStore((state) => state.globalFontSize);
  const darkTheme = useHeaderStore((state) => state.darkTheme);
  const muiTheme = useMemo(() => createAppTheme(darkTheme), [darkTheme]);
  const normalizedGlobalFontSize =
    Number.isFinite(globalFontSize) && globalFontSize > 0
      ? globalFontSize
      : DEFAULT_GLOBAL_FONT_SIZE;
  const appFontSize = EXCLUDED_GLOBAL_FONT_ROUTES.has(router.pathname)
    ? DEFAULT_GLOBAL_FONT_SIZE
    : normalizedGlobalFontSize;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

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

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.style.fontSize = `${appFontSize}px`;

    return () => {
      document.documentElement.style.fontSize = `${DEFAULT_GLOBAL_FONT_SIZE}px`;
    };
  }, [appFontSize]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const mode = darkTheme ? 'dark' : 'light';
    document.documentElement.dataset.appTheme = mode;
    document.documentElement.style.colorScheme = mode;

    return () => {
      delete document.documentElement.dataset.appTheme;
      document.documentElement.style.colorScheme = '';
    };
  }, [darkTheme]);

  return (
    <AppCacheProvider emotionCache={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline enableColorScheme />
        <YandexMetrika ids={YANDEX_METRIKA_IDS} />
        <Component {...pagePropsWithoutSession} />
      </ThemeProvider>
    </AppCacheProvider>
  );
}

export default MyApp;
