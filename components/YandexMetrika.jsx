import Script from 'next/script';

export default function YandexMetrika({
  yid,
  clickmap = true,
  trackLinks = true,
  accurateTrackBounce = true,
  webvisor = false,
}) {
  const init = `
    (function(m,e,t,r,i,k,a){
      m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      k=e.createElement(t),a=e.getElementsByTagName(t)[0];
      k.async=1;k.src=r;a.parentNode.insertBefore(k,a)
    })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

    ym(${yid}, "init", {
      clickmap:${clickmap},
      trackLinks:${trackLinks},
      accurateTrackBounce:${accurateTrackBounce},
      webvisor:${webvisor},
      defer:true
    });

    // запоминаем ID счётчика, чтобы обёртка могла слать события во все активные
    (function(w){
      w.__ymIds = w.__ymIds || [];
      if (w.__ymIds.indexOf(${yid}) === -1) w.__ymIds.push(${yid});
    })(window);
  `;

  return (
    <>
      <Script
        id={`ym-loader-${yid}`}              // уникальный id скрипта
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: init }}
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
