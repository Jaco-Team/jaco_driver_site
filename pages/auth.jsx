import React, { useEffect } from 'react';

import dynamic from 'next/dynamic'

const DynamicHomePage = dynamic(() => import('@/modules/auth.jsx'))

import { useHeaderStore } from '@/components/store.js';

import { useRouter } from 'next/navigation'
import useSession from '@/components/sessionHook';

export default function Auth() {
  const session = useSession();
  const router = useRouter();

  const [ setActivePageRU ] = useHeaderStore( state => [ state.setActivePageRU ] )

  useEffect( () => {
    setActivePageRU('Авторизация');

    if( session.isAuth === true ){
      router.push('/list_orders', { scroll: false })
    }
  }, [] )

  return (
    <>
      <DynamicHomePage />
    </>
  )
}
