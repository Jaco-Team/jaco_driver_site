import React, { useEffect } from 'react';

import dynamic from 'next/dynamic'
import useSession from '@/components/sessionHook';
import { useRouter } from 'next/navigation'

const DynamicHeader = dynamic(() => import('@/modules/header.jsx'))
const DynamicHomePage = dynamic(() => import('@/modules/settings.jsx'))

import { useHeaderStore } from '@/components/store.js';

export default function Settings(props) {

  const router = useRouter();
  const session = useSession();

  const [ setActivePageRU ] = useHeaderStore( state => [ state.setActivePageRU ] )

  useEffect( () => {
    setActivePageRU('Настройки');

    if( session.isAuth === false ){
      router.push('/auth', { scroll: false })
    }
  }, [] )

  return (
    <>
      <DynamicHeader />
      <DynamicHomePage />
    </>
  )
}