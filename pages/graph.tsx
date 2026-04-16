import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import Meta from '@/components/meta';
import useSession from '@/components/sessionHook';
import { useHeaderStore } from '@/features/header/model/header.store';
import { AppHeader } from '@/widgets/app-header/ui/AppHeader';
import GraphScreen from '@/widgets/graph-screen/ui/GraphScreen';

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
      <AppHeader />
      <GraphScreen />
    </Meta>
  );
}
