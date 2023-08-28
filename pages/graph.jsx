import React, { useEffect } from 'react';

import dynamic from 'next/dynamic'

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'

const DynamicHeader = dynamic(() => import('@/modules/header.jsx'))
const DynamicHomePage = dynamic(() => import('@/modules/graph.jsx'))

import { useHeaderStore } from '@/components/store.js';

export default function Graph(props) {

  const router = useRouter();
  const session = useSession();

  const [ setActivePageRU ] = useHeaderStore( state => [ state.setActivePageRU ] )

  useEffect( () => {
    setActivePageRU('График работы');
  }, [] )

  useEffect(() => {
    if( session.status == 'unauthenticated' ){
      router.push('/auth', { scroll: false })
    }
  }, [session] );

  return (
    <>
      <DynamicHeader />
      <DynamicHomePage />
    </>
  )
}