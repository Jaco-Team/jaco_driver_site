import { useCallback, useEffect, useMemo } from 'react';
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
  yid?: number | string;
  ids?: Array<number | string>;
  clickmap?: boolean;
  trackLinks?: boolean;
  accurateTrackBounce?: boolean;
  webvisor?: boolean;
};

function uniqueIds(yid?: number | string, ids?: Array<number | string>): string[] {
  const list = [...(ids ?? []), ...(yid != null && `${yid}`.trim() ? [yid] : [])]
    .map((id) => String(id).trim())
    .filter(Boolean);

  return [...new Set(list)];
}

export default function YandexMetrika({
  yid,
  ids,
  clickmap = true,
  trackLinks = true,
  accurateTrackBounce = true,
  webvisor = false,
}: YandexMetrikaProps) {
  const counterIds = useMemo(() => uniqueIds(yid, ids), [ids, yid]);

  const initCounter = useCallback(() => {
    const analyticsWindow = window as YandexMetrikaWindow;

    if (typeof analyticsWindow.ym !== 'function' || counterIds.length === 0) {
      return;
    }

    analyticsWindow.__ymIds = analyticsWindow.__ymIds || [];
    analyticsWindow.__ymInitializedIds = analyticsWindow.__ymInitializedIds || [];

    counterIds.forEach((id) => {
      if (!analyticsWindow.__ymInitializedIds?.includes(id)) {
        analyticsWindow.ym?.(id, 'init', {
          clickmap,
          trackLinks,
          accurateTrackBounce,
          webvisor,
          defer: true,
        });
        analyticsWindow.__ymInitializedIds?.push(id);
      }

      if (!analyticsWindow.__ymIds?.includes(id)) {
        analyticsWindow.__ymIds?.push(id);
      }
    });
  }, [accurateTrackBounce, clickmap, counterIds, trackLinks, webvisor]);

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

  if (counterIds.length === 0) {
    return null;
  }

  return (
    <>
      <Script
        id="ym-loader"
        src="https://mc.yandex.ru/metrika/tag.js"
        strategy="afterInteractive"
        onLoad={initCounter}
        onReady={initCounter}
      />
      <noscript>
        <div>
          {counterIds.map((id) => (
            <img
              key={id}
              src={`https://mc.yandex.ru/watch/${id}`}
              style={{ position: 'absolute', left: '-9999px' }}
              alt=""
            />
          ))}
        </div>
      </noscript>
    </>
  );
}
