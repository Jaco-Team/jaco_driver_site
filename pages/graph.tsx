import { useEffect } from 'react';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

import Meta from '@/components/meta';
import useSession from '@/components/sessionHook';
import { useHeaderStore } from '@/features/header/model/header.store';
import GraphScreen from '@/widgets/graph-screen/ui/GraphScreen';

const DynamicHeader = dynamic(() => import('@/modules/header.jsx'));

export default function GraphPage() {
  const router = useRouter();
  const session = useSession();
  const setActivePageRU = useHeaderStore((state) => state.setActivePageRU);

  useEffect(() => {
    setActivePageRU('График работы');

    if (session.isAuth === 'load') {
      return;
    }

    if (session.isAuth === false) {
      router.push('/auth', { scroll: false });
    }
  }, [router, session.isAuth, setActivePageRU]);

  return (
    <Meta title="График работы">
      <DynamicHeader />
      <GraphScreen />
    </Meta>
  );
}
