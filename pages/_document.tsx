import { Html, Head, Main, NextScript } from 'next/document';
import type { DocumentContext, DocumentInitialProps } from 'next/document';
import {
  DocumentHeadTags,
  createEmotionCache,
  documentGetInitialProps,
  type DocumentHeadTagsProps,
} from '@mui/material-nextjs/v16-pagesRouter';

import { roboto } from '@/shared/ui/Font';

type DocumentProps = DocumentInitialProps & DocumentHeadTagsProps;

export default function Document(props: DocumentProps) {
  return (
    <Html lang="ru" data-scroll="0">
      <Head>
        <DocumentHeadTags {...props} />
      </Head>
      <body className={roboto.variable}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

Document.getInitialProps = async (ctx: DocumentContext) => {
  const finalProps = await documentGetInitialProps(ctx, {
    emotionCache: createEmotionCache({ key: 'css' }),
  });
  return finalProps;
};
