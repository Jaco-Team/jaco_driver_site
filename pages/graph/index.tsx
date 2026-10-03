import { useEffect } from 'react';
import { useRouter } from 'next/router';

import Meta from '@/components/meta';
import { useHeaderStore } from '@/features/header/model/header.store';
import { useProtectedRoute } from '@/shared/lib/session/useProtectedRoute';
import { AppHeader } from '@/widgets/app-header/ui/AppHeader';
import GraphScreen from '@/widgets/graph-screen/ui/GraphScreen';
import { GraphUiPreview } from '@/widgets/graph-screen/ui/GraphUiPreview';

export default function GraphPage() {
  const router = useRouter();
  const { isAuthenticated } = useProtectedRoute();
  const setActivePageRU = useHeaderStore((state) => state.setActivePageRU);

  useEffect(() => {
    setActivePageRU('График работы');
  }, [setActivePageRU]);

  if (!isAuthenticated || (process.env.NODE_ENV === 'development' && !router.isReady)) {
    return null;
  }

  const showLocalPreview =
    process.env.NODE_ENV === 'development' &&
    typeof window !== 'undefined' &&
    ['localhost', '127.0.0.1'].includes(window.location.hostname) &&
    router.query.uiPreview === '1';

  return (
    <Meta title="График работы">
      <AppHeader />
      {showLocalPreview ? <GraphUiPreview /> : <GraphScreen />}
    </Meta>
  );
}
