import { Html, Head, Main, NextScript } from 'next/document'

import { roboto } from '@/ui/Font.js';

//console.log( roboto )

export default function Document() {
  return (
    <Html lang="ru" data-scroll="0">
      <Head />
      <script src="https://api-maps.yandex.ru/2.1/?apikey=a94b4ec2-1216-48fa-a6a6-0f7cca9b4135&lang=ru_RU" type="text/javascript"></script>
      <script src="https://yookassa.ru/checkout-widget/v1/checkout-widget.js"></script>
      <body className={roboto.variable}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
