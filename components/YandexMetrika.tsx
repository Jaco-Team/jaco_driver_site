import { useCallback, useEffect } from 'react';
import Script from 'next/script';

type YandexMetrikaFunction = {
  (id: number | string, method: string, ...args: unknown[]): void;
  a?: unknown[];
  l?: number;
};

type YandexMetrikaWindow = Window & {
  ym?: YandexMetrikaFunction;
  __ymIds?: Array<number | string>;
  __ymInitializedIds?: Array<number | string>;
};

type YandexMetrikaProps = {
  yid: number | string;
  clickmap?: boolean;
  trackLinks?: boolean;
  accurateTrackBounce?: boolean;
  webvisor?: boolean;
};

export default function YandexMetrika({
  yid,
  clickmap = true,
  trackLinks = true,
  accurateTrackBounce = true,
  webvisor = false,
}: YandexMetrikaProps) {
  const initCounter = useCallback(() => {
    const analyticsWindow = window as YandexMetrikaWindow;

    if (typeof analyticsWindow.ym !== 'function') {
      return;
    }

    analyticsWindow.__ymIds = analyticsWindow.__ymIds || [];
    analyticsWindow.__ymInitializedIds = analyticsWindow.__ymInitializedIds || [];

    if (!analyticsWindow.__ymInitializedIds.includes(yid)) {
      analyticsWindow.ym(yid, 'init', {
        clickmap,
        trackLinks,
        accurateTrackBounce,
        webvisor,
        defer: true,
      });
      analyticsWindow.__ymInitializedIds.push(yid);
    }

    if (!analyticsWindow.__ymIds.includes(yid)) {
      analyticsWindow.__ymIds.push(yid);
    }
  }, [accurateTrackBounce, clickmap, trackLinks, webvisor, yid]);

  useEffect(() => {
    const analyticsWindow = window as YandexMetrikaWindow;

    if (typeof analyticsWindow.ym !== 'function') {
      const queuedYm: YandexMetrikaFunction = (...args) => {
        queuedYm.a = queuedYm.a || [];
        queuedYm.a.push(args);
      };
      queuedYm.l = Date.now();
      analyticsWindow.ym = queuedYm;
    }
    initCounter();
  }, [initCounter]);

  return (
    <>
      <Script
        id={`ym-loader-${yid}`} // уникальный id скрипта
        src="https://mc.yandex.ru/metrika/tag.js"
        strategy="afterInteractive"
        onLoad={initCounter}
        onReady={initCounter}
      />
      <noscript>
        <div>
          {/* Пиксель для браузеров без JS */}
          <img
            src={`https://mc.yandex.ru/watch/${yid}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
