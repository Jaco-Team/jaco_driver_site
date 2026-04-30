import React, { useEffect } from 'react';

import dynamic from 'next/dynamic';

const DynamicHomePage = dynamic(() => import('@/widgets/auth-screen/ui/AuthScreen'));

import { useHeaderStore } from '@/features/header/model/header.store';

import { useRouter } from 'next/navigation';
import useSession from '@/components/sessionHook';

export default function Auth() {
  const session = useSession();
  const router = useRouter();

  const setActivePageRU = useHeaderStore((state) => state.setActivePageRU);

  useEffect(() => {
    setActivePageRU('Авторизация');

    if (session.isAuth === 'load') {
      return;
    }

    if (session.isAuth === true) {
      router.push('/list_orders', { scroll: false });
    }
  }, [router, session.isAuth, setActivePageRU]);

  return (
    <>
      <DynamicHomePage />
    </>
  );
}
