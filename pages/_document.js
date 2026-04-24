import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';
import { DocumentHeadTags, documentGetInitialProps } from '@mui/material-nextjs/v16-pagesRouter';

import { roboto } from '@/shared/ui/Font';

//console.log( roboto )

export default function Document(props) {
  return (
    <Html lang="ru" data-scroll="0">
      <Head>
        <meta name="emotion-insertion-point" content="" />
        <DocumentHeadTags {...props} />
        <Script
          src="https://api-maps.yandex.ru/2.1/?apikey=a94b4ec2-1216-48fa-a6a6-0f7cca9b4135&lang=ru_RU"
          strategy="beforeInteractive"
        />
        <Script
          src="https://yookassa.ru/checkout-widget/v1/checkout-widget.js"
          strategy="beforeInteractive"
        />
      </Head>
      <body className={roboto.variable}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

Document.getInitialProps = async (ctx) => {
  const finalProps = await documentGetInitialProps(ctx);
  return finalProps;
};
