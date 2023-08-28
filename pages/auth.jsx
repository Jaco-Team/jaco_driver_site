import React, { useEffect } from 'react';

import dynamic from 'next/dynamic'

const DynamicHomePage = dynamic(() => import('@/modules/auth.jsx'))

import { useHeaderStore } from '@/components/store.js';

export default function Auth() {

  const [ setActivePageRU ] = useHeaderStore( state => [ state.setActivePageRU ] )

  useEffect( () => {
    setActivePageRU('Авторизация');
  }, [] )

  return (
    <>
      <DynamicHomePage />
    </>
  )
}