import '../styles/globals.scss';

import '../styles/initial.scss';
import '../styles/price.scss';
import '../styles/graph.scss';
import '../styles/list.scss';
import '../styles/map.scss';
import '../styles/order_card.scss';
import '../styles/auth.scss';
import '../styles/auth-sso.scss';
import '../styles/settings.scss';
import '../styles/setting_style.scss';
import 'maplibre-gl/dist/maplibre-gl.css';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
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
import { SessionLoading } from '@/features/auth/ui/SessionLoading';
import { useHeaderStore } from '@/features/header/model/header.store';
import { resolveYandexMetrikaIds } from '@/shared/lib/yandexMetrikaIds';
import { useConnectivityWatch } from '@/features/offline/model/useConnectivityWatch';
import { useServiceWorker } from '@/features/offline/model/useServiceWorker';
import { useOfflineCityDownloads } from '@/features/offline-map/model/useOfflineCityDownloads';
import {
  isLocalCabinetPreviewEnabled,
  readDevCabinetOptions,
} from '@/shared/config/cabinetPreview';
import { prepareOfflineCabinetPage } from '@/shared/lib/offline/offlineMapAssets';
import { DEFAULT_GLOBAL_FONT_SIZE, normalizeGlobalFontSize } from '@/shared/lib/fontSize';

const YANDEX_METRIKA_IDS = resolveYandexMetrikaIds();

const clientEmotionCache = createEmotionCache({ key: 'css' });
const PUBLIC_ROUTES = new Set(['/auth', '/auth/callback', '/registration', '/initial']);
const EXCLUDED_GLOBAL_FONT_ROUTES = new Set(['/list_orders', '/map_orders']);

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
  const isCabinetRoute = router.pathname === '/lk';
  const isCabinetQueryPending = isCabinetRoute && isLocalCabinetPreviewEnabled() && !router.isReady;
  const cabinetOptions =
    isCabinetRoute && router.isReady && typeof window !== 'undefined'
      ? readDevCabinetOptions(router.query, window.location.host)
      : undefined;
  const cabinetPreview = cabinetOptions?.cabinetPreview;
  const isPublicRoute = PUBLIC_ROUTES.has(router.pathname) || Boolean(cabinetPreview);
  const authStatus = useSyncExternalStore(
    useAuthStore.subscribe,
    () => useAuthStore.getState().session.isAuth,
    () => 'load' as const
  );
  const globalFontSize = useHeaderStore((state) => state.globalFontSize);
  const storedDarkTheme = useHeaderStore((state) => state.darkTheme);
  const darkTheme = cabinetPreview?.theme ? cabinetPreview.theme === 'dark' : storedDarkTheme;
  const isOnline = useConnectivityWatch();
  useServiceWorker();
  useOfflineCityDownloads();
  const muiTheme = useMemo(() => createAppTheme(darkTheme), [darkTheme]);
  const normalizedGlobalFontSize = normalizeGlobalFontSize(globalFontSize);
  const appFontSize =
    cabinetPreview?.fontSize ??
    (EXCLUDED_GLOBAL_FONT_ROUTES.has(router.pathname)
      ? DEFAULT_GLOBAL_FONT_SIZE
      : normalizedGlobalFontSize);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const syncDeviceTheme = () => {
      useHeaderStore.getState().setDeviceDarkTheme(media.matches);
    };

    syncDeviceTheme();
    media.addEventListener?.('change', syncDeviceTheme);

    return () => {
      media.removeEventListener?.('change', syncDeviceTheme);
    };
  }, []);

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
    if (isPublicRoute || isCabinetQueryPending) {
      return;
    }

    if (useAuthStore.getState().session.isAuth !== 'load') {
      return;
    }

    void useAuthStore.getState().refreshSession();
  }, [isCabinetQueryPending, isPublicRoute, router.pathname]);

  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' ||
      process.env.NEXT_PUBLIC_ENABLE_SW === '0' ||
      authStatus !== true ||
      !isOnline
    ) {
      return;
    }

    void prepareOfflineCabinetPage().catch((error) => {
      devLog('offline_cabinet_cache_failed', 'Не удалось сохранить экран ЛК для офлайна', error);
    });
  }, [authStatus, isOnline]);

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
        {isCabinetQueryPending || (authStatus === 'load' && !isPublicRoute) ? (
          <SessionLoading fontSize={normalizedGlobalFontSize} />
        ) : (
          <Component {...pagePropsWithoutSession} {...cabinetOptions} />
        )}
      </ThemeProvider>
    </AppCacheProvider>
  );
}

export default MyApp;
