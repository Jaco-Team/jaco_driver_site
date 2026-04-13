import React, { useEffect } from 'react';

import dynamic from 'next/dynamic'
import useSession from '@/components/sessionHook';
import { useRouter } from 'next/navigation'

const DynamicHeader = dynamic(() => import('@/modules/header.jsx'))
const DynamicHomePage = dynamic(() => import('@/modules/statistics_page.jsx'))

import { useHeaderStore } from '@/components/store.js';

export default function Statistics() {

  const router = useRouter();
  const session = useSession();

  const [setActivePageRU] = useHeaderStore(state => [state.setActivePageRU]);

  useEffect(() => {
    setActivePageRU('Статистика');

    if(session.isAuth === 'load'){
      return;
    }

    if(session.isAuth === false){
      router.push('/auth', { scroll: false })
    }
  }, [router, session.isAuth, setActivePageRU])

  return (
    <>
      <DynamicHeader />
      <DynamicHomePage />
    </>
  )
}
