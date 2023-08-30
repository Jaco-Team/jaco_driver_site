import { Html, Head, Main, NextScript } from 'next/document'

import { roboto } from '@/ui/Font.js';

//console.log( roboto )

export default function Document() {
  return (
    <Html lang="ru" data-scroll="0">
      <Head />
      <script src="https://api-maps.yandex.ru/2.1/?apikey=e4836399-cf83-49a0-806f-abf5ab552228&lang=ru_RU" type="text/javascript"></script>
      <script src="https://yookassa.ru/checkout-widget/v1/checkout-widget.js"></script>
      <body className={roboto.variable}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}