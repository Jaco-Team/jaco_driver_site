import Head from 'next/head';
import type { ReactNode } from 'react';

type MetaProps = {
  title: string;
  children?: ReactNode;
};

export default function Meta({ title, children }: MetaProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </Head>
      {children}
    </>
  );
}
