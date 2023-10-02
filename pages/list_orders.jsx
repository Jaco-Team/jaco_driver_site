import React, { useEffect, useState } from 'react';

import dynamic from 'next/dynamic'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'

const DynamicHeader = dynamic(() => import('@/modules/header.jsx'))
const DynamicHomePage = dynamic(() => import('@/modules/list.jsx'))

import { useOrdersStore, useHeaderStore } from '@/components/store.js';

export default function List() {

  const router = useRouter();
  const session = useSession();

  const [ setActivePageRU ] = useHeaderStore( state => [ state.setActivePageRU ] )
  const [ getOrders, setToken ] = useOrdersStore( state => [ state.getOrders, state.setToken ] )
  
  const [ isLoad, setIsLoad ] = useState(false);

  useEffect( () => {
    setActivePageRU('Список заказов');
  }, [] )

  useEffect(() => {
    if( session.status == 'authenticated' ){
      setToken(session.data?.user?.token);
      getOrders();
    }

    if( session.status == 'unauthenticated' ){
      router.push('/auth', { scroll: false })
    }

    if( session.status == 'authenticated' && isLoad === false ){
      setIsLoad(true)
    }
  }, [session] );

  return (
    !isLoad ? 
      <></> 
        :
      <>
        <DynamicHeader />
        <DynamicHomePage />
      </>
  )
}
