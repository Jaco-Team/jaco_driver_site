import React, { useEffect } from 'react';

import dynamic from 'next/dynamic'
import useSession from '@/components/sessionHook';
import { useRouter } from 'next/navigation'

const DynamicHeader = dynamic(() => import('@/modules/header.jsx'))
const DynamicHomePage = dynamic(() => import('@/modules/list.jsx'))

import { useOrdersStore, useHeaderStore } from '@/components/store.js';

export default function List() {

  const router = useRouter();
  const session = useSession();

  const [ setActivePageRU ] = useHeaderStore( state => [ state.setActivePageRU ] )
  const [ getOrders, setToken ] = useOrdersStore( state => [ state.getOrders, state.setToken ] )
  
  useEffect( () => {
    setActivePageRU('Список заказов');

    if( session.isAuth === false ){
      router.push('/auth', { scroll: false })
    }
    if( session.isAuth === true ){
      setToken(session?.token);
      getOrders();
    }
  }, [] )

  return (
    <>
      <DynamicHeader />
      <DynamicHomePage />
    </>
  )
}
