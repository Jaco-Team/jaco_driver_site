import React, { useEffect } from 'react';

import dynamic from 'next/dynamic'

const DynamicHomePage = dynamic(() => import('@/modules/registration'))

import { useHeaderStore } from '@/components/store.js';

export default function Registration() {

  const [ setActivePageRU ] = useHeaderStore( state => [ state.setActivePageRU ] )

  useEffect( () => {
    setActivePageRU('Восстановление пароля');
  }, [] )

  return (
    <>
      <DynamicHomePage />
    </>
  )
}